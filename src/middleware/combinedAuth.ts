import { Request, Response, NextFunction } from "express";
import { extractToken, verifyAccessToken } from "../utils/auth";
import { commonErrors } from "../utils/response";

// API keys from environment variable (comma-separated for multiple keys)
const API_KEYS = new Set(
  (process.env.SERVICE_API_KEY || "service-dev-key")
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key.length > 0)
);

/**
 * Combined authentication middleware that accepts either:
 * - JWT Bearer token (for user authentication)
 * - API Key (x-api-key header) for system-to-system authentication (GET only)
 */
export function combinedAuth(req: Request, res: Response, next: NextFunction) {
  // First, try JWT authentication
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      return next();
    } catch (error: any) {
      if (error.name !== "TokenExpiredError") {
        // If token is invalid (not just expired), continue to try API key
        // If expired, we'll let it fail after checking API key
      }
    }
  }

  // If JWT failed or not provided, try API key authentication
  const apiKey = req.headers["x-api-key"] as string;
  if (apiKey) {
    // API key authentication only allows GET requests
    if (req.method !== "GET") {
      return commonErrors.forbidden(res, "API key authentication only allows GET requests.");
    }

    if (API_KEYS.has(apiKey)) {
      return next();
    }
  }

  // If we get here, neither authentication method succeeded
  // Check if we had a token that just expired
  if (token) {
    try {
      verifyAccessToken(token);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ code: 401, message: "Token expired. Please refresh your session." });
      }
    }
  }

  return commonErrors.unauthorized(res, "Missing or invalid authentication credentials.");
}

/**
 * Middleware to require JWT authentication specifically (not API key)
 * Use this for sensitive operations that should only be performed by users
 */
export function requireJwtAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return commonErrors.unauthorized(res, "JWT authentication required.");
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ code: 401, message: "Token expired. Please refresh your session." });
    }
    return commonErrors.unauthorized(res);
  }
}
