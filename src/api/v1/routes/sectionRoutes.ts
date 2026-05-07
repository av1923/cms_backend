import { Router } from "express";
import { update } from "../controllers/sectionController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

router.patch("/:id/sections", authenticate, authorize("PATCH", "/api/v1/courses/*/sections"), update);

export default router;
