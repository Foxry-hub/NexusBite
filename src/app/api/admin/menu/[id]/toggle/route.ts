import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/admin/menu/[id]/toggle — Toggle menu status
export async function PATCH(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const menu = await prisma.menu.findUnique({ where: { id } });

        if (!menu) {
            return NextResponse.json({ error: "Menu not found" }, { status: 404 });
        }

        const updatedMenu = await prisma.menu.update({
            where: { id },
            data: {
                status: menu.status === "AVAILABLE" ? "OUT_OF_STOCK" : "AVAILABLE",
            },
        });

        return NextResponse.json(updatedMenu);
    } catch (error) {
        console.error("Failed to toggle menu status:", error);
        return NextResponse.json(
            { error: "Failed to toggle menu status" },
            { status: 500 }
        );
    }
}
