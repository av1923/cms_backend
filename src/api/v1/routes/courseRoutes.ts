import { Router } from "express";
import { create, getById, updateStatus } from "../controllers/courseController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

router.post("/", authenticate, authorize("POST", "/api/v1/courses"), create);
router.get("/:id", authenticate, getById);
router.patch("/:id/status", authenticate, authorize("PATCH", "/api/v1/courses/*/status"), updateStatus);

export default router;
