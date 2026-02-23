import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cartApi } from "./cartAPI";

const cartKey = ["cart"] as const;

export const useCart = () =>
  useQuery({
    queryKey: cartKey,
    queryFn: () => cartApi.get()
  });

export const useUpsertCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.upsert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKey });
      toast.success("Cart updated");
    }
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKey });
      toast.success("Item removed");
    }
  });
};
