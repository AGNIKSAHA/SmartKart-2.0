import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { profileService } from "./profile.service.js";

export const profileController = {
  async getMyProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const data = await profileService.getMyProfile(userId);
    sendResponse(res, 200, "Profile fetched", data);
  },

  async updateMyProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      throw new AppError("Unauthorized", 401);
    }

    const data = await profileService.updateMyProfile(userId, role, req.body);
    sendResponse(res, 200, "Profile updated", data);
  },
};
