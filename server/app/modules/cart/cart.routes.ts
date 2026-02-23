import { Router } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/middleware/validate.middleware.js";
import { cartController } from "./cart.controller.js";
import { upsertCartItemSchema } from "./cart.validation.js";

export const cartRouter = Router();

cartRouter.get("/", requireAuth, requireRole("consumer"), cartController.getCart);
cartRouter.post("/items", requireAuth, requireRole("consumer"), validateBody(upsertCartItemSchema), cartController.upsertItem);
cartRouter.delete("/items/:productId", requireAuth, requireRole("consumer"), cartController.removeItem);
