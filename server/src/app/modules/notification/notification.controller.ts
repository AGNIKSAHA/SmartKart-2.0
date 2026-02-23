import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  async list(req: Request, res: Response): Promise<void> {
    const role = req.user?.role;
    if (!role) {
      throw new AppError("Unauthorized", 401);
    }

    const data = await notificationService.listByRole(role);
    sendResponse(res, 200, "Notifications fetched", data);
  },

  async unreadCount(req: Request, res: Response): Promise<void> {
    const role = req.user?.role;
    if (!role) {
      throw new AppError("Unauthorized", 401);
    }

    const count = await notificationService.unreadCountByRole(role);
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

    const item = await notificationService.markRead(notificationId, role);

    sendResponse(res, 200, "Notification marked as read", item);
  },
};
