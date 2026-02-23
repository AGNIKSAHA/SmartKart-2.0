import { Router } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.middleware.js";
import { notificationController } from "./notification.controller.js";
export const notificationRouter = Router();
notificationRouter.get("/", requireAuth, requireRole("shopkeeper"), notificationController.list);
notificationRouter.get("/unread-count", requireAuth, requireRole("shopkeeper"), notificationController.unreadCount);
notificationRouter.patch("/:id/read", requireAuth, requireRole("shopkeeper"), notificationController.markRead);
