import { Router } from "express";
import { getPricing } from "../controllers/pricingController";
import { authenticate } from "../../../middleware/auth";

const router = Router();

// GET /api/v1/pricing/:courseId - Get pricing for a course
router.get("/:courseId", authenticate, getPricing);

export default router;
