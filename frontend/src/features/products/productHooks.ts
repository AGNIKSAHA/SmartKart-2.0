import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productsApi } from "./productAPI";
import type {
  CreateProductPayload,
  Product,
  ProductQuery,
  UpdateProductPayload,
} from "../../types/api";

const productsKey = ["products"] as const;
const myProductsKey = ["my-products"] as const;

export const useProducts = (query: ProductQuery) =>
  useQuery({
    queryKey: [...productsKey, query],
    queryFn: () => productsApi.list(query),
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: [...productsKey, id],
    queryFn: () => productsApi.getById(id),
    enabled: id.length > 0,
  });

export const useMyProducts = (enabled: boolean) =>
  useQuery({
    queryKey: myProductsKey,
    queryFn: () => productsApi.listMine(),
    enabled,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKey });
      queryClient.invalidateQueries({ queryKey: myProductsKey });
      toast.success("Product created");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductPayload;
    }) => productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKey });
      queryClient.invalidateQueries({ queryKey: myProductsKey });
      toast.success("Product updated");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKey });
      queryClient.invalidateQueries({ queryKey: myProductsKey });
      toast.success("Product removed");
    },
  });
};
