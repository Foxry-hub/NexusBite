import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Get penjual's menus
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const menus = await prisma.menu.findMany({
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

// POST - Create new menu
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
    const { name, description, price, image, status } = body;

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
