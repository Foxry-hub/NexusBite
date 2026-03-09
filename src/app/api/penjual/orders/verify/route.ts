import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// POST - Verify order by QR token or PIN code
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { qrToken, verificationCode, orderId } = body;

    // Must provide either qrToken, verificationCode, or orderId with PIN
    if (!qrToken && !verificationCode && !orderId) {
      return NextResponse.json(
        { error: "Masukkan QR Code atau PIN verifikasi" },
        { status: 400 }
      );
    }

    // Build query based on what's provided
    let order;

    if (qrToken) {
      // Verify by QR Token
      order = await prisma.order.findUnique({
        where: { qrToken },
        include: {
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
              menu: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    } else if (orderId && verificationCode) {
      // Verify by Order ID + PIN
      order = await prisma.order.findFirst({
        where: {
          id: orderId,
          verificationCode,
        },
        include: {
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
              menu: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    } else if (verificationCode) {
      // Verify by PIN only (search today's orders)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      order = await prisma.order.findFirst({
        where: {
          verificationCode,
          sellerId: user.role === "PENJUAL" ? user.id : undefined,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: { not: "COMPLETED" },
        },
        include: {
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
              menu: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    }

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan atau PIN salah" },
        { status: 404 }
      );
    }

    // Check if this order belongs to the current seller (for PENJUAL)
    if (user.role === "PENJUAL" && order.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Pesanan ini bukan untuk toko Anda" },
        { status: 403 }
      );
    }

    // Check if order is already completed
    if (order.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Pesanan ini sudah selesai diambil" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        pickupTime: order.pickupTime,
        verificationCode: order.verificationCode,
        createdAt: order.createdAt,
        user: order.user,
        items: order.items,
      },
    });
  } catch (error) {
    console.error("Verify order error:", error);
    return NextResponse.json(
      { error: "Gagal memverifikasi pesanan" },
      { status: 500 }
    );
  }
}

// PATCH - Complete order after verification
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID diperlukan" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if this order belongs to the current seller (for PENJUAL)
    if (user.role === "PENJUAL" && order.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Pesanan ini bukan untuk toko Anda" },
        { status: 403 }
      );
    }

    // Check if order is already completed
    if (order.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Pesanan ini sudah selesai" },
        { status: 400 }
      );
    }

    // Update order status to COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            menu: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil diselesaikan",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Complete order error:", error);
    return NextResponse.json(
      { error: "Gagal menyelesaikan pesanan" },
      { status: 500 }
    );
  }
}
