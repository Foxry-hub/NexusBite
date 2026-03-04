import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/menu — Fetch all menus with seller info (Admin view only)
export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const menus = await prisma.menu.findMany({
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(menus);
    } catch (error) {
        console.error("Failed to fetch menus:", error);
        return NextResponse.json(
            { error: "Failed to fetch menus" },
            { status: 500 }
        );
    }
}

// Note: Menu creation/editing is now handled by PENJUAL via /api/penjual/menu
