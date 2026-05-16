import { Request, Response, NextFunction } from "express";
import { getEvents } from "../../../services/auditLogServices";
import { successResponse } from "../../../utils/response";

export async function getAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const courseId = req.query.course_id as string | undefined;
    const eventType = req.query.event_type as string | undefined;
    
    const logs = await getEvents(courseId, eventType, limit);
    
    return successResponse(res, {
      total: logs.length,
      events: logs,
    });
  } catch (error) {
    next(error);
  }
}