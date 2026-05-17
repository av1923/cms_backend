import { Router } from "express";
import { refresh } from "../controllers/authController";
import { googleAuth } from "../controllers/googleAuthController";

const router = Router();

// Google-only authentication
router.post("/google", googleAuth);

// Keep refresh token endpoint for session management
router.post("/refresh", refresh);

export default router;
