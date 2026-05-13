import { z } from "zod";

export const assignInstructorSchema = z.object({
  instructor_id: z.string().min(1),
  section: z.string().min(1).max(10),
});

export const createInstructorSchema = z.object({
  instructor_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
});
