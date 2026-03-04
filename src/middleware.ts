import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "nexusbite_session";

// Decode session from cookie (simple base64 JSON)
function decodeSession(sessionCookie: string): { userId: string; expiresAt: number } | null {
  try {
    const decoded = Buffer.from(sessionCookie, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Protected routes that require authentication
  const protectedRoutes = ["/admin", "/dashboard"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // No session cookie - redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Decode session
    const session = decodeSession(sessionCookie);
    if (!session || session.expiresAt < Date.now()) {
      // Invalid or expired session - redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Session is valid, allow access
    // Note: Role checking is done in the respective layout/page components
    return NextResponse.next();
  }

  // For login page, redirect authenticated users to home (which will check role and redirect to dashboard)
  if (pathname === "/login" && sessionCookie) {
    const session = decodeSession(sessionCookie);
    if (session && session.expiresAt > Date.now()) {
      // User is already logged in - redirect to home (home will check role and redirect to proper dashboard)
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login"],
};
