import { http } from "../../utils/http";
import { unwrap } from "../../utils/request";
import type {
  ProfileResponse,
  UpdateConsumerProfilePayload,
  UpdateShopkeeperProfilePayload
} from "../../types/api";

export const profileApi = {
  me(): Promise<ProfileResponse> {
    return unwrap(http.get("/profile/me"));
  },
  updateConsumer(payload: UpdateConsumerProfilePayload): Promise<ProfileResponse> {
    return unwrap(http.patch("/profile/me", payload));
  },
  updateShopkeeper(payload: UpdateShopkeeperProfilePayload): Promise<ProfileResponse> {
    return unwrap(http.patch("/profile/me", payload));
  }
};
