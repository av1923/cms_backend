import { prisma } from "../utils/db";

export async function getPrerequisites(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { course_id: courseId },
    include: {
      prerequisites: { include: { required_course: true } },
    },
  });

  if (!course) return null;

  const prerequisites = course.prerequisites
    .filter((p) => p.requirement_type === "prerequisite")
    .map((p) => ({
      course_code: p.required_course.course_code,
      course_name: p.required_course.course_name,
      type: "prerequisite",
    }));

  const corequisites = course.prerequisites
    .filter((p) => p.requirement_type === "corequisite")
    .map((p) => ({
      course_code: p.required_course.course_code,
      course_name: p.required_course.course_name,
      type: "corequisite",
    }));

  return { course, prerequisites, corequisites };
}

export async function updatePrerequisites(courseId: string, data: any) {
  const course = await prisma.course.findUnique({ where: { course_id: courseId } });
  if (!course) return null;

  if (data.prerequisites?.includes(course.course_code)) {
    throw new Error(`${course.course_code} cannot be its own prerequisite.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.prerequisite.deleteMany({ where: { course_id: courseId } });

    if (data.prerequisites?.length) {
      const prereqCourses = await tx.course.findMany({
        where: { course_code: { in: data.prerequisites } },
        select: { course_id: true, course_code: true },
      });
      const prereqMap = new Map(prereqCourses.map((c) => [c.course_code, c.course_id]));
      for (const code of data.prerequisites) {
        const reqId = prereqMap.get(code);
        if (reqId) {
          await tx.prerequisite.create({
            data: { course_id: courseId, required_course_id: reqId, requirement_type: "prerequisite" },
          });
        }
      }
    }

    if (data.corequisites?.length) {
      const coreqCourses = await tx.course.findMany({
        where: { course_code: { in: data.corequisites } },
        select: { course_id: true, course_code: true },
      });
      const coreqMap = new Map(coreqCourses.map((c) => [c.course_code, c.course_id]));
      for (const code of data.corequisites) {
        const reqId = coreqMap.get(code);
        if (reqId) {
          await tx.prerequisite.create({
            data: { course_id: courseId, required_course_id: reqId, requirement_type: "corequisite" },
          });
        }
      }
    }
  });

  return true;
}
