import { sendResponse } from "../../common/utils/response.js";
import { userStore } from "./user.store.js";
export const userController = {
    async listUsers(_req, res) {
        const users = (await userStore.list()).map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            isEmailVerified: user.isEmailVerified
        }));
        sendResponse(res, 200, "Users fetched", users);
    }
};
