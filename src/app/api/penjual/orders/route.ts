import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Get orders for current Penjual (filtered by seller)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter orders by sellerId (penjual only sees their own orders)
    // Admin can see all orders
    const whereClause = {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      ...(user.role === "PENJUAL" ? { sellerId: user.id } : {}),
    };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderGroup: {
          select: {
            id: true,
            groupNumber: true,
            pickupTime: true,
            verificationCode: true,
            qrToken: true,
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
      orderBy: { createdAt: "asc" },
    });

    // Group by pickup time (from orderGroup)
    const break1Orders = orders.filter((o) => o.orderGroup?.pickupTime === "BREAK_1");
    const break2Orders = orders.filter((o) => o.orderGroup?.pickupTime === "BREAK_2");

    return NextResponse.json({
      orders,
      grouped: {
        BREAK_1: break1Orders,
        BREAK_2: break2Orders,
      },
      stats: {
        total: orders.length,
        pending: orders.filter((o) => o.status === "PENDING").length,
        preparing: orders.filter((o) => o.status === "PREPARING").length,
        ready: orders.filter((o) => o.status === "READY").length,
        completed: orders.filter((o) => o.status === "COMPLETED").length,
      },
    });
  } catch (error) {
    console.error("Get penjual orders error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}
