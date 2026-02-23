import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { paymentApi } from "./paymentAPI";
import type { CreateOrderPayload } from "../../types/api";

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      paymentApi.createCheckoutSession(payload),
  });
};

export const useSessionStatus = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["payment-session", sessionId],
    queryFn: () => paymentApi.getSessionStatus(sessionId!),
    enabled: !!sessionId,
  });
};

export const useCancelPaidOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => paymentApi.cancelPaidOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Order cancelled & refund initiated");
    },
  });
};
