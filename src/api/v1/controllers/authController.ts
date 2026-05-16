import { Request, Response, NextFunction } from "express";
import { loginSchema, refreshSchema, signupSchema } from "../validators/authValidator";
import { loginUser, refreshTokens, signupUser } from "../../../services/authServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const data = signupSchema.parse(req.body);
    const result = await signupUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });
    return successResponse(res, result, 201);
  } catch (error: any) {
    if (error.message === "Email already registered") {
      return res.status(409).json({ code: 409, message: "Email already registered" });
    }
    if (error.name === "ZodError") {
      return res.status(400).json({ code: 400, message: error.errors });
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data.email, data.password);
    return successResponse(res, result);
  } catch (error: any) {
    if (error.message === "Invalid credentials") {
      return commonErrors.unauthorized(res, "Invalid email or password.");
    }
    if (error.message === "Please use Google Sign-In for this account") {
      return res.status(400).json({ 
        code: 400, 
        message: "This account uses Google Sign-In. Please use the 'Continue with Google' button." 
      });
    }
    if (error.message === "Account is disabled") {
      return res.status(403).json({ code: 403, message: "Account is disabled" });
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
