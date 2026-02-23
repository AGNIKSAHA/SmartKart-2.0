import { Router } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/middleware/validate.middleware.js";
import { productController } from "./product.controller.js";
import { createProductSchema, updateProductSchema } from "./product.validation.js";

export const productRouter = Router();

productRouter.get("/", productController.list);
productRouter.get("/mine", requireAuth, requireRole("shopkeeper"), productController.listMine);
productRouter.get("/:id", productController.getById);
productRouter.post("/", requireAuth, requireRole("shopkeeper"), validateBody(createProductSchema), productController.create);
productRouter.patch(
  "/:id",
  requireAuth,
  requireRole("shopkeeper"),
  validateBody(updateProductSchema),
  productController.update
);
productRouter.delete("/:id", requireAuth, requireRole("shopkeeper"), productController.remove);
