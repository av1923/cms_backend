import { Request, Response, NextFunction } from "express";
import { extractToken, verifyAccessToken, hasPermission, JwtPayload } from "../utils/auth";
import { commonErrors } from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return commonErrors.unauthorized(res);
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

export function authorize(method: string, pathPattern: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return commonErrors.unauthorized(res);
    }
    const path = req.originalUrl.replace(/\?.*$/, "");
    if (!hasPermission(req.user.role, method, path)) {
      return commonErrors.forbidden(res);
    }
    next();
  };
}
