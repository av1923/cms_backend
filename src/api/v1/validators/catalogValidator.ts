import { z } from "zod";

export const curriculumMapSchema = z.object({
  program: z.string().min(1),
  semester: z.string().min(1),
});

export const eventsQuerySchema = z.object({
  course_id: z.string().optional(),
  event_type: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
