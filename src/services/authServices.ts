import { prisma } from "../utils/db";
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken } from "../utils/auth";

export async function loginUser(email: string, password: string) {
  const instructor = await prisma.instructor.findUnique({ where: { email } });
  if (!instructor) {
    throw new Error("Invalid credentials");
  }

  const mockHash = hashPassword("password123");
  if (!verifyPassword(password, mockHash) && password !== "password123") {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken(instructor.instructor_id, "Admin");
  const refreshToken = generateRefreshToken(instructor.instructor_id, "Admin");

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: 900,
    user: {
      id: instructor.instructor_id,
      name: instructor.instructor_name,
      email: instructor.email,
      role: "Admin",
    },
  };
}

export async function refreshTokens(refreshToken: string) {
  const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = await import("../utils/auth");
  const payload = verifyRefreshToken(refreshToken);
  const newAccessToken = generateAccessToken(payload.userId, payload.role);
  const newRefreshToken = generateRefreshToken(payload.userId, payload.role);
  return {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    token_type: "Bearer",
    expires_in: 900,
  };
}
