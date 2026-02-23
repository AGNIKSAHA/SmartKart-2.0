import { Router } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
export const consumerRouter = Router();
consumerRouter.get("/dashboard", requireAuth, requireRole("consumer"), (req, res) => {
    sendResponse(res, 200, "Consumer dashboard", {
        userId: req.user?.id,
        role: req.user?.role,
        summary: "Consumer account and purchase insights"
    });
});
