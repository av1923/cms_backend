import { Request, Response, NextFunction } from "express";
import { authenticateWithGoogle } from "../../../services/googleAuthServices";
import { successResponse } from "../../../utils/response";

export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_token, role } = req.body;

    if (!id_token) {
      return res.status(400).json({ code: 400, message: "ID token is required" });
    }

    const result = await authenticateWithGoogle(
      id_token,
      role as string | undefined
    );

    return successResponse(res, result, 200);
  } catch (error: any) {
    if (error.message?.includes("Role is required for new users")) {
      return res.status(400).json({ 
        code: 400, 
        message: "Role is required for new users. Please select a role.",
        requires_role: true 
      });
    }
    if (error.message?.includes("Invalid role")) {
      return res.status(400).json({ 
        code: 400, 
        message: error.message
      });
    }
    if (error.message === "Failed to verify Google token") {
      return res.status(401).json({ code: 401, message: "Invalid Google token" });
    }
    if (error.message === "Account is disabled") {
      return res.status(403).json({ code: 403, message: "Account is disabled" });
    }
    next(error);
  }
}
