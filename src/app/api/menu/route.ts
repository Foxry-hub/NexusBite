import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get all available menus for public display (with seller info and order count)
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total orders for each menu
    const menusWithOrderCount = menus.map((menu) => ({
      ...menu,
      totalOrders: menu.orderItems.reduce((acc, item) => acc + item.quantity, 0),
      orderItems: undefined, // Remove orderItems from response
    }));

    return NextResponse.json({ menus: menusWithOrderCount });
  } catch (error) {
    console.error("Get menus error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}
