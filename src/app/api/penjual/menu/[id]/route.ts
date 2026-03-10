import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET - Get single menu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true },
        },
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}

// PATCH - Update menu (only owner can update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    
    // Check if menu belongs to this seller
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu tidak ditemukan" }, { status: 404 });
    }

    if (existingMenu.sellerId !== user.id) {
      return NextResponse.json({ error: "Anda tidak memiliki akses ke menu ini" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, image, status, categoryId } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price);
    if (image !== undefined) updateData.image = image;
    if (status !== undefined) updateData.status = status;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;

    const menu = await prisma.menu.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, menu });
  } catch (error) {
    console.error("Update menu error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate menu" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu (only owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if menu belongs to this seller
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu tidak ditemukan" }, { status: 404 });
    }

    if (existingMenu.sellerId !== user.id) {
      return NextResponse.json({ error: "Anda tidak memiliki akses ke menu ini" }, { status: 403 });
    }

    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete menu error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus menu" },
      { status: 500 }
    );
  }
}
