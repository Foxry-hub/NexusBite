import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Get withdrawal history for penjual
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all withdrawals for this seller
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get seller's current balance
    const seller = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    // Calculate pending withdrawal amount
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      _sum: { amount: true },
    });

    // Calculate total withdrawn (approved)
    const totalWithdrawn = await prisma.withdrawal.aggregate({
      where: {
        userId: user.id,
        status: "APPROVED",
      },
      _sum: { amount: true },
    });

    return NextResponse.json({
      withdrawals,
      balance: seller?.balance || 0,
      pendingAmount: pendingWithdrawals._sum.amount || 0,
      totalWithdrawn: totalWithdrawn._sum.amount || 0,
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data penarikan" },
      { status: 500 }
    );
  }
}

// POST - Request new withdrawal
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { amount, note } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah penarikan harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Check minimum withdrawal amount (e.g., Rp 10.000)
    const MIN_WITHDRAWAL = 10000;
    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum penarikan adalah Rp ${MIN_WITHDRAWAL.toLocaleString("id-ID")}` },
        { status: 400 }
      );
    }

    // Get current balance and pending withdrawals
    const seller = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    if (!seller) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Calculate pending withdrawal amount
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      _sum: { amount: true },
    });

    const pendingAmount = pendingWithdrawals._sum.amount || 0;
    const availableBalance = seller.balance - pendingAmount;

    // Check if user has enough balance
    if (amount > availableBalance) {
      return NextResponse.json(
        { 
          error: `Saldo tidak mencukupi. Saldo tersedia: Rp ${availableBalance.toLocaleString("id-ID")}${pendingAmount > 0 ? ` (Rp ${pendingAmount.toLocaleString("id-ID")} sedang diproses)` : ""}` 
        },
        { status: 400 }
      );
    }

    // Calculate admin fee (5%)
    const ADMIN_FEE_PERCENTAGE = 0.05;
    const adminFee = Math.round(amount * ADMIN_FEE_PERCENTAGE);
    const netAmount = amount - adminFee;

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        adminFee,
        netAmount,
        method: "CASH",
        note: note || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Permintaan penarikan berhasil diajukan",
      withdrawal,
    });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    return NextResponse.json(
      { error: "Gagal mengajukan penarikan" },
      { status: 500 }
    );
  }
}
