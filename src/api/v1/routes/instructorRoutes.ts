import { Router } from "express";
import { create, assign, getAll, getAssignments } from "../controllers/instructorController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

router.post("/instructors", authenticate, authorize("POST", "/api/v1/courses/instructors"), create);
router.get("/instructors", authenticate, getAll);
router.patch("/:id/instructor", authenticate, authorize("PATCH", "/api/v1/courses/*/instructor"), assign);
router.get("/instructors/assignments", authenticate, getAssignments);

export default router;
