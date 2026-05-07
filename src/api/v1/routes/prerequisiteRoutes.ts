import { Router } from "express";
import { get, update } from "../controllers/prerequisiteController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

router.get("/:id/prerequisites", authenticate, get);
router.put("/:id/prerequisites", authenticate, authorize("PUT", "/api/v1/courses/*/prerequisites"), update);

export default router;
