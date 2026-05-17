import { Request, Response, NextFunction } from "express";
import { commonErrors } from "../utils/response";

// API keys from environment variable (comma-separated for multiple keys)
const API_KEYS = new Set(
  (process.env.SERVICE_API_KEY || "service-dev-key")
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key.length > 0)
);

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  // Only allow GET requests for API key authentication
  if (req.method !== "GET") {
    return commonErrors.forbidden(res, "API key authentication only allows GET requests.");
  }

  const key = req.headers["x-api-key"] as string;
  if (!key || !API_KEYS.has(key)) {
    return commonErrors.unauthorized(res, "Invalid or missing API key.");
  }

  next();
}
