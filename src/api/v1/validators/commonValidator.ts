import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const semesterQuerySchema = z.object({
  semester: z.string().min(1),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
