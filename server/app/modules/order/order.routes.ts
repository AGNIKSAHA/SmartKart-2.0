import { Router } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/middleware/validate.middleware.js";
import { orderController } from "./order.controller.js";
import { createOrderSchema } from "./order.validation.js";

export const orderRouter = Router();

orderRouter.get("/", requireAuth, requireRole("consumer"), orderController.listMyOrders);
orderRouter.post("/", requireAuth, requireRole("consumer"), validateBody(createOrderSchema), orderController.createOrder);
orderRouter.patch("/:orderId/cancel", requireAuth, requireRole("consumer"), orderController.cancelOrder);
