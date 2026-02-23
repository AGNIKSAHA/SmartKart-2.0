import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../common/middlewares/auth.middleware.js";
import { userController } from "./user.controller.js";

export const userRouter = Router();

userRouter.get(
  "/",
  requireAuth,
  requireRole("shopkeeper"),
  userController.listUsers,
);
userRouter.get("/nearby-shops", requireAuth, userController.findNearbyShops);
