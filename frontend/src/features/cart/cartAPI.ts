import { http } from "../../utils/http";
import { unwrap } from "../../utils/request";
import type { CartLine, UpsertCartInput } from "../../types/api";

export const cartApi = {
  get(): Promise<CartLine[]> {
    return unwrap(http.get("/cart"));
  },
  upsert(input: UpsertCartInput): Promise<CartLine[]> {
    return unwrap(http.post("/cart/items", input));
  },
  remove(productId: string): Promise<CartLine[]> {
    return unwrap(http.delete(`/cart/items/${productId}`));
  }
};
