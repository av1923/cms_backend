import { Router } from "express";
import { getCatalogHandler, getCurriculumMapHandler, getEventsHandler } from "../controllers/catalogController";
import { authenticate } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticate, getCatalogHandler);
router.get("/catalog/curriculum-map", authenticate, getCurriculumMapHandler);
router.get("/catalog/events", authenticate, getEventsHandler);

export default router;
