import { z } from "zod";
import { UserRole } from "../../../utils/auth";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([
    "CurriculumCommittee",
    "DepartmentChair",
    "Registrar",
    "Admin",
    "Student",
    "ServiceAccount",
  ]).optional(),
});
