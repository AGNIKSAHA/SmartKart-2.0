import type { Response } from "express";

interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const sendResponse = <T>(res: Response, statusCode: number, message: string, data: T): void => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data
  };

  res.status(statusCode).json(payload);
};
