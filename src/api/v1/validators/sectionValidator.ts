import { z } from "zod";

export const updateSectionSchema = z.object({
  section: z.string().min(1).max(10),
  section_capacity: z.number().int().positive(),
  room: z.string().max(50).optional(),
  schedule: z.string().max(50).optional(),
});
