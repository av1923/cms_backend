import { Router } from "express";
import { getSlots, enroll, drop } from "../controllers/availabilityController";
import { authenticate } from "../../../middleware/auth";

const router = Router();

router.get("/:id/slots", authenticate, getSlots);
router.post("/:id/enroll", authenticate, enroll);
router.post("/:id/drop", authenticate, drop);

export default router;
