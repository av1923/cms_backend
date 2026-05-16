import { OAuth2Client } from "google-auth-library";
import { prisma } from "../utils/db";
import { generateAccessToken, generateRefreshToken, UserRole } from "../utils/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;

if (!GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID must be configured in environment variables");
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid token payload");
    }

    return {
      sub: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
    };
  } catch (error) {
    throw new Error("Failed to verify Google token");
  }
}

interface GoogleAuthResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Map display names to enum values
const ROLE_MAPPING: Record<string, UserRole> = {
  'SYSTEM ADMIN': 'Admin',
  'ADMIN': 'Admin',
  'CURRICULUM COMMITTEE': 'CurriculumCommittee',
  'DEPARTMENT CHAIR': 'DepartmentChair',
  'REGISTRAR': 'Registrar',
  // Also accept the enum values directly
  'Admin': 'Admin',
  'CurriculumCommittee': 'CurriculumCommittee',
  'DepartmentChair': 'DepartmentChair',
  'Registrar': 'Registrar',
};

function normalizeRole(role: string): UserRole {
  const normalized = ROLE_MAPPING[role.toUpperCase().replace(/\s+/g, ' ')];
  if (!normalized) {
    throw new Error(`Invalid role: ${role}. Expected one of: Admin, CurriculumCommittee, DepartmentChair, Registrar`);
  }
  return normalized;
}

export async function authenticateWithGoogle(
  idToken: string,
  role?: string
): Promise<GoogleAuthResult> {
  const googleUser = await verifyGoogleToken(idToken);

  // Check if user exists by google_id
  let user = await prisma.user.findUnique({
    where: { google_id: googleUser.sub },
  });

  if (!user) {
    // Check if user exists by email (link existing account)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (existingUserByEmail) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { user_id: existingUserByEmail.user_id },
        data: { google_id: googleUser.sub },
      });
    } else {
      // Create new user
      if (!role) {
        throw new Error("Role is required for new users");
      }

      const normalizedRole = normalizeRole(role);

      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          google_id: googleUser.sub,
          role: normalizedRole,
        },
      });
    }
  }

  // Check if user is active
  if (!user.is_active) {
    throw new Error("Account is disabled");
  }

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