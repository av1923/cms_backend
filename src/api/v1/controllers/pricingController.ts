import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/db";
import { successResponse, commonErrors } from "../../../utils/response";

export async function getPricing(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const course = await prisma.course.findUnique({
      where: { course_id: id },
      include: { pricing: true },
    });

    if (!course) {
      return commonErrors.notFound(res, "Course not found.");
    }

    if (!course.pricing) {
      return commonErrors.notFound(res, "Pricing data not found for this course.");
    }

    return successResponse(res, {
      course_id: id,
      course_code: course.course_code,
      course_name: course.course_name,
      price: Number(course.pricing.base_fee),
      currency: course.pricing.currency,
      units: course.units,
      price_per_unit: Number(course.pricing.base_fee) / course.units,
      semester: course.semester,
      effective_date: course.pricing.effective_date.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
