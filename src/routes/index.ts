import { Router } from "express";
import authRoutes from "../api/v1/routes/authRoutes";
import courseRoutes from "../api/v1/routes/courseRoutes";
import instructorRoutes from "../api/v1/routes/instructorRoutes";
import sectionsRoutes from "../api/v1/routes/sectionsRoutes";
import prerequisiteRoutes from "../api/v1/routes/prerequisiteRoutes";
import catalogRoutes from "../api/v1/routes/catalogRoutes";
import pricingRoutes from "../api/v1/routes/pricingRoutes";
import availabilityRoutes from "../api/v1/routes/availabilityRoutes";

const router = Router();

// Authentication
router.use("/auth", authRoutes);

// Courses - Core course management
router.use("/courses", courseRoutes);

// Instructors - Standalone instructor management
router.use("/instructors", instructorRoutes);

// Sections - Standalone section management
router.use("/sections", sectionsRoutes);

// Prerequisites - Standalone prerequisite management
router.use("/prerequisites", prerequisiteRoutes);

// Pricing - Standalone pricing management
router.use("/pricing", pricingRoutes);

// Availability - Enrollment/Drop operations
router.use("/availability", availabilityRoutes);

// Catalog - Public course catalog
router.use("/catalog", catalogRoutes);

export default router;