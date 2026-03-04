import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get all available menus for public display (with seller info)
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
