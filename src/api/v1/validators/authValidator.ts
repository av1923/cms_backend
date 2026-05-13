import { z } from "zod";
import { UserRole } from "../../../utils/auth";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

// Map UI role names to backend enum values
const roleMapping: Record<string, string> = {
  "SYSTEM ADMIN": "Admin",
  "CURRICULUM COMMITTEE": "CurriculumCommittee",
  "DEPARTMENT CHAIR": "DepartmentChair",
  "REGISTRAR": "Registrar",
};

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string({ required_error: "Role is required" }).transform((val) => {
    const mappedRole = roleMapping[val.toUpperCase()];
    if (!mappedRole) {
      throw new Error(`Invalid role: ${val}. Valid roles are: ${Object.keys(roleMapping).join(", ")}`);
    }
    return mappedRole as "Admin" | "CurriculumCommittee" | "DepartmentChair" | "Registrar";
  }),
});
