import { Router } from "express";
import { get, update } from "../controllers/prerequisiteController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

// GET /api/v1/prerequisites/:courseId - Get prerequisites for a course
router.get("/:courseId", authenticate, get);

// PUT /api/v1/prerequisites/:courseId - Update prerequisites for a course
router.put("/:courseId", authenticate, authorize("PUT", "/api/v1/prerequisites"), update);

export default router;
