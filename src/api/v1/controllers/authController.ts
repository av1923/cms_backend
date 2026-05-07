import { Request, Response, NextFunction } from "express";
import { loginSchema, refreshSchema } from "../validators/authValidator";
import { loginUser, refreshTokens } from "../../../services/authServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data.email, data.password);
    return successResponse(res, result);
  } catch (error: any) {
    if (error.message === "Invalid credentials") {
      return commonErrors.unauthorized(res, "Invalid email or password.");
    }
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const data = refreshSchema.parse(req.body);
    const result = await refreshTokens(data.refresh_token);
    return successResponse(res, result);
  } catch (error: any) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ code: 401, message: "Refresh token expired or invalid. Please re-authenticate." });
    }
    next(error);
  }
}
