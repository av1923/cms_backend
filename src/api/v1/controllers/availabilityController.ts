import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getSlotAvailability, enrollStudent, dropStudent } from "../../../services/availabilityServices";
import { logAudit } from "../../../services/auditLogServices";
import { successResponse, commonErrors } from "../../../utils/response";

const enrollSchema = z.object({
  student_id: z.string().min(1),
  section: z.string().optional(),
});

const dropSchema = z.object({
  student_id: z.string().min(1),
});

export async function getSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await getSlotAvailability(id);
    if (!result) {
      return commonErrors.notFound(res, "Course not found.");
    }
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function enroll(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = enrollSchema.parse(req.body);

    const result = await enrollStudent(id, data.student_id, data.section);
    if (!result) {
      return commonErrors.notFound(res, "Course not found.");
    }

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "STUDENT_ENROLLED",
      id,
      { student_id: data.student_id, section: data.section },
      req.ip || undefined
    );

    return successResponse(res, result);
  } catch (error: any) {
    if (error.message?.includes("non-active") || error.message?.includes("No available")) {
      return commonErrors.unprocessable(res, error.message);
    }
    next(error);
  }
}

export async function drop(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = dropSchema.parse(req.body);

    const result = await dropStudent(id, data.student_id);
    if (!result) {
      return commonErrors.notFound(res, "Course not found.");
    }

    await logAudit(
      req.user!.userId,
      req.user!.role,
      "STUDENT_DROPPED",
      id,
      { student_id: data.student_id },
      req.ip || undefined
    );

    return successResponse(res, result);
  } catch (error: any) {
    if (error.message?.includes("cannot be negative")) {
      return commonErrors.unprocessable(res, error.message);
    }
    next(error);
  }
}
