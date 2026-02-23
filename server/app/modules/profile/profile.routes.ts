import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { profileController } from "./profile.controller.js";

export const profileRouter = Router();

profileRouter.get("/me", requireAuth, profileController.getMyProfile);
profileRouter.patch("/me", requireAuth, profileController.updateMyProfile);
