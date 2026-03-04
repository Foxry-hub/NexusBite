import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

type RoleType = "SISWA" | "PENJUAL" | "ADMIN";

// Domain email siswa yang diakui
const STUDENT_EMAIL_DOMAINS = [
  "@smkn40-jkt.sch.id",
  "@student.smkn40-jkt.sch.id",
];

// Fungsi untuk menentukan role berdasarkan email
function determineRoleFromEmail(email: string): RoleType {
  const emailLower = email.toLowerCase();
  
  // Cek apakah email menggunakan domain siswa
  for (const domain of STUDENT_EMAIL_DOMAINS) {
    if (emailLower.endsWith(domain)) {
      return "SISWA";
    }
  }
  
  // Default ke PENJUAL untuk email umum (perlu approval admin)
  return "PENJUAL";
}

// Fungsi untuk mendapatkan redirect URL berdasarkan role
export function getRedirectUrlByRole(role: RoleType): string {
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
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Determine role automatically based on email domain
    const userRole = determineRoleFromEmail(email);

    // SISWA langsung auto-approved, PENJUAL perlu approval admin
    const isApproved = userRole === "SISWA";

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userRole,
        isApproved,
      },
    });

    // Jika PENJUAL, tidak buat session - perlu approval admin dulu
    if (userRole === "PENJUAL") {
      return NextResponse.json({
        success: true,
        pendingApproval: true,
        message: "Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan admin.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // SISWA: Create session and set cookie
    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    // Get redirect URL based on role
    const redirectUrl = getRedirectUrlByRole(user.role as RoleType);

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
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    );
  }
}
