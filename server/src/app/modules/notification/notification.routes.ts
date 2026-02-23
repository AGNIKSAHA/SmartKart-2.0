import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../common/middlewares/auth.middleware.js";
import { notificationController } from "./notification.controller.js";

export const notificationRouter = Router();

notificationRouter.get(
  "/",
  requireAuth,
  requireRole("shopkeeper", "consumer"),
  notificationController.list,
);
notificationRouter.get(
  "/unread-count",
  requireAuth,
  requireRole("shopkeeper", "consumer"),
  notificationController.unreadCount,
);
notificationRouter.patch(
  "/:id/read",
  requireAuth,
  requireRole("shopkeeper", "consumer"),
  notificationController.markRead,
);
