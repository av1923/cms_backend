import { Router } from "express";
import { getCatalogHandler, getCurriculumMapHandler, getEventsHandler } from "../controllers/catalogController";
import { authenticate } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticate, getCatalogHandler);
router.get("/curriculum-map", authenticate, getCurriculumMapHandler);
router.get("/events", authenticate, getEventsHandler);

export default router;
