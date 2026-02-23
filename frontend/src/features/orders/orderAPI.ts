import { http } from "../../utils/http";
import { unwrap } from "../../utils/request";
import type { CreateOrderPayload, Order } from "../../types/api";

export const ordersApi = {
  list(): Promise<Order[]> {
    return unwrap(http.get("/orders"));
  },
  create(payload: CreateOrderPayload): Promise<Order> {
    return unwrap(http.post("/orders", payload));
  },
  cancel(orderId: string): Promise<Order> {
    return unwrap(http.patch(`/orders/${orderId}/cancel`));
  }
};
