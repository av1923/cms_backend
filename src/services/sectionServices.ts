import { prisma } from "../utils/db";

export async function updateSection(courseId: string, data: any) {
  const course = await prisma.course.findUnique({ where: { course_id: courseId } });
  if (!course) return null;

  if (course.enrolled_count > data.section_capacity) {
    throw new Error("New capacity cannot be less than current enrolled count.");
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.course.update({
      where: { course_id: courseId },
      data: {
        section_capacity: data.section_capacity,
        room_requirement: data.room || course.room_requirement,
      },
    });

    const assignment = await tx.instructorAssignment.findFirst({
      where: { course_id: courseId, section: data.section, semester: course.semester },
    });

    if (assignment) {
      await tx.instructorAssignment.update({
        where: { assignment_id: assignment.assignment_id },
        data: { room: data.room, schedule: data.schedule },
      });
    }

    return updated;
  });
}
