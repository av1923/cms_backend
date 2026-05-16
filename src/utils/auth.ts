import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets must be configured");
}

export interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export type UserRole =
  | "CurriculumCommittee"
  | "DepartmentChair"
  | "Registrar"
  | "Admin";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  CurriculumCommittee: ["POST /api/v1/courses", "GET /api/v1/courses/catalog", "GET /api/v1/courses/*", "GET /api/v1/audit-logs"],
  DepartmentChair: ["PATCH /api/v1/courses/*/instructor", "GET /api/v1/courses/catalog", "GET /api/v1/courses/*", "GET /api/v1/audit-logs"],
  Registrar: ["PATCH /api/v1/courses/*/sections", "GET /api/v1/courses/catalog", "GET /api/v1/courses/*", "GET /api/v1/audit-logs"],
  Admin: ["*"],
};

export function hashPassword(password: string): string {
  return bcryptjs.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcryptjs.compareSync(password, hash);
}

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}

export function hasPermission(role: string, method: string, path: string): boolean {
  const permissions = ROLE_PERMISSIONS[role as UserRole] || [];
  if (permissions.includes("*")) return true;
  const action = `${method} ${path}`;
  return permissions.some((perm) => {
    if (perm === action) return true;
    const pattern = perm.replace(/\*/g, "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(action);
  });
}
