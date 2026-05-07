import { prisma } from "../utils/db";

export async function getCatalog(semester?: string, status?: string, page: number = 1, limit: number = 20) {
  const where: Record<string, any> = {};
  if (semester) where.semester = semester;
  if (status) where.status = status.charAt(0).toUpperCase() + status.slice(1);

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        pricing: true,
        instructorAssignments: { include: { instructor: true } },
      },
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.course.count({ where }),
  ]);

  const formatted = courses.map((course) => ({
    course_id: course.course_id,
    course_code: course.course_code,
    course_name: course.course_name,
    course_type: course.course_type,
    units: course.units,
    price: course.pricing ? Number(course.pricing.base_fee) : null,
    section_capacity: course.section_capacity,
    instructor_id: course.instructorAssignments[0]?.instructor_id || null,
    is_elective: course.classification === "Elective",
    semester: course.semester,
    status: course.status.toLowerCase(),
  }));

  return { semester: semester || "all", total, page, limit, courses: formatted };
}

export async function getCurriculumMap(program: string, semester: string) {
  const courses = await prisma.course.findMany({
    where: { semester, status: "Active" },
    include: {
      prerequisites: { include: { required_course: true } },
      pricing: true,
    },
    orderBy: { course_code: "asc" },
  });

  const curriculumMap = courses.map((course) => ({
    course_id: course.course_id,
    course_code: course.course_code,
    course_name: course.course_name,
    course_type: course.course_type,
    units: course.units,
    classification: course.classification,
    prerequisites: course.prerequisites
      .filter((p) => p.requirement_type === "prerequisite")
      .map((p) => ({ course_code: p.required_course.course_code, course_name: p.required_course.course_name })),
    corequisites: course.prerequisites
      .filter((p) => p.requirement_type === "corequisite")
      .map((p) => ({ course_code: p.required_course.course_code, course_name: p.required_course.course_name })),
    price: course.pricing ? Number(course.pricing.base_fee) : null,
  }));

  return { program, semester, total_courses: curriculumMap.length, curriculum_map: curriculumMap };
}
