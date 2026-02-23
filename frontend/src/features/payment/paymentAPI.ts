import { http } from "../../utils/http";
import { unwrap } from "../../utils/request";
import type { CreateOrderPayload, Order } from "../../types/api";

export interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
}

export interface SessionStatusResponse {
  status: string;
  orderId: string | null;
  customerEmail: string | null;
}

export const paymentApi = {
  createCheckoutSession(
    payload: CreateOrderPayload,
  ): Promise<CheckoutSessionResponse> {
    return unwrap(http.post("/payments/create-checkout-session", payload));
  },
  getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    return unwrap(http.get(`/payments/session-status?session_id=${sessionId}`));
  },
  cancelPaidOrder(orderId: string): Promise<Order> {
    return unwrap(http.patch(`/payments/${orderId}/cancel`));
  },
};
