import { Router } from "express";
import { create, update } from "../controllers/sectionController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

router.post("/:id/sections", authenticate, authorize("POST", "/api/v1/courses/*/sections"), create);
router.patch("/:id/sections", authenticate, authorize("PATCH", "/api/v1/courses/*/sections"), update);

export default router;
