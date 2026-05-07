import { Response } from "express";

export interface ApiError {
  code: number;
  message: string;
  errors?: Record<string, string>;
  detail?: string;
}

export function successResponse<T>(res: Response, data: T, status: number = 200) {
  return res.status(status).json(data);
}

export function errorResponse(res: Response, error: ApiError) {
  return res.status(error.code).json(error);
}

export const commonErrors = {
  badRequest: (res: Response, message: string = "Missing or incomplete data.", errors?: Record<string, string>) =>
    errorResponse(res, { code: 400, message, errors }),
  unauthorized: (res: Response, message: string = "Missing valid credentials.") =>
    errorResponse(res, { code: 401, message }),
  forbidden: (res: Response, message: string = "Unauthorized access attempt.") =>
    errorResponse(res, { code: 403, message }),
  notFound: (res: Response, message: string = "Resource not found.") =>
    errorResponse(res, { code: 404, message }),
  conflict: (res: Response, message: string = "Warning: Duplicate course offering.") =>
    errorResponse(res, { code: 409, message }),
  unprocessable: (res: Response, message: string, detail?: string) =>
    errorResponse(res, { code: 422, message, detail }),
  tooManyRequests: (res: Response, retryAfter: number = 60) =>
    errorResponse(res, {
      code: 429,
      message: `Too many requests. Please slow down and retry after ${retryAfter} seconds.`,
      detail: `Retry after ${retryAfter} seconds`,
    }),
  internalError: (res: Response, message: string = "Internal server error.") =>
    errorResponse(res, { code: 500, message }),
};
