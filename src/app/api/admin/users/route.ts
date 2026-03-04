import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Ambil daftar user (khususnya PENJUAL pending)
export async function GET() {
  try {
    // Cek apakah user adalah admin
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Ambil semua PENJUAL (approved dan pending)
    const users = await prisma.user.findMany({
      where: {
        role: "PENJUAL",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: [
        { isApproved: "asc" }, // Pending first
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data user" },
      { status: 500 }
    );
  }
}
