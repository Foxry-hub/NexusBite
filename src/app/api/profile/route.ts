import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        profilePhoto: true,
        kelas: true,
        jurusan: true,
        tanggalLahir: true,
        nis: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only SISWA can update profile
    if (sessionUser.role !== "SISWA") {
      return NextResponse.json(
        { error: "Fitur profile hanya untuk siswa" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, profilePhoto, kelas, jurusan, tanggalLahir, nis } = body;

    // Check if NIS is already used by another user
    if (nis) {
      const existingUser = await prisma.user.findFirst({
        where: {
          nis: nis,
          id: { not: sessionUser.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "NIS sudah digunakan oleh siswa lain" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: name || undefined,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : undefined,
        kelas: kelas !== undefined ? kelas : undefined,
        jurusan: jurusan !== undefined ? jurusan : undefined,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
        nis: nis !== undefined ? nis : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        profilePhoto: true,
        kelas: true,
        jurusan: true,
        tanggalLahir: true,
        nis: true,
      },
    });

    return NextResponse.json({ 
      message: "Profile berhasil diperbarui",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
