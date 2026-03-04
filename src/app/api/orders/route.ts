import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Get current user's orders (for Siswa)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

// POST - Create new order (for Siswa)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "SISWA") {
      return NextResponse.json(
        { error: "Hanya siswa yang dapat membuat pesanan" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { items, pickupTime } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Pesanan tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!pickupTime || !["BREAK_1", "BREAK_2"].includes(pickupTime)) {
      return NextResponse.json(
        { error: "Pilih waktu pengambilan yang valid" },
        { status: 400 }
      );
    }

    // Get menu items and calculate total
    const menuIds = items.map((item: { menuId: string }) => item.menuId);
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds }, status: "AVAILABLE" },
    });

    if (menus.length !== menuIds.length) {
      return NextResponse.json(
        { error: "Beberapa menu tidak tersedia" },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item: { menuId: string; quantity: number }) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) throw new Error("Menu not found");
      totalAmount += menu.price * item.quantity;
      return {
        menuId: item.menuId,
        quantity: item.quantity,
      };
    });

    // Check user balance
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    if (!currentUser || currentUser.balance < totalAmount) {
      return NextResponse.json(
        { 
          error: "Saldo tidak mencukupi",
          required: totalAmount,
          balance: currentUser?.balance || 0,
        },
        { status: 400 }
      );
    }

    // Create order and deduct balance in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Deduct balance
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: totalAmount } },
      });

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          pickupTime,
          status: "PENDING",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              menu: true,
            },
          },
        },
      });

      return newOrder;
    });

    // Get updated balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    return NextResponse.json({
      success: true,
      order,
      newBalance: updatedUser?.balance || 0,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}
