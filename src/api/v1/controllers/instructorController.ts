import { Request, Response, NextFunction } from "express";
import { assignInstructorSchema, createInstructorSchema } from "../validators/instructorValidator";
import { createInstructor, assignInstructor, getAllInstructors, getInstructorsBySemester } from "../../../services/instructorServices";
import { logAudit } from "../../../services/auditLogServices";
import { successResponse, commonErrors } from "../../../utils/response";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const instructors = await getAllInstructors();
    return successResponse(res, { instructors });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createInstructorSchema.parse(req.body);

    const instructor = await createInstructor({
      instructor_name: data.instructor_name,
      email: data.email,
      department: data.department,
    });

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "INSTRUCTOR_CREATED",
      undefined,
      { instructor_id: instructor.instructor_id, instructor_name: instructor.instructor_name },
      req.ip || undefined
    );

    return successResponse(res, {
      instructor_id: instructor.instructor_id,
      instructor_name: instructor.instructor_name,
      email: instructor.email,
      department: instructor.department,
      created_at: instructor.created_at.toISOString(),
    }, 201);
  } catch (error: any) {
    if (error.message === "Email already registered") {
      return res.status(409).json({ code: 409, message: "Email already registered" });
    }
    if (error.name === "ZodError") {
      return res.status(400).json({ code: 400, message: error.errors });
    }
    next(error);
  }
}

export async function assign(req: Request, res: Response, next: NextFunction) {
  try {
    const instructorId = req.params.id as string;
    const data = assignInstructorSchema.parse(req.body);

    const assignment = await assignInstructor(instructorId, data.section_id, data.semester);
    if (!assignment) {
      return commonErrors.notFound(res, "Section not found.");
    }

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "INSTRUCTOR_ASSIGNED",
      data.section_id,
      { instructor_id: instructorId, section_id: data.section_id, semester: data.semester },
      req.ip || undefined
    );

    return successResponse(res, {
      instructor_id: instructorId,
      section_id: data.section_id,
      semester: data.semester,
      assignment_confirmed: true,
      updated_at: assignment.updated_at.toISOString(),
    });
  } catch (error: any) {
    if (error.message?.includes("not available")) {
      return commonErrors.unprocessable(res, "Invalid instructor assignment.", error.message);
    }
    if (error.name === "ZodError") {
      return res.status(400).json({ code: 400, message: error.errors });
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
