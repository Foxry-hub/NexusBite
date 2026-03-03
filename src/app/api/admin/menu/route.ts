import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/menu — Fetch all menus
export async function GET() {
    try {
        const menus = await prisma.menu.findMany({
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

// POST /api/admin/menu — Create a new menu
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, price, image } = body;

        if (!name || !description || price === undefined) {
            return NextResponse.json(
                { error: "Name, description, and price are required" },
                { status: 400 }
            );
        }

        const menu = await prisma.menu.create({
            data: {
                name,
                description,
                price: Number(price),
                image: image || null,
                status: "AVAILABLE",
            },
        });

        return NextResponse.json(menu, { status: 201 });
    } catch (error) {
        console.error("Failed to create menu:", error);
        return NextResponse.json(
            { error: "Failed to create menu" },
            { status: 500 }
        );
    }
}
