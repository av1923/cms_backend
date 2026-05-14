import { prisma } from "../utils/db";

export interface CreateInstructorData {
  instructor_name: string;
  email: string;
  department?: string;
}

export async function createInstructor(data: CreateInstructorData) {
  // Check if email already exists
  const existingInstructor = await prisma.instructor.findUnique({ where: { email: data.email } });
  if (existingInstructor) {
    throw new Error("Email already registered");
  }

  return await prisma.instructor.create({
    data: {
      instructor_name: data.instructor_name,
      email: data.email,
      department: data.department,
    },
  });
}

export async function assignInstructor(instructorId: string, sectionId: string, semester: string) {
  // Get the section to find course info
  const section = await prisma.section.findUnique({ where: { section_id: sectionId } });
  if (!section) return null;

  // Check for conflicts - instructor teaching another section at same time
  const existing = await prisma.instructorAssignment.findFirst({
    where: {
      instructor_id: instructorId,
      semester: semester,
      schedule: section.schedule,
      NOT: { course_id: section.course_id },
    },
  });

  if (existing) {
    throw new Error(`${instructorId} is not available for the requested semester and schedule.`);
  }

  // Create or update instructor assignment
  const assignment = await prisma.instructorAssignment.upsert({
    where: {
      course_id_section_semester: {
        course_id: section.course_id,
        section: section.section_code,
        semester: semester,
      },
    },
    update: {
      instructor_id: instructorId,
      room: section.room,
      schedule: section.schedule,
    },
    create: {
      course_id: section.course_id,
      instructor_id: instructorId,
      section: section.section_code,
      semester: semester,
      room: section.room,
      schedule: section.schedule,
    },
  });

  // Also update the section with instructor reference
  await prisma.section.update({
    where: { section_id: sectionId },
    data: { instructor_id: instructorId },
  });

  return assignment;
}

export async function getAllInstructors() {
  const instructors = await prisma.instructor.findMany({
    orderBy: { instructor_name: "asc" },
  });

  return instructors.map((instructor) => ({
    instructor_id: instructor.instructor_id,
    instructor_name: instructor.instructor_name,
    email: instructor.email,
    department: instructor.department,
    created_at: instructor.created_at.toISOString(),
  }));
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
