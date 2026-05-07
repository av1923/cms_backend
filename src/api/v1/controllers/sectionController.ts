import { Request, Response, NextFunction } from "express";
import { updateSectionSchema } from "../validators/sectionValidator";
import { updateSection } from "../../../services/sectionServices";
import { logAudit } from "../../../services/auditLogServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = updateSectionSchema.parse(req.body);

    const updated = await updateSection(id, data);
    if (!updated) {
      return commonErrors.notFound(res, "Course not found.");
    }

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "SECTIONS_UPDATED",
      id,
      { section: data.section, section_capacity: data.section_capacity, room: data.room, schedule: data.schedule },
      req.ip || undefined
    );

    return successResponse(res, {
      course_id: id,
      section: data.section,
      section_capacity: data.section_capacity,
      room: data.room,
      schedule: data.schedule,
      updated_at: updated.updated_at.toISOString(),
    });
  } catch (error: any) {
    if (error.message?.includes("cannot be less")) {
      return commonErrors.unprocessable(res, error.message);
    }
    next(error);
  }
}
