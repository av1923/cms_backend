import { Request, Response, NextFunction } from "express";
import { updatePrerequisitesSchema } from "../validators/prerequisiteValidator";
import { getPrerequisites, updatePrerequisites } from "../../../services/prerequisiteServices";
import { logAudit } from "../../../services/auditLogServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await getPrerequisites(id);

    if (!result) {
      return commonErrors.notFound(res, "Course not found.");
    }

    return successResponse(res, {
      course_id: id,
      course_code: result.course.course_code,
      prerequisites: result.prerequisites,
      corequisites: result.corequisites,
      prerequisite_graph_valid: true,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = updatePrerequisitesSchema.parse(req.body);

    const result = await updatePrerequisites(id, data);
    if (!result) {
      return commonErrors.notFound(res, "Course not found.");
    }

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "PREREQUISITES_UPDATED",
      id,
      { prerequisites: data.prerequisites, corequisites: data.corequisites },
      req.ip || undefined
    );

    return successResponse(res, {
      course_id: id,
      prerequisites: data.prerequisites || [],
      corequisites: data.corequisites || [],
      prerequisite_graph_valid: true,
      updated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error.message?.includes("cannot be its own")) {
      return commonErrors.badRequest(res, error.message);
    }
    next(error);
  }
}
