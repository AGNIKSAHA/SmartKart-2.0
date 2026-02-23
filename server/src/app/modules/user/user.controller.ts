import type { Request, Response } from "express";
import { sendResponse } from "../../common/utils/response.js";
import { userStore } from "./user.store.js";

export const userController = {
  async listUsers(_req: Request, res: Response): Promise<void> {
    const users = (await userStore.list()).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isEmailVerified: user.isEmailVerified,
    }));

    sendResponse(res, 200, "Users fetched", users);
  },

  async findNearbyShops(req: Request, res: Response): Promise<void> {
    const { lng, lat, radius } = req.query;

    if (!lng || !lat) {
      sendResponse(res, 400, "Longitude and Latitude are required", null);
      return;
    }

    const maxDistance = radius ? Number(radius) : 5; // Default 5km
    const shops = await userStore.findNearbyShops(
      Number(lng),
      Number(lat),
      maxDistance,
    );

    sendResponse(res, 200, "Nearby shops fetched", shops);
  },
};
