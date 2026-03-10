import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// PATCH - Reject withdrawal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { adminNote } = body;

    if (!adminNote) {
      return NextResponse.json(
        { error: "Alasan penolakan harus diisi" },
        { status: 400 }
      );
    }

    // Get the withdrawal
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Permintaan penarikan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        { error: "Permintaan penarikan sudah diproses sebelumnya" },
        { status: 400 }
      );
    }

    // Update withdrawal status to rejected
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNote,
        processedAt: new Date(),
        processedBy: user.id,
      },
    });

    return NextResponse.json({
      message: "Penarikan berhasil ditolak",
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    return NextResponse.json(
      { error: "Gagal menolak penarikan" },
      { status: 500 }
    );
  }
}
