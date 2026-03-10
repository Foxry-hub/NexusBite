import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Get all withdrawal requests (for admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED, or all

    const whereClause: Record<string, unknown> = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      whereClause.status = status;
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { createdAt: "desc" },
      ],
      take: 100,
    });

    // Get statistics
    const stats = await prisma.withdrawal.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amount: true },
    });

    const statsMap: Record<string, { count: number; amount: number }> = {
      PENDING: { count: 0, amount: 0 },
      APPROVED: { count: 0, amount: 0 },
      REJECTED: { count: 0, amount: 0 },
    };

    stats.forEach((s: { status: string; _count: { id: number }; _sum: { amount: number | null } }) => {
      statsMap[s.status] = {
        count: s._count.id,
        amount: s._sum.amount || 0,
      };
    });

    return NextResponse.json({
      withdrawals,
      stats: statsMap,
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data penarikan" },
      { status: 500 }
    );
  }
}
