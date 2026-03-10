import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Get penjual's own menus
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only get menus belonging to this seller
    const menus = await prisma.menu.findMany({
      where: { sellerId: user.id },
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ menus });
  } catch (error) {
    console.error("Get menus error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}

// POST - Create new menu (owned by logged in penjual)
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
    const { name, description, price, image, status, categoryId } = body;

    if (!name || !description || !price) {
      return NextResponse.json(
        { error: "Nama, deskripsi, dan harga harus diisi" },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: "Harga tidak valid" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        description,
        price: parseInt(price),
        image: image || null,
        status: status || "AVAILABLE",
        sellerId: user.id, // Assign to logged in penjual
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json({ success: true, menu });
  } catch (error) {
    console.error("Create menu error:", error);
    return NextResponse.json(
      { error: "Gagal membuat menu" },
      { status: 500 }
    );
  }
}
