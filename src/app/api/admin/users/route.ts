import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Ambil daftar user (SISWA dan PENJUAL)
export async function GET(request: NextRequest) {
  try {
    // Cek apakah user adalah admin
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // SISWA, PENJUAL, atau null untuk semua

    // Build query berdasarkan role filter
    const whereClause: { role?: "SISWA" | "PENJUAL" } = {};
    if (role === "SISWA" || role === "PENJUAL") {
      whereClause.role = role;
    }

    // Ambil semua user (kecuali ADMIN)
    const users = await prisma.user.findMany({
      where: {
        ...whereClause,
        role: role === "SISWA" || role === "PENJUAL" ? role : { in: ["SISWA", "PENJUAL"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        balance: true,
        kelas: true,
        jurusan: true,
        nis: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            menus: true,
          },
        },
      },
      orderBy: [
        { isApproved: "asc" }, // Pending first
        { createdAt: "desc" },
      ],
    });

    // Count users by type
    const stats = await prisma.user.groupBy({
      by: ["role", "isApproved"],
      where: {
        role: { in: ["SISWA", "PENJUAL"] },
      },
      _count: true,
    });

    // Process stats
    const userStats = {
      totalSiswa: 0,
      totalPenjual: 0,
      pendingPenjual: 0,
      approvedPenjual: 0,
    };

    stats.forEach((stat) => {
      if (stat.role === "SISWA") {
        userStats.totalSiswa += stat._count;
      } else if (stat.role === "PENJUAL") {
        userStats.totalPenjual += stat._count;
        if (stat.isApproved) {
          userStats.approvedPenjual += stat._count;
        } else {
          userStats.pendingPenjual += stat._count;
        }
      }
    });

    return NextResponse.json({ users, stats: userStats });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data user" },
      { status: 500 }
    );
  }
}
