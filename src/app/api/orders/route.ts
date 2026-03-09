import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { randomUUID } from "crypto";

// Helper function to generate group number (NXB-YYMMDD-XXX)
async function generateGroupNumber(): Promise<string> {
  const today = new Date();
  const datePrefix = today.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
  
  // Get count of order groups today for sequential numbering
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  const todayGroupCount = await prisma.orderGroup.count({
    where: {
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });
  
  const sequenceNumber = String(todayGroupCount + 1).padStart(3, "0");
  return `NXB-${datePrefix}-${sequenceNumber}`;
}

// Helper function to generate 4-digit PIN
function generateVerificationCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// GET - Get current user's order groups (for Siswa)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order groups with all orders and items
    const orderGroups = await prisma.orderGroup.findMany({
      where: { userId: user.id },
      include: {
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orderGroups });
  } catch (error) {
    console.error("Get order groups error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

// POST - Create new order group with orders per seller (for Siswa)
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

    // Get menu items with seller info
    const menuIds = items.map((item: { menuId: string }) => item.menuId);
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds }, status: "AVAILABLE" },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (menus.length !== menuIds.length) {
      return NextResponse.json(
        { error: "Beberapa menu tidak tersedia" },
        { status: 400 }
      );
    }

    // Group items by seller
    const itemsBySeller: Map<string, { sellerId: string; sellerName: string; items: { menuId: string; quantity: number; price: number }[] }> = new Map();

    for (const item of items as { menuId: string; quantity: number }[]) {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) throw new Error("Menu not found");

      const sellerId = menu.sellerId;
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, {
          sellerId,
          sellerName: menu.seller.name,
          items: [],
        });
      }

      itemsBySeller.get(sellerId)!.items.push({
        menuId: item.menuId,
        quantity: item.quantity,
        price: menu.price,
      });
    }

    // Calculate total amount across all sellers
    let grandTotal = 0;
    for (const [, sellerData] of itemsBySeller) {
      for (const item of sellerData.items) {
        grandTotal += item.price * item.quantity;
      }
    }

    // Check user balance
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    if (!currentUser || currentUser.balance < grandTotal) {
      return NextResponse.json(
        {
          error: "Saldo tidak mencukupi",
          required: grandTotal,
          balance: currentUser?.balance || 0,
        },
        { status: 400 }
      );
    }

    // Pre-generate group number BEFORE transaction
    const groupNumber = await generateGroupNumber();
    const verificationCode = generateVerificationCode();
    const qrToken = randomUUID();

    // Create order group and orders in a transaction
    const orderGroup = await prisma.$transaction(async (tx) => {
      // Deduct balance
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: grandTotal } },
      });

      // Record balance history for purchase
      await tx.balanceHistory.create({
        data: {
          userId: user.id,
          amount: -grandTotal,
          type: "PURCHASE",
          note: `Pembelian dari ${itemsBySeller.size} toko`,
        },
      });

      // Create order group
      const newOrderGroup = await tx.orderGroup.create({
        data: {
          groupNumber,
          userId: user.id,
          totalAmount: grandTotal,
          pickupTime,
          verificationCode,
          qrToken,
        },
      });

      // Create separate order for each seller
      for (const [sellerId, sellerData] of itemsBySeller) {
        // Calculate total for this seller
        const sellerTotal = sellerData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        await tx.order.create({
          data: {
            orderGroupId: newOrderGroup.id,
            userId: user.id,
            sellerId,
            totalAmount: sellerTotal,
            status: "PENDING",
            items: {
              create: sellerData.items.map((item) => ({
                menuId: item.menuId,
                quantity: item.quantity,
              })),
            },
          },
        });
      }

      // Return the created order group with all relations
      return tx.orderGroup.findUnique({
        where: { id: newOrderGroup.id },
        include: {
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
    });

    // Get updated balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    return NextResponse.json({
      success: true,
      orderGroup,
      sellerCount: itemsBySeller.size,
      grandTotal,
      newBalance: updatedUser?.balance || 0,
    });
  } catch (error) {
    console.error("Create order group error:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal membuat pesanan";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
