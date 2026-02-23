import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.middleware.js";
import { sendResponse } from "../../common/utils/response.js";

export const consumerRouter = Router();

consumerRouter.get("/dashboard", requireAuth, requireRole("consumer"), (req: Request, res: Response) => {
  sendResponse(res, 200, "Consumer dashboard", {
    userId: req.user?.id,
    role: req.user?.role,
    summary: "Consumer account and purchase insights"
  });
});
