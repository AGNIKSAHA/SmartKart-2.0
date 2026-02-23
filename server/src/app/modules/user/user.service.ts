import { AppError } from "../../common/middlewares/error.middleware.js";
import { userStore } from "./user.store.js";

export const userService = {
  async listUsers() {
    const users = await userStore.list();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isEmailVerified: user.isEmailVerified,
    }));
  },

  async findNearbyShops(lng: number, lat: number, radius?: number) {
    if (Number.isNaN(lng) || Number.isNaN(lat)) {
      throw new AppError(
        "Longitude and Latitude are required and must be numbers",
        400,
      );
    }

    const maxDistance = radius ? Number(radius) : 5; // Default 5km
    return userStore.findNearbyShops(Number(lng), Number(lat), maxDistance);
  },
};
