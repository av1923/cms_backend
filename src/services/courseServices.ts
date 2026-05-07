import { prisma } from "../utils/db";
import { Prisma } from "@prisma/client";
import { CourseStatus } from "@prisma/client";


export async function createCourse(data: any) {
  const classification = data.is_elective ? "Elective" : "Core";

  return await prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        course_code: data.course_code,
        course_name: data.course_name,
        course_type: data.course_type,
        units: data.units,
        semester: data.semester,
        classification,
        status: data.status || "Draft",
        section_capacity: data.section_capacity,
        room_requirement: data.room_requirement,
      },
    });

    await tx.coursePricing.create({
      data: {
        course_id: course.course_id,
        base_fee: new Prisma.Decimal(data.price),
        lab_fee: data.course_type === "Lab" ? new Prisma.Decimal(data.price * 0.3) : null,
        currency: "PHP",
      },
    });

    if (data.instructor_id) {
      await tx.instructorAssignment.create({
        data: {
          course_id: course.course_id,
          instructor_id: data.instructor_id,
          section: "A",
          semester: data.semester,
        },
      });
    }

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
            data: { course_id: course.course_id, required_course_id: reqId, requirement_type: "prerequisite" },
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
            data: { course_id: course.course_id, required_course_id: reqId, requirement_type: "corequisite" },
          });
        }
      }
    }

    return course;
  });
}

export async function getCourseById(id: string) {
  return await prisma.course.findUnique({
    where: { course_id: id },
    include: {
      pricing: true,
      instructorAssignments: { include: { instructor: true } },
      prerequisites: { include: { required_course: true } },
    },
  });
}

export async function updateCourseStatus(id: string, status: string) {
  const course = await prisma.course.findUnique({ where: { course_id: id } });
  if (!course) return null;
  const statusEnum = status as CourseStatus;

  const validTransitions: Record<string, string[]> = {
    Draft: ["Active", "Archived"],
    Active: ["Archived"],
    Archived: ["Draft"],
  };

  if (!validTransitions[course.status].includes(status)) {
    throw new Error(`Cannot transition from ${course.status} to ${status}`);
  }

  return await prisma.course.update({
    where: { course_id: id },
    data: { status: statusEnum },
  });
}

export async function checkDuplicateCourse(courseCode: string, semester: string) {
  return await prisma.course.findUnique({
    where: { course_code_semester: { course_code: courseCode, semester } },
  });
}
