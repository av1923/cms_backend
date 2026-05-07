import { prisma } from "../utils/db";

export async function getSlotAvailability(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { course_id: courseId },
    select: {
      course_id: true,
      course_code: true,
      course_name: true,
      semester: true,
      section_capacity: true,
      enrolled_count: true,
      status: true,
    },
  });

  if (!course) return null;

  return {
    course_id: course.course_id,
    course_code: course.course_code,
    course_name: course.course_name,
    semester: course.semester,
    section_capacity: course.section_capacity,
    enrolled_count: course.enrolled_count,
    available_slots: course.section_capacity - course.enrolled_count,
    status: course.status,
    timestamp: new Date().toISOString(),
  };
}

export async function enrollStudent(courseId: string, studentId: string, section?: string) {
  const course = await prisma.course.findUnique({ where: { course_id: courseId } });
  if (!course) return null;

  if (course.status !== "Active") {
    throw new Error("Cannot enroll in a non-active course.");
  }

  if (course.enrolled_count >= course.section_capacity) {
    throw new Error("No available slots remaining.");
  }

  const updated = await prisma.course.update({
    where: { course_id: courseId },
    data: { enrolled_count: { increment: 1 } },
  });

  return {
    course_id: courseId,
    student_id: studentId,
    section: section || "A",
    enrolled_count: updated.enrolled_count,
    available_slots: updated.section_capacity - updated.enrolled_count,
    enrollment_confirmed: true,
    updated_at: updated.updated_at.toISOString(),
  };
}

export async function dropStudent(courseId: string, studentId: string) {
  const course = await prisma.course.findUnique({ where: { course_id: courseId } });
  if (!course) return null;

  if (course.enrolled_count <= 0) {
    throw new Error("Enrolled count cannot be negative.");
  }

  const updated = await prisma.course.update({
    where: { course_id: courseId },
    data: { enrolled_count: { decrement: 1 } },
  });

  return {
    course_id: courseId,
    student_id: studentId,
    enrolled_count: updated.enrolled_count,
    available_slots: updated.section_capacity - updated.enrolled_count,
    drop_confirmed: true,
    updated_at: updated.updated_at.toISOString(),
  };
}
