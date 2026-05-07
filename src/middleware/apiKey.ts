import { Request, Response, NextFunction } from "express";
import { commonErrors } from "../utils/response";

const API_KEYS = new Set([process.env.SERVICE_API_KEY || "service-dev-key"]);

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"] as string;
  if (!key || !API_KEYS.has(key)) {
    return commonErrors.unauthorized(res, "Invalid or missing API key.");
  }
  next();
}
