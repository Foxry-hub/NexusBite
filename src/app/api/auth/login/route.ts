import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

type RoleType = "SISWA" | "PENJUAL" | "ADMIN";

// Fungsi untuk mendapatkan redirect URL berdasarkan role
function getRedirectUrlByRole(role: RoleType): string {
  switch (role) {
    case "SISWA":
      return "/dashboard/siswa";
    case "PENJUAL":
      return "/dashboard/penjual";
    case "ADMIN":
      return "/admin/menu";
    default:
      return "/";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Find user by email (include password for verification)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isApproved: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Check if PENJUAL is approved by admin
    if (user.role === "PENJUAL" && !user.isApproved) {
      return NextResponse.json(
        { error: "Akun Anda belum disetujui oleh admin. Silakan tunggu konfirmasi." },
        { status: 403 }
      );
    }

    // Create session
    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    // Get redirect URL based on role
    const redirectUrl = getRedirectUrlByRole(user.role as RoleType);

    // Return user data (excluding password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectUrl,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
