import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// POST - Verify order by QR token or PIN code (finds seller's order within group)
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
    const { qrToken, verificationCode } = body;

    // Must provide either qrToken or verificationCode
    if (!qrToken && !verificationCode) {
      return NextResponse.json(
        { error: "Masukkan QR Code atau PIN verifikasi" },
        { status: 400 }
      );
    }

    // Find order group by QR token or verification code
    let orderGroup;

    if (qrToken) {
      orderGroup = await prisma.orderGroup.findUnique({
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
          orders: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
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
          },
        },
      });
    } else if (verificationCode) {
      // Search today's order groups by PIN
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      orderGroup = await prisma.orderGroup.findFirst({
        where: {
          verificationCode,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
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
          orders: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
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
          },
        },
      });
    }

    if (!orderGroup) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan atau PIN salah" },
        { status: 404 }
      );
    }

    // Find the seller's order within this group
    const sellerOrder = orderGroup.orders.find(
      (order) => order.sellerId === user.id
    );

    if (!sellerOrder && user.role === "PENJUAL") {
      return NextResponse.json(
        { error: "Tidak ada pesanan untuk toko Anda dalam transaksi ini" },
        { status: 404 }
      );
    }

    // For admin, return all orders; for seller, return only their order
    const relevantOrder = user.role === "PENJUAL" ? sellerOrder : orderGroup.orders[0];

    if (!relevantOrder) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if this seller's order is already completed
    if (relevantOrder.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Pesanan Anda dalam transaksi ini sudah selesai diambil" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderGroup: {
        id: orderGroup.id,
        groupNumber: orderGroup.groupNumber,
        totalAmount: orderGroup.totalAmount,
        pickupTime: orderGroup.pickupTime,
        verificationCode: orderGroup.verificationCode,
        createdAt: orderGroup.createdAt,
        user: orderGroup.user,
      },
      // Return only the seller's order for completion
      order: {
        id: relevantOrder.id,
        status: relevantOrder.status,
        totalAmount: relevantOrder.totalAmount,
        seller: relevantOrder.seller,
        items: relevantOrder.items,
        user: orderGroup.user, // Include user info from order group
      },
      // Show all orders in group for context (seller names and status only)
      allOrders: orderGroup.orders.map((o) => ({
        id: o.id,
        sellerName: o.seller?.name,
        status: o.status,
        totalAmount: o.totalAmount,
        isYours: o.sellerId === user.id,
      })),
    });
  } catch (error) {
    console.error("Verify order error:", error);
    return NextResponse.json(
      { error: "Gagal memverifikasi pesanan" },
      { status: 500 }
    );
  }
}

// PATCH - Complete order after verification (only seller's portion)
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
      include: {
        orderGroup: true,
      },
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

    // Update order status to COMPLETED and add balance to seller
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const completedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" },
        include: {
          orderGroup: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              menu: true,
            },
          },
        },
      });

      // Add balance to seller
      if (completedOrder.sellerId) {
        await tx.user.update({
          where: { id: completedOrder.sellerId },
          data: { balance: { increment: completedOrder.totalAmount } },
        });

        // Record balance history for seller
        await tx.balanceHistory.create({
          data: {
            userId: completedOrder.sellerId,
            amount: completedOrder.totalAmount,
            type: "SALE",
            note: `Penjualan ${completedOrder.orderGroup.groupNumber} - ${completedOrder.user.name}`,
          },
        });
      }

      return completedOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil diselesaikan",
      order: updatedOrder,
      addedBalance: order.totalAmount,
    });
  } catch (error) {
    console.error("Complete order error:", error);
    return NextResponse.json(
      { error: "Gagal menyelesaikan pesanan" },
      { status: 500 }
    );
  }
}
