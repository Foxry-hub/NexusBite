import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// POST: Approve user PENJUAL
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Cek apakah user adalah admin
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Cari user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (user.role !== "PENJUAL") {
      return NextResponse.json(
        { error: "Hanya user PENJUAL yang bisa disetujui" },
        { status: 400 }
      );
    }

    // Update isApproved
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.name} berhasil disetujui`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyetujui user" },
      { status: 500 }
    );
  }
}
