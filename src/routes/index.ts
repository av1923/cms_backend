import { Router } from "express";
import authRoutes from "../api/v1/routes/authRoutes";
import courseRoutes from "../api/v1/routes/courseRoutes";
import instructorRoutes from "../api/v1/routes/instructorRoutes";
import sectionRoutes from "../api/v1/routes/sectionRoutes";
import prerequisiteRoutes from "../api/v1/routes/prerequisiteRoutes";
import catalogRoutes from "../api/v1/routes/catalogRoutes";
import pricingRoutes from "../api/v1/routes/pricingRoutes";
import availabilityRoutes from "../api/v1/routes/availabilityRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/courses", instructorRoutes);
router.use("/courses", sectionRoutes);
router.use("/courses", prerequisiteRoutes);
router.use("/courses", pricingRoutes);
router.use("/courses", availabilityRoutes);
router.use("/courses", catalogRoutes);

export default router;
