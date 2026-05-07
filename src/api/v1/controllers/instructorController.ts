import { Request, Response, NextFunction } from "express";
import { assignInstructorSchema } from "../validators/instructorValidator";
import { assignInstructor, getInstructorsBySemester } from "../../../services/instructorServices";
import { logAudit } from "../../../services/auditLogServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function assign(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = assignInstructorSchema.parse(req.body);

    const assignment = await assignInstructor(id, data.instructor_id, data.section);
    if (!assignment) {
      return commonErrors.notFound(res, "Course not found.");
    }

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "INSTRUCTOR_ASSIGNED",
      id,
      { instructor_id: data.instructor_id, section: data.section },
      req.ip || undefined
    );

    return successResponse(res, {
      course_id: id,
      section: data.section,
      instructor_id: data.instructor_id,
      assignment_confirmed: true,
      updated_at: assignment.assigned_at.toISOString(),
    });
  } catch (error: any) {
    if (error.message?.includes("not available")) {
      return commonErrors.unprocessable(res, "Invalid instructor assignment.", error.message);
    }
    next(error);
  }
}

export async function getAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const semester = req.query.semester as string;
    if (!semester) {
      return commonErrors.badRequest(res, "Semester parameter is required.");
    }

    const assignments = await getInstructorsBySemester(semester);
    return successResponse(res, { semester, assignments });
  } catch (error) {
    next(error);
  }
}
