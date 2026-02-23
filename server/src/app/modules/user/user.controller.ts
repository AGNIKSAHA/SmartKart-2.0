import type { Request, Response } from "express";
import { sendResponse } from "../../common/utils/response.js";
import { userService } from "./user.service.js";

export const userController = {
  async listUsers(_req: Request, res: Response): Promise<void> {
    const users = await userService.listUsers();
    sendResponse(res, 200, "Users fetched", users);
  },

  async findNearbyShops(req: Request, res: Response): Promise<void> {
    const { lng, lat, radius } = req.query;

    const shops = await userService.findNearbyShops(
      Number(lng),
      Number(lat),
      radius ? Number(radius) : undefined,
    );

    sendResponse(res, 200, "Nearby shops fetched", shops);
  },
};
