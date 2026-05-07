import { prisma } from "../utils/db";

export async function assignInstructor(courseId: string, instructorId: string, section: string) {
  const course = await prisma.course.findUnique({ where: { course_id: courseId } });
  if (!course) return null;

  const existing = await prisma.instructorAssignment.findFirst({
    where: {
      instructor_id: instructorId,
      semester: course.semester,
      section,
      NOT: { course_id: courseId },
    },
  });

  if (existing) {
    throw new Error(`${instructorId} is not available for the requested semester and section.`);
  }

  return await prisma.instructorAssignment.upsert({
    where: {
      course_id_section_semester: {
        course_id: courseId,
        section,
        semester: course.semester,
      },
    },
    update: { instructor_id: instructorId },
    create: {
      course_id: courseId,
      instructor_id: instructorId,
      section,
      semester: course.semester,
    },
  });
}

export async function getInstructorsBySemester(semester: string) {
  const instructors = await prisma.instructor.findMany({
    include: {
      assignments: {
        where: { semester },
        include: { course: true },
      },
    },
  });

  return instructors.map((instructor) => ({
    instructor_id: instructor.instructor_id,
    instructor_name: instructor.instructor_name,
    courses: instructor.assignments.map((a) => ({
      course_id: a.course_id,
      course_code: a.course.course_code,
      section: a.section,
      schedule: a.schedule,
      room: a.room,
    })),
  }));
}
