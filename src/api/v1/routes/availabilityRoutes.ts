import { Router } from "express";
import { getSlots, enroll, drop } from "../controllers/availabilityController";
import { authenticate } from "../../../middleware/auth";

const router = Router();

// GET /api/v1/availability/:courseId/slots - Get available slots for a course
router.get("/:courseId/slots", authenticate, getSlots);

// POST /api/v1/availability/:courseId/enroll - Enroll in a course
router.post("/:courseId/enroll", authenticate, enroll);

// POST /api/v1/availability/:courseId/drop - Drop a course
router.post("/:courseId/drop", authenticate, drop);

export default router;
