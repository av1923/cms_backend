import { Request, Response, NextFunction } from "express";
import { updateSectionSchema, createSectionSchema } from "../validators/sectionValidator";
import { getAllSections, getSectionById, getSectionsByCourse, createSection, updateSection, deleteSection } from "../../../services/sectionServices";
import { logAudit } from "../../../services/auditLogServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const sections = await getAllSections();
    return successResponse(res, { sections });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const section = await getSectionById(id);
    if (!section) {
      return commonErrors.notFound(res, "Section not found.");
    }
    return successResponse(res, { section });
  } catch (error) {
    next(error);
  }
}

export async function getByCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = (req.params.courseId || req.params.id) as string;
    const sections = await getSectionsByCourse(courseId);
    if (sections === null) {
      return commonErrors.notFound(res, "Course not found.");
    }
    return successResponse(res, { sections });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    // Support both: POST /sections (body has course_id) and POST /courses/:id/sections (params has id)
    const courseId = req.params.id || req.body.course_id;
    
    if (!courseId) {
      return commonErrors.badRequest(res, "course_id is required");
    }
    
    const data = createSectionSchema.parse(req.body);

    const created = await createSection(courseId, data);
    if (!created) {
      return commonErrors.notFound(res, "Course not found.");
    }
 
    await logAudit(
      req.user!.userId,
      req.user!.role,
      "SECTION_CREATED",
      courseId,
      { section: data.section, section_capacity: data.section_capacity, room: data.room, schedule: data.schedule, instructor_id: data.instructor_id },
      req.ip || undefined
    );

    return successResponse(res, {
      course_id: courseId,
      section: data.section,
      section_capacity: data.section_capacity,
      room: data.room,
      schedule: data.schedule,
      instructor_id: data.instructor_id,
      created_at: new Date().toISOString(),
    }, 201);
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      return commonErrors.conflict(res, error.message);
    }
    next(error);
  }
}

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

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const deleted = await deleteSection(id);
    
    if (!deleted) {
      return commonErrors.notFound(res, "Section not found.");
    }

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "SECTION_DELETED",
      id,
      { section_id: id, section_code: deleted.section_code },
      req.ip || undefined
    );

    return successResponse(res, {
      message: "Section deleted successfully",
      section_id: id,
      section_code: deleted.section_code,
    });
  } catch (error: any) {
    if (error.message?.includes("enrolled students")) {
      return commonErrors.conflict(res, error.message);
    }
    next(error);
  }
}
