import { Router } from "express";
import { create, assign, getAll, getAssignments } from "../controllers/instructorController";
import { authenticate, authorize } from "../../../middleware/auth";
import { combinedAuth } from "../../../middleware/combinedAuth";

const router = Router();

// GET /api/v1/instructors - Get all instructors
router.get("/", combinedAuth, getAll);

// POST /api/v1/instructors - Create new instructor
router.post("/", authenticate, authorize("POST", "/api/v1/instructors"), create);

// GET /api/v1/instructors/assignments - Get instructor assignments by semester
router.get("/assignments", combinedAuth, getAssignments);

// POST /api/v1/instructors/:id/assign - Assign instructor to course section
router.post("/:id/assign", authenticate, authorize("POST", "/api/v1/instructors/*/assign"), assign);

export default router;
