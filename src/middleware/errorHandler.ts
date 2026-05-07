import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { commonErrors } from "../utils/response";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error:", err);

  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    err.errors.forEach((e) => {
      errors[e.path.join(".")] = e.message;
    });
    return commonErrors.badRequest(res, "Validation failed.", errors);
  }

  if (err.code === "P2002") {
    return commonErrors.conflict(res, "Duplicate entry detected.");
  }

  if (err.code === "P2025") {
    return commonErrors.notFound(res, "Resource not found.");
  }

  return commonErrors.internalError(res, err.message || "Something went wrong.");
}

export function notFoundHandler(req: Request, res: Response) {
  return commonErrors.notFound(res, `Route ${req.method} ${req.path} not found.`);
}
