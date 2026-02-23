import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { profileApi } from "./profileAPI";
import type {
  UpdateConsumerProfilePayload,
  UpdateShopkeeperProfilePayload
} from "../../types/api";

const profileKey = ["profile", "me"] as const;

export const useProfile = (enabled = true) =>
  useQuery({
    queryKey: profileKey,
    queryFn: () => profileApi.me(),
    enabled
  });

export const useUpdateConsumerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateConsumerProfilePayload) => profileApi.updateConsumer(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKey, data);
      toast.success("Profile updated");
    }
  });
};

export const useUpdateShopkeeperProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateShopkeeperProfilePayload) => profileApi.updateShopkeeper(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKey, data);
      toast.success("Profile updated");
    }
  });
};
