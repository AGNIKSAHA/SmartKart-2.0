import type { Request, Response } from "express";
import { stripe } from "../../common/config/stripe.js";
import { env } from "../../common/config/env.js";
import { AppError } from "../../common/middleware/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { sendEmail } from "../../common/utils/mail.js";
import { cartStore } from "../cart/cart.store.js";
import { notificationStore } from "../notification/notification.store.js";
import { orderStore } from "../order/order.store.js";
import { productStore } from "../product/product.store.js";
import { userStore } from "../user/user.store.js";

export const paymentController = {
  /**
   * Creates a Stripe Checkout Session for the current user's cart.
   * The order is created with status "pending" first, then the user is
   * redirected to Stripe to pay.
   */
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const payload = req.body as {
      shippingDetails: {
        recipientName: string;
        address: string;
        mobileNumber: string;
        alternateNumber?: string;
      };
    };

    const user = await userStore.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const cartItems = await cartStore.getByUserId(userId);
    if (cartItems.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // Build order items and validate stock
    const orderItemsWithOwner = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await productStore.findByIdWithShopkeeper(
          cartItem.productId,
        );
        if (!product) {
          throw new AppError(
            `Product not found for cart item ${cartItem.productId}`,
            404,
          );
        }

        if (cartItem.quantity > product.stock) {
          throw new AppError(`Insufficient stock for ${product.title}`, 400);
        }

        return {
          productId: product.id,
          title: product.title,
          unitPrice: product.price,
          quantity: cartItem.quantity,
          imageUrl: product.imageUrl,
          ...(product.shopkeeperId
            ? { shopkeeperId: product.shopkeeperId }
            : {}),
        };
      }),
    );

    const orderItems = orderItemsWithOwner.map((item) => ({
      productId: item.productId,
      title: item.title,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    // Create the order with "pending" status
    const order = await orderStore.create({
      userId,
      items: orderItems,
      totalAmount,
      shippingDetails: payload.shippingDetails,
      status: "pending",
    });

    // Build Stripe line items
    const lineItems = orderItemsWithOwner.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
        },
        unit_amount: Math.round(item.unitPrice * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        userId,
      },
      customer_email: user.email,
      success_url: `${env.CORS_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CORS_ORIGIN}/checkout/cancel?order_id=${order.id}`,
    });

    sendResponse(res, 200, "Checkout session created", {
      sessionId: session.id,
      sessionUrl: session.url,
    });
  },

  /**
   * Stripe webhook handler – listens for checkout.session.completed events.
   * When a payment succeeds, the order status is updated from "pending" to "paid",
   * the cart is cleared, and notifications are sent.
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      throw new AppError("Missing Stripe signature", 400);
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      throw new AppError(
        `Webhook signature verification failed: ${message}`,
        400,
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId || !userId) {
        res.status(200).json({ received: true });
        return;
      }

      // Mark order as paid
      const order = await orderStore.markAsPaid(orderId);
      if (!order) {
        res.status(200).json({ received: true });
        return;
      }

      // Save Stripe session ID on the order for potential refunds
      await orderStore.setStripeSessionId(orderId, session.id);

      // Decrement stock for each purchased item
      await productStore.decrementStock(
        order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );

      // Clear the user's cart
      await cartStore.clearByUserId(userId);

      // Send notifications
      const totalQuantity = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const itemQuantities = order.items
        .map((item) => `${item.title} x${item.quantity}`)
        .join(", ");

      await notificationStore.create({
        targetRole: "shopkeeper",
        title: "New Paid Order Received",
        message: `Customer: ${order.shippingDetails.recipientName} | Mobile: ${order.shippingDetails.mobileNumber} | Address: ${order.shippingDetails.address} | Quantity: ${totalQuantity} | Items: ${itemQuantities} | Total: $${order.totalAmount.toFixed(2)} | Payment: Stripe`,
        orderId: order.id,
      });

      // Notify consumer
      await notificationStore.create({
        targetRole: "consumer",
        title: "Payment Successful",
        message: `Your payment of $${order.totalAmount.toFixed(2)} for order #${order.id.slice(0, 8)} was successful. Items: ${itemQuantities} | Shipping to: ${order.shippingDetails.address}`,
        orderId: order.id,
      });

      // Email shopkeepers
      const shopkeeperIds = [
        ...new Set(
          (
            await Promise.all(
              order.items.map(async (item) => {
                const product = await productStore.findByIdWithShopkeeper(
                  item.productId,
                );
                return product?.shopkeeperId;
              }),
            )
          ).filter(
            (value): value is string =>
              typeof value === "string" && value.length > 0,
          ),
        ),
      ];

      if (shopkeeperIds.length > 0) {
        const shopkeepers = await Promise.all(
          shopkeeperIds.map((id) => userStore.findById(id)),
        );
        const recipientEmails = shopkeepers
          .filter((shopkeeper): shopkeeper is NonNullable<typeof shopkeeper> =>
            Boolean(shopkeeper),
          )
          .filter((shopkeeper) => shopkeeper.role === "shopkeeper")
          .map((shopkeeper) => shopkeeper.email);

        await Promise.allSettled(
          recipientEmails.map((email) =>
            sendEmail({
              to: email,
              subject: "New paid order received",
              text: `Customer: ${order.shippingDetails.recipientName}\nMobile: ${order.shippingDetails.mobileNumber}\nAddress: ${order.shippingDetails.address}\nQuantity: ${totalQuantity}\nItems: ${itemQuantities}\nTotal: $${order.totalAmount.toFixed(2)}\nPayment: Stripe\nOrder ID: ${order.id}`,
            }),
          ),
        );
      }

      // Email consumer
      const consumer = await userStore.findById(userId);
      if (consumer) {
        await sendEmail({
          to: consumer.email,
          subject: "Payment successful – Order confirmed",
          text: `Hi ${order.shippingDetails.recipientName},\n\nYour payment of $${order.totalAmount.toFixed(2)} was successful!\n\nOrder ID: ${order.id}\nItems: ${itemQuantities}\nTotal: $${order.totalAmount.toFixed(2)}\nShipping to: ${order.shippingDetails.address}\n\nThank you for your purchase!`,
        }).catch(() => {
          /* best-effort */
        });
      }
    }

    res.status(200).json({ received: true });
  },

  /**
   * Verify a checkout session status (used by the frontend success page).
   */
  async getSessionStatus(req: Request, res: Response): Promise<void> {
    const sessionId = req.query.session_id;
    if (!sessionId || typeof sessionId !== "string") {
      throw new AppError("session_id query parameter is required", 400);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    sendResponse(res, 200, "Session status retrieved", {
      status: session.payment_status,
      orderId: session.metadata?.orderId ?? null,
      customerEmail: session.customer_email,
    });
  },

  /**
   * Cancel a paid order – issues a Stripe refund, restores stock,
   * and notifies shopkeepers.
   */
  async cancelPaidOrder(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const orderId = req.params.orderId;
    if (!orderId) {
      throw new AppError("Order id is required", 400);
    }

    // Cancel the order (must be "paid" status)
    const order = await orderStore.cancelPaidOrder(orderId, userId);
    if (!order) {
      throw new AppError(
        "Order not found, already cancelled, or not eligible for cancellation",
        404,
      );
    }

    // Issue Stripe refund if we have the session ID
    if (order.stripeSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(
          order.stripeSessionId,
        );
        if (session.payment_intent) {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent.id;

          await stripe.refunds.create({
            payment_intent: paymentIntentId,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Stripe refund failed for order ${orderId}: ${message}`);
        // We still proceed – order is already cancelled in DB
      }
    }

    // Restore stock for each item
    await productStore.restoreStock(
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    // Send notifications
    const totalQuantity = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const itemQuantities = order.items
      .map((item) => `${item.title} x${item.quantity}`)
      .join(", ");

    await notificationStore.create({
      targetRole: "shopkeeper",
      title: "Paid Order Cancelled & Refunded",
      message: `Customer: ${order.shippingDetails.recipientName} | Mobile: ${order.shippingDetails.mobileNumber} | Address: ${order.shippingDetails.address} | Quantity: ${totalQuantity} | Items: ${itemQuantities} | Total: $${order.totalAmount.toFixed(2)} | Refunded via Stripe`,
      orderId: order.id,
    });

    // Notify consumer
    await notificationStore.create({
      targetRole: "consumer",
      title: "Order Cancelled & Refund Initiated",
      message: `Your order #${order.id.slice(0, 8)} has been cancelled. A refund of $${order.totalAmount.toFixed(2)} has been initiated to your original payment method. Items: ${itemQuantities}`,
      orderId: order.id,
    });

    // Email shopkeepers
    const shopkeeperIds = [
      ...new Set(
        (
          await Promise.all(
            order.items.map(async (item) => {
              const product = await productStore.findByIdWithShopkeeper(
                item.productId,
              );
              return product?.shopkeeperId;
            }),
          )
        ).filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        ),
      ),
    ];

    if (shopkeeperIds.length > 0) {
      const shopkeepers = await Promise.all(
        shopkeeperIds.map((id) => userStore.findById(id)),
      );
      const recipientEmails = shopkeepers
        .filter((shopkeeper): shopkeeper is NonNullable<typeof shopkeeper> =>
          Boolean(shopkeeper),
        )
        .filter((shopkeeper) => shopkeeper.role === "shopkeeper")
        .map((shopkeeper) => shopkeeper.email);

      await Promise.allSettled(
        recipientEmails.map((email) =>
          sendEmail({
            to: email,
            subject: "Paid order cancelled & refunded",
            text: `Customer: ${order.shippingDetails.recipientName}\nMobile: ${order.shippingDetails.mobileNumber}\nAddress: ${order.shippingDetails.address}\nQuantity: ${totalQuantity}\nItems: ${itemQuantities}\nTotal: $${order.totalAmount.toFixed(2)}\nRefunded via Stripe\nOrder ID: ${order.id}`,
          }),
        ),
      );
    }

    // Email consumer
    const consumer = await userStore.findById(userId);
    if (consumer) {
      await sendEmail({
        to: consumer.email,
        subject: "Order cancelled – Refund initiated",
        text: `Hi ${order.shippingDetails.recipientName},\n\nYour order #${order.id.slice(0, 8)} has been cancelled.\nA refund of $${order.totalAmount.toFixed(2)} has been initiated to your original payment method.\n\nItems: ${itemQuantities}\nTotal refunded: $${order.totalAmount.toFixed(2)}\n\nPlease allow 5-10 business days for the refund to appear.`,
      }).catch(() => {
        /* best-effort */
      });
    }

    sendResponse(res, 200, "Order cancelled and refund initiated", order);
  },
};
