import { z } from "zod";

export const createCourseSchema = z.object({
  course_code: z.string().min(1).max(20),
  course_name: z.string().min(1).max(255),
  course_type: z.enum(["Lecture", "Lab"]),
  units: z.number().int().positive(),
  price: z.number().positive(),
  section_capacity: z.number().int().positive(),
  instructor_id: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  corequisites: z.array(z.string()).optional(),
  is_elective: z.boolean().optional(),
  semester: z.string().min(1).max(20),
  status: z.enum(["Draft", "Active", "Archived"]).optional(),
  room_requirement: z.string().max(50).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["Draft", "Active", "Archived"]),
});

export const catalogQuerySchema = z.object({
  semester: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
