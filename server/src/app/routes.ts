import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { consumerRouter } from "./modules/consumer/consumer.routes.js";
import { notificationRouter } from "./modules/notification/notification.routes.js";
import { orderRouter } from "./modules/order/order.routes.js";
import { paymentRouter } from "./modules/payment/payment.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { profileRouter } from "./modules/profile/profile.routes.js";
import { shopkeeperRouter } from "./modules/shopkeeper/shopkeeper.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { authLimiter } from "./common/middlewares/rateLimit.middleware.js";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRouter,
    middlewares: [authLimiter],
  },
  {
    path: "/users",
    route: userRouter,
  },
  {
    path: "/consumer",
    route: consumerRouter,
  },
  {
    path: "/shopkeeper",
    route: shopkeeperRouter,
  },
  {
    path: "/products",
    route: productRouter,
  },
  {
    path: "/cart",
    route: cartRouter,
  },
  {
    path: "/orders",
    route: orderRouter,
  },
  {
    path: "/notifications",
    route: notificationRouter,
  },
  {
    path: "/payments",
    route: paymentRouter,
  },
  {
    path: "/profile",
    route: profileRouter,
  },
];

moduleRoutes.forEach((route) => {
  if (route.middlewares) {
    router.use(route.path, ...route.middlewares, route.route);
  } else {
    router.use(route.path, route.route);
  }
});

export default router;
