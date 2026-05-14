import { Router } from "express";
import { create, assign, getAll, getAssignments } from "../controllers/instructorController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

// GET /api/v1/instructors - Get all instructors
router.get("/", authenticate, getAll);

// POST /api/v1/instructors - Create new instructor
router.post("/", authenticate, authorize("POST", "/api/v1/instructors"), create);

// GET /api/v1/instructors/assignments - Get instructor assignments by semester
router.get("/assignments", authenticate, getAssignments);

// POST /api/v1/instructors/:id/assign - Assign instructor to course section
router.post("/:id/assign", authenticate, authorize("POST", "/api/v1/instructors/*/assign"), assign);

export default router;
