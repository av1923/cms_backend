import { Router } from "express";
import { create, update, remove, unassignInstructor, getByCourse, getAll, getById } from "../controllers/sectionController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

// Get all sections
router.get("/", authenticate, getAll);

// Get sections by course ID
router.get("/course/:courseId", authenticate, getByCourse);

// Get section by ID
router.get("/:id", authenticate, getById);

// Create new section
router.post("/", authenticate, authorize("POST", "/api/v1/sections"), create);

// Update section
router.patch("/:id", authenticate, authorize("PATCH", "/api/v1/sections"), update);

// Unassign instructor from section
router.patch("/:id/unassign", authenticate, authorize("PATCH", "/api/v1/sections/*/unassign"), unassignInstructor);

// Delete section
router.delete("/:id", authenticate, authorize("DELETE", "/api/v1/sections"), remove);

export default router;
