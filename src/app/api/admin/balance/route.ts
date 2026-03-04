import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Search users for balance top-up OR get history
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
    const query = searchParams.get("q");
    const getHistory = searchParams.get("history");

    // Get balance history
    if (getHistory === "true") {
      const history = await prisma.balanceHistory.findMany({
        where: { type: "TOP_UP" },
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
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json({ history });
    }

    // Search users
    if (query && query.length >= 2) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
          role: "SISWA",
        },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
        },
        take: 10,
      });

      return NextResponse.json({ users });
    }

    return NextResponse.json({ users: [] });
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json(
      { error: "Gagal mencari user" },
      { status: 500 }
    );
  }
}

// POST - Top up balance
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || !amount) {
      return NextResponse.json(
        { error: "User ID dan jumlah harus diisi" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah top-up harus lebih dari 0" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Use transaction to update balance and create history
    const [updatedUser, historyEntry] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: parseInt(amount) } },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
        },
      }),
      prisma.balanceHistory.create({
        data: {
          userId: userId,
          amount: parseInt(amount),
          type: "TOP_UP",
          note: `Top-up saldo oleh admin`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      historyId: historyEntry.id,
      message: `Berhasil top-up Rp ${parseInt(amount).toLocaleString("id-ID")} untuk ${updatedUser.name}`,
    });
  } catch (error) {
    console.error("Top up error:", error);
    return NextResponse.json(
      { error: "Gagal melakukan top-up" },
      { status: 500 }
    );
  }
}
