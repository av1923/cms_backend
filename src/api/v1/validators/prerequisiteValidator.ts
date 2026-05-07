import { z } from "zod";

export const updatePrerequisitesSchema = z.object({
  prerequisites: z.array(z.string()).optional(),
  corequisites: z.array(z.string()).optional(),
});
