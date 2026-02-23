import type { Request, Response } from "express";
import { AppError } from "../../common/middleware/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { notificationStore } from "./notification.store.js";

export const notificationController = {
  async list(req: Request, res: Response): Promise<void> {
    const role = req.user?.role;
    if (!role) {
      throw new AppError("Unauthorized", 401);
    }

    const data = await notificationStore.listByRole(role);
    sendResponse(res, 200, "Notifications fetched", data);
  },

  async unreadCount(req: Request, res: Response): Promise<void> {
    const role = req.user?.role;
    if (!role) {
      throw new AppError("Unauthorized", 401);
    }

    const count = await notificationStore.unreadCountByRole(role);
    sendResponse(res, 200, "Unread count fetched", { count });
  },

  async markRead(req: Request, res: Response): Promise<void> {
    const role = req.user?.role;
    if (!role) {
      throw new AppError("Unauthorized", 401);
    }

    const notificationId = req.params.id;
    if (!notificationId) {
      throw new AppError("Notification id is required", 400);
    }

    const item = await notificationStore.markRead(notificationId, role);
    if (!item) {
      throw new AppError("Notification not found", 404);
    }

    sendResponse(res, 200, "Notification marked as read", item);
  }
};
