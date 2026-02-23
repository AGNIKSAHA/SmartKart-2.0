import { stripe } from "../../common/config/stripe.js";
import type Stripe from "stripe";
import { env } from "../../common/config/env.js";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendEmail } from "../../common/utils/mail.js";
import { cartStore } from "../cart/cart.store.js";
import { notificationStore } from "../notification/notification.store.js";
import { orderStore } from "../order/order.store.js";
import { productStore } from "../product/product.store.js";
import { userStore } from "../user/user.store.js";

async function processSuccessfulPayment(
  orderId: string,
  userId: string,
  sessionId: string,
): Promise<void> {
  const order = await orderStore.markAsPaid(orderId);
  if (!order) return;

  await orderStore.setStripeSessionId(orderId, sessionId);

  await productStore.decrementStock(
    order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  );

  await cartStore.clearByUserId(userId);

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

  await notificationStore.create({
    targetRole: "consumer",
    title: "Payment Successful",
    message: `Your payment of $${order.totalAmount.toFixed(2)} for order #${order.id.slice(0, 8)} was successful. Items: ${itemQuantities} | Shipping to: ${order.shippingDetails.address}`,
    orderId: order.id,
  });

  const shopkeeperIdToAlerts = new Map<
    string,
    { outOfStock: string[]; lowStock: string[] }
  >();
  const shopkeeperIds = new Set<string>();

  await Promise.all(
    order.items.map(async (item) => {
      const product = await productStore.findByIdWithShopkeeper(item.productId);
      if (product && product.shopkeeperId) {
        shopkeeperIds.add(product.shopkeeperId);

        if (product.stock === 0) {
          const alerts = shopkeeperIdToAlerts.get(product.shopkeeperId) || {
            outOfStock: [],
            lowStock: [],
          };
          alerts.outOfStock.push(product.title);
          shopkeeperIdToAlerts.set(product.shopkeeperId, alerts);
        } else if (product.stock <= 5) {
          const alerts = shopkeeperIdToAlerts.get(product.shopkeeperId) || {
            outOfStock: [],
            lowStock: [],
          };
          alerts.lowStock.push(`${product.title} (${product.stock} left)`);
          shopkeeperIdToAlerts.set(product.shopkeeperId, alerts);
        }
      }
    }),
  );

  if (shopkeeperIds.size > 0) {
    const shopkeepers = await Promise.all(
      Array.from(shopkeeperIds).map((id) => userStore.findById(id)),
    );

    await Promise.allSettled(
      shopkeepers.map(async (shopkeeper) => {
        if (!shopkeeper || shopkeeper.role !== "shopkeeper") return;

        const alerts = shopkeeperIdToAlerts.get(shopkeeper.id);
        const alertMessages: string[] = [];

        if (alerts?.outOfStock.length) {
          const msg = `OUT OF STOCK: ${alerts.outOfStock.join(", ")}`;
          alertMessages.push(msg);
          await notificationStore.create({
            targetRole: "shopkeeper",
            title: "Product Out of Stock",
            message: msg,
          });
        }

        if (alerts?.lowStock.length) {
          const msg = `LOW STOCK ALERT: ${alerts.lowStock.join(", ")}`;
          alertMessages.push(msg);
          await notificationStore.create({
            targetRole: "shopkeeper",
            title: "Product Low Stock",
            message: msg,
          });
        }

        const alertText =
          alertMessages.length > 0
            ? `\n\nSTOCK ALERTS:\n${alertMessages.join("\n")}`
            : "";

        await sendEmail({
          to: shopkeeper.email,
          subject: "New paid order received",
          text: `Customer: ${order.shippingDetails.recipientName}\nMobile: ${order.shippingDetails.mobileNumber}\nAddress: ${order.shippingDetails.address}\nQuantity: ${totalQuantity}\nItems: ${itemQuantities}\nTotal: $${order.totalAmount.toFixed(2)}\nPayment: Stripe\nOrder ID: ${order.id}${alertText}`,
        });
      }),
    );
  }

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

export const paymentService = {
  async createCheckoutSession(
    userId: string,
    shippingDetails: {
      recipientName: string;
      address: string;
      mobileNumber: string;
      alternateNumber?: string;
    },
  ) {
    const user = await userStore.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const cartItems = await cartStore.getByUserId(userId);
    if (cartItems.length === 0) throw new AppError("Cart is empty", 400);

    const orderItemsWithOwner = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await productStore.findByIdWithShopkeeper(
          cartItem.productId,
        );
        if (!product)
          throw new AppError(
            `Product not found for cart item ${cartItem.productId}`,
            404,
          );
        if (cartItem.quantity > product.stock)
          throw new AppError(`Insufficient stock for ${product.title}`, 400);

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

    const order = await orderStore.create({
      userId,
      items: orderItems,
      totalAmount,
      shippingDetails,
      status: "pending",
    });

    const lineItems = orderItemsWithOwner.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

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

    return { sessionId: session.id, sessionUrl: session.url };
  },

  async handleWebhook(body: Buffer, signature: string) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
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
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId || !userId) return;

      await processSuccessfulPayment(orderId, userId, session.id);
    }
  },

  async getSessionStatus(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status === "paid" &&
      session.metadata?.orderId &&
      session.metadata?.userId
    ) {
      await processSuccessfulPayment(
        session.metadata.orderId,
        session.metadata.userId,
        session.id,
      );
    }

    return {
      status: session.payment_status,
      orderId: session.metadata?.orderId ?? null,
      customerEmail: session.customer_email,
    };
  },

  async cancelPaidOrder(orderId: string, userId: string) {
    const order = await orderStore.cancelPaidOrder(orderId, userId);
    if (!order)
      throw new AppError(
        "Order not found, already cancelled, or not eligible for cancellation",
        404,
      );

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
          await stripe.refunds.create({ payment_intent: paymentIntentId });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Stripe refund failed for order ${orderId}: ${message}`);
      }
    }

    await productStore.restoreStock(
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

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

    await notificationStore.create({
      targetRole: "consumer",
      title: "Order Cancelled & Refund Initiated",
      message: `Your order #${order.id.slice(0, 8)} has been cancelled. A refund of $${order.totalAmount.toFixed(2)} has been initiated to your original payment method. Items: ${itemQuantities}`,
      orderId: order.id,
    });

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

    return order;
  },
};
