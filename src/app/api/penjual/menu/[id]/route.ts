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

// PATCH - Update menu
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, price, image, status } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price);
    if (image !== undefined) updateData.image = image;
    if (status !== undefined) updateData.status = status;

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

// DELETE - Delete menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PENJUAL" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

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
