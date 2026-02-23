import type { AxiosResponse } from "axios";
import type { ApiEnvelope } from "../types/api";

export const unwrap = async <T>(request: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<T> => {
  const response = await request;
  return response.data.data;
};
