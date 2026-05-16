import { Router } from "express";
import { getAuditLogsHandler } from "../controllers/auditLogController";
import { authenticate, authorize } from "../../../middleware/auth";

const router = Router();

// GET /api/v1/audit-logs - Get all audit logs
router.get("/", authenticate, authorize("GET", "/api/v1/audit-logs"), getAuditLogsHandler);

export default router;