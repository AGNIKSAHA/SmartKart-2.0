import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ordersApi } from "./orderAPI";
import type { CreateOrderPayload } from "../../types/api";

const orderKey = ["orders"] as const;

export const useOrders = (enabled = true) =>
  useQuery({
    queryKey: orderKey,
    queryFn: () => ordersApi.list(),
    enabled,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKey });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed successfully");
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKey });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Order cancelled");
    },
  });
};
