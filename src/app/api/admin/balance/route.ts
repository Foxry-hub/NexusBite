import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Search users for balance top-up
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
    const query = searchParams.get("q") || "";

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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: parseInt(amount) } },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
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
