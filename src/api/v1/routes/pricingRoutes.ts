import { Router } from "express";
import { getPricing } from "../controllers/pricingController";
import { authenticate } from "../../../middleware/auth";

const router = Router();

router.get("/:id/pricing", authenticate, getPricing);

export default router;
