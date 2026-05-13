import { Router } from "express";
import { create, assign, getAssignments } from "../controllers/instructorController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

router.post("/instructors", authenticate, authorize("POST", "/api/v1/courses/instructors"), create);
router.patch("/:id/instructor", authenticate, authorize("PATCH", "/api/v1/courses/*/instructor"), assign);
router.get("/instructors", authenticate, getAssignments);

export default router;
