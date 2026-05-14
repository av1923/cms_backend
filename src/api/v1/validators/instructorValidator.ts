import { z } from "zod";

export const assignInstructorSchema = z.object({
  section_id: z.string().min(1),
  semester: z.string().min(1),
  instructor_id: z.string().optional(), // Allow but ignore this field
});

export const createInstructorSchema = z.object({
  instructor_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
});
