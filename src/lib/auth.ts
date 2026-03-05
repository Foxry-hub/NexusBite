import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

const SESSION_COOKIE_NAME = "nexusbite_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "SISWA" | "PENJUAL" | "ADMIN";
  balance: number;
  profilePhoto?: string | null;
};

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create session (simple base64 encoded JSON - for production use JWT)
export async function createSession(userId: string): Promise<string> {
  const sessionData = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(sessionData)).toString("base64");
}

// Verify session and get user
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );

    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        profilePhoto: true,
      },
    });

    return user as SessionUser | null;
  } catch {
    return null;
  }
}

// Set session cookie
export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Check if user has required role
export function hasRole(
  user: SessionUser | null,
  requiredRoles: SessionUser["role"][]
): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}
