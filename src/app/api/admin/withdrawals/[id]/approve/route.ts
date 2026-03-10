import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// PATCH - Approve withdrawal and deduct balance
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

    // Get the withdrawal
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
      },
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

    // Check if seller has enough balance
    if (withdrawal.user.balance < withdrawal.amount) {
      return NextResponse.json(
        { error: `Saldo penjual tidak mencukupi. Saldo saat ini: Rp ${withdrawal.user.balance.toLocaleString("id-ID")}` },
        { status: 400 }
      );
    }

    // Transaction: Approve withdrawal and deduct balance
    const result = await prisma.$transaction(async (tx) => {
      // Update withdrawal status
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote,
          processedAt: new Date(),
          processedBy: user.id,
        },
      });

      // Deduct balance from seller
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: { decrement: withdrawal.amount },
        },
      });

      // Create balance history record
      await tx.balanceHistory.create({
        data: {
          userId: withdrawal.userId,
          amount: -withdrawal.amount,
          type: "WITHDRAWAL",
          note: `Penarikan saldo via Cash${adminNote ? ` - ${adminNote}` : ""}`,
        },
      });

      return updatedWithdrawal;
    });

    return NextResponse.json({
      message: "Penarikan berhasil disetujui",
      withdrawal: result,
    });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    return NextResponse.json(
      { error: "Gagal menyetujui penarikan" },
      { status: 500 }
    );
  }
}
