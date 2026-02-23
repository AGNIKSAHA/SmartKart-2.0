import { AppError } from "../../common/middlewares/error.middleware.js";
import { notificationStore } from "./notification.store.js";

export const notificationService = {
  async listByRole(role: string) {
    if (!role) {
      throw new AppError("Unauthorized", 401);
    }
    return notificationStore.listByRole(role as "consumer" | "shopkeeper");
  },

  async unreadCountByRole(role: string) {
    if (!role) {
      throw new AppError("Unauthorized", 401);
    }
    return notificationStore.unreadCountByRole(
      role as "consumer" | "shopkeeper",
    );
  },

  async markRead(notificationId: string, role: string) {
    if (!role) {
      throw new AppError("Unauthorized", 401);
    }
    if (!notificationId) {
      throw new AppError("Notification id is required", 400);
    }

    const item = await notificationStore.markRead(
      notificationId,
      role as "consumer" | "shopkeeper",
    );
    if (!item) {
      throw new AppError("Notification not found", 404);
    }
    return item;
  },
};
