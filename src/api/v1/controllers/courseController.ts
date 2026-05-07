import { Request, Response, NextFunction } from "express";
import { createCourseSchema, updateStatusSchema } from "../validators/courseValidator";
import { createCourse, getCourseById, updateCourseStatus, checkDuplicateCourse } from "../../../services/courseServices";
import { logAudit } from "../../../services/auditLogServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createCourseSchema.parse(req.body);

    const existing = await checkDuplicateCourse(data.course_code, data.semester);
    if (existing) {
      return commonErrors.conflict(res);
    }

    if (data.prerequisites?.includes(data.course_code)) {
      return commonErrors.badRequest(res, "Circular prerequisite chain detected.", {
        prerequisites: "A course cannot be its own prerequisite.",
      });
    }

    const course = await createCourse(data);

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "COURSE_CREATED",
      course.course_id,
      { course_code: data.course_code, course_name: data.course_name },
      req.ip || undefined
    );

    return successResponse(res, {
      course_id: course.course_id,
      course_code: data.course_code,
      course_name: data.course_name,
      course_type: data.course_type,
      units: data.units,
      price: data.price,
      section_capacity: data.section_capacity,
      instructor_id: data.instructor_id,
      prerequisites: data.prerequisites || [],
      is_elective: data.is_elective || false,
      semester: data.semester,
      status: data.status || "Draft",
      created_at: course.created_at.toISOString(),
    }, 201);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const course = await getCourseById(id);

    if (!course) {
      return commonErrors.notFound(res, "Course not found.");
    }

    const prerequisites = course.prerequisites
      .filter((p) => p.requirement_type === "prerequisite")
      .map((p) => p.required_course.course_code);

    const corequisites = course.prerequisites
      .filter((p) => p.requirement_type === "corequisite")
      .map((p) => p.required_course.course_code);

    return successResponse(res, {
      course_id: course.course_id,
      course_code: course.course_code,
      course_name: course.course_name,
      course_type: course.course_type,
      units: course.units,
      semester: course.semester,
      classification: course.classification,
      status: course.status,
      section_capacity: course.section_capacity,
      enrolled_count: course.enrolled_count,
      available_slots: course.section_capacity - course.enrolled_count,
      room_requirement: course.room_requirement,
      price: course.pricing ? Number(course.pricing.base_fee) : null,
      lab_fee: course.pricing && course.pricing.lab_fee ? Number(course.pricing.lab_fee) : null,
      currency: course.pricing?.currency,
      instructor_id: course.instructorAssignments[0]?.instructor_id || null,
      instructor_name: course.instructorAssignments[0]?.instructor.instructor_name || null,
      section: course.instructorAssignments[0]?.section || null,
      schedule: course.instructorAssignments[0]?.schedule || null,
      room: course.instructorAssignments[0]?.room || null,
      prerequisites,
      corequisites,
      created_at: course.created_at.toISOString(),
      updated_at: course.updated_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = updateStatusSchema.parse(req.body);

    const updated = await updateCourseStatus(id, data.status);
    if (!updated) {
      return commonErrors.notFound(res, "Course not found.");
    }

    await logAudit(
      req.user!.userId,
      req.user!.role,
      `COURSE_STATUS_${data.status.toUpperCase()}`,
      id,
      { status: data.status },
      req.ip || undefined
    );

    return successResponse(res, {
      course_id: id,
      status: updated.status,
      updated_at: updated.updated_at.toISOString(),
    });
  } catch (error: any) {
    if (error.message?.includes("Cannot transition")) {
      return commonErrors.unprocessable(res, error.message);
    }
    next(error);
  }
}
