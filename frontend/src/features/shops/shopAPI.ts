import { http } from "../../utils/http";
import type { ApiEnvelope, User } from "../../types/api";

export interface NearbyShop extends User {
  shopkeeperProfile?: {
    companyName: string;
    companyAddress: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  distanceKm: number;
}

export const shopAPI = {
  async getNearbyShops(
    lng: number,
    lat: number,
    radius: number,
  ): Promise<NearbyShop[]> {
    const { data } = await http.get<ApiEnvelope<NearbyShop[]>>(
      `/users/nearby-shops?lng=${lng}&lat=${lat}&radius=${radius}`,
    );
    return data.data;
  },
};
