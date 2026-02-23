import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendEmail } from "../../common/utils/mail.js";
import { cartStore } from "../cart/cart.store.js";
import { notificationStore } from "../notification/notification.store.js";
import { orderStore } from "./order.store.js";
import { productStore } from "../product/product.store.js";
import { userStore } from "../user/user.store.js";

export const orderService = {
  async listMyOrders(userId: string) {
    return orderStore.listByUserId(userId);
  },

  async createOrder(
    userId: string,
    shippingDetails: {
      recipientName: string;
      address: string;
      mobileNumber: string;
      alternateNumber?: string;
    },
  ) {
    const user = await userStore.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const cartItems = await cartStore.getByUserId(userId);
    if (cartItems.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

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
    const totalQuantity = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const itemQuantities = orderItems
      .map((item) => `${item.title} x${item.quantity}`)
      .join(", ");

    const order = await orderStore.create({
      userId,
      items: orderItems,
      totalAmount,
      shippingDetails,
      status: "pending",
    });

    await notificationStore.create({
      targetRole: "shopkeeper",
      title: "New Order Received",
      message: `Customer: ${shippingDetails.recipientName} | Mobile: ${shippingDetails.mobileNumber} | Address: ${shippingDetails.address} | Quantity: ${totalQuantity} | Items: ${itemQuantities} | Total: $${totalAmount.toFixed(2)}`,
      orderId: order.id,
    });

    // Notify consumer
    await notificationStore.create({
      targetRole: "consumer",
      title: "Order Placed Successfully",
      message: `Your order #${order.id.slice(0, 8)} has been placed. Items: ${itemQuantities} | Total: $${totalAmount.toFixed(2)} | Shipping to: ${shippingDetails.address}`,
      orderId: order.id,
    });

    const shopkeeperIds = [
      ...new Set(
        orderItemsWithOwner
          .map((item) => item.shopkeeperId)
          .filter(
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
            subject: "New order received",
            text: `Customer: ${shippingDetails.recipientName}\nMobile: ${shippingDetails.mobileNumber}\nAddress: ${shippingDetails.address}\nQuantity: ${totalQuantity}\nItems: ${itemQuantities}\nTotal: $${totalAmount.toFixed(2)}\nOrder ID: ${order.id}`,
          }),
        ),
      );
    }

    await cartStore.clearByUserId(userId);
    return order;
  },

  async cancelOrder(userId: string, orderId: string) {
    const order = await orderStore.cancelByIdForUser(orderId, userId);
    if (!order) {
      throw new AppError("Order not found or cannot be cancelled", 404);
    }

    const totalQuantity = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const itemQuantities = order.items
      .map((item) => `${item.title} x${item.quantity}`)
      .join(", ");

    await notificationStore.create({
      targetRole: "shopkeeper",
      title: "Order Cancelled",
      message: `Customer: ${order.shippingDetails.recipientName} | Mobile: ${order.shippingDetails.mobileNumber} | Address: ${order.shippingDetails.address} | Quantity: ${totalQuantity} | Items: ${itemQuantities} | Total: $${order.totalAmount.toFixed(2)}`,
      orderId: order.id,
    });

    // Notify consumer
    await notificationStore.create({
      targetRole: "consumer",
      title: "Order Cancelled",
      message: `Your order #${order.id.slice(0, 8)} has been cancelled. Items: ${itemQuantities} | Total: $${order.totalAmount.toFixed(2)}`,
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
            subject: "Order cancelled",
            text: `Customer: ${order.shippingDetails.recipientName}\nMobile: ${order.shippingDetails.mobileNumber}\nAddress: ${order.shippingDetails.address}\nQuantity: ${totalQuantity}\nItems: ${itemQuantities}\nTotal: $${order.totalAmount.toFixed(2)}\nOrder ID: ${order.id}`,
          }),
        ),
      );
    }

    return order;
  },
};
