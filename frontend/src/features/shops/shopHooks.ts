import { useQuery } from "@tanstack/react-query";
import { shopAPI } from "./shopAPI";

export const useNearbyShops = (lng?: number, lat?: number, radius = 5) => {
  return useQuery({
    queryKey: ["nearby-shops", lng, lat, radius],
    queryFn: () => shopAPI.getNearbyShops(lng!, lat!, radius),
    enabled: !!lng && !!lat,
  });
};
