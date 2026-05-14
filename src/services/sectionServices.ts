import { prisma } from "../utils/db";

export interface CreateSectionData {
  section: string;
  section_capacity: number;
  room?: string;
  schedule?: string;
  instructor_id?: string;
}

export async function getAllSections() {
  return await prisma.section.findMany({
    include: {
      course: {
        select: {
          course_id: true,
          course_code: true,
          course_name: true,
        },
      },
      instructor: {
        select: {
          instructor_id: true,
          instructor_name: true,
          email: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function getSectionById(sectionId: string) {
  return await prisma.section.findUnique({
    where: { section_id: sectionId },
    include: {
      course: {
        select: {
          course_id: true,
          course_code: true,
          course_name: true,
        },
      },
      instructor: {
        select: {
          instructor_id: true,
          instructor_name: true,
          email: true,
        },
      },
    },
  });
}

export async function getSectionsByCourse(courseId: string) {
  const course = await prisma.course.findUnique({ where: { course_id: courseId } });
  if (!course) return null;

  return await prisma.section.findMany({
    where: { course_id: courseId },
    include: {
      instructor: {
        select: {
          instructor_id: true,
          instructor_name: true,
          email: true,
        },
      },
    },
    orderBy: { section_code: "asc" },
  });
}

export async function createSection(courseId: string, data: CreateSectionData) {
  const course = await prisma.course.findUnique({ where: { course_id: courseId } });
  if (!course) return null;

  // Check if section already exists for this course
  const existingSection = await prisma.section.findFirst({
    where: {
      course_id: courseId,
      section_code: data.section,
      semester: course.semester,
    },
  });

  if (existingSection) {
    throw new Error(`Section ${data.section} already exists for this course.`);
  }

  // Create the section
  const section = await prisma.section.create({
    data: {
      course_id: courseId,
      section_code: data.section,
      capacity: data.section_capacity,
      room: data.room,
      schedule: data.schedule,
      semester: course.semester,
      instructor_id: data.instructor_id || null,
    },
  });

  return section;
}

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

export async function deleteSection(sectionId: string) {
  const section = await prisma.section.findUnique({ where: { section_id: sectionId } });
  if (!section) return null;

  // Check if there are enrolled students
  if (section.enrolled_count > 0) {
    throw new Error("Cannot delete section with enrolled students.");
  }

  await prisma.section.delete({ where: { section_id: sectionId } });
  return section;
}
