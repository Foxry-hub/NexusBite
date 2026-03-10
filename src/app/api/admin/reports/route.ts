import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Get daily report
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
    const dateParam = searchParams.get("date");
    
    // Use provided date or today
    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all completed orders for the day
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: date,
          lt: nextDay,
        },
      },
      include: {
        items: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedRevenue = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Count menu items sold
    const menuSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const menuId = item.menu.id;
        if (!menuSales[menuId]) {
          menuSales[menuId] = {
            name: item.menu.name,
            quantity: 0,
            revenue: 0,
          };
        }
        menuSales[menuId].quantity += item.quantity;
        menuSales[menuId].revenue += item.menu.price * item.quantity;
      });
    });

    // Sort by quantity sold (best sellers)
    const bestSellers = Object.entries(menuSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity);

    // Order stats
    const orderStats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      preparing: orders.filter((o) => o.status === "PREPARING").length,
      ready: orders.filter((o) => o.status === "READY").length,
      completed: orders.filter((o) => o.status === "COMPLETED").length,
    };

    // Get withdrawals for the day
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        createdAt: {
          gte: date,
          lt: nextDay,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Withdrawal stats
    const withdrawalStats = {
      total: withdrawals.length,
      pending: withdrawals.filter((w) => w.status === "PENDING").length,
      approved: withdrawals.filter((w) => w.status === "APPROVED").length,
      rejected: withdrawals.filter((w) => w.status === "REJECTED").length,
      totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
      totalAdminFee: withdrawals.reduce((sum, w) => sum + w.adminFee, 0),
      totalNetAmount: withdrawals.filter((w) => w.status === "APPROVED").reduce((sum, w) => sum + w.netAmount, 0),
      approvedAmount: withdrawals.filter((w) => w.status === "APPROVED").reduce((sum, w) => sum + w.amount, 0),
    };

    return NextResponse.json({
      date: date.toISOString().split("T")[0],
      totalRevenue,
      completedRevenue,
      orderStats,
      bestSellers,
      orders,
      withdrawals,
      withdrawalStats,
    });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil laporan" },
      { status: 500 }
    );
  }
}
