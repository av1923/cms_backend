import { Router } from "express";
import { getCatalogHandler, getCurriculumMapHandler, getEventsHandler } from "../controllers/catalogController";
import { combinedAuth } from "../../../middleware/combinedAuth";

const router = Router();

router.get("/", combinedAuth, getCatalogHandler);
router.get("/curriculum-map", combinedAuth, getCurriculumMapHandler);
router.get("/events", combinedAuth, getEventsHandler);

export default router;
