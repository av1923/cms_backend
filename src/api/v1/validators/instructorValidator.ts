import { z } from "zod";

export const assignInstructorSchema = z.object({
  instructor_id: z.string().min(1),
  section: z.string().min(1).max(10),
});
