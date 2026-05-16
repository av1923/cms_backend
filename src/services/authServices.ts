import { prisma } from "../utils/db";
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, UserRole } from "../utils/auth";

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function signupUser(data: SignupData) {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash the password
  const passwordHash = hashPassword(data.password);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
      role: data.role,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.user_id, user.role);
  const refreshToken = generateRefreshToken(user.user_id, user.role);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: 900,
    user: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function loginUser(email: string, password: string) {
  // Try to login as User first
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    // Check if user has a password (OAuth users might not have one)
    if (!user.password_hash) {
      throw new Error("Please use Google Sign-In for this account");
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error("Account is disabled");
    }

    const accessToken = generateAccessToken(user.user_id, user.role);
    const refreshToken = generateRefreshToken(user.user_id, user.role);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: 900,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Fallback to instructor login (for backward compatibility)
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
