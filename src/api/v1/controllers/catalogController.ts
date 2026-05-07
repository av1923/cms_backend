import { Request, Response, NextFunction } from "express";
import { catalogQuerySchema } from "../validators/courseValidator";
import { curriculumMapSchema, eventsQuerySchema } from "../validators/catalogValidator";
import { getCatalog, getCurriculumMap } from "../../../services/catalogServices";
import { getEvents } from "../../../services/auditLogServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function getCatalogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = catalogQuerySchema.parse(req.query);
    const result = await getCatalog(query.semester, query.status, query.page, query.limit);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getCurriculumMapHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = curriculumMapSchema.parse(req.query);
    const result = await getCurriculumMap(query.program, query.semester);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getEventsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = eventsQuerySchema.parse(req.query);
    const events = await getEvents(query.course_id, query.event_type, query.limit);
    return successResponse(res, { total: events.length, events });
  } catch (error) {
    next(error);
  }
}
