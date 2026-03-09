import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["PENDING", "PREPARING", "READY", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Check if order exists and belongs to this seller
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Penjual can only update their own orders
    if (user.role === "PENJUAL" && existingOrder.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke pesanan ini" },
        { status: 403 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderGroup: {
          select: {
            id: true,
            groupNumber: true,
            pickupTime: true,
            verificationCode: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            kelas: true,
          },
        },
        items: {
          include: {
            menu: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate status pesanan" },
      { status: 500 }
    );
  }
}
