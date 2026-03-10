import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/categories — Fetch all categories (Admin only)
export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { menus: true }
                }
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

// POST /api/admin/categories — Create new category (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name || name.trim() === "") {
            return NextResponse.json(
                { error: "Nama kategori harus diisi" },
                { status: 400 }
            );
        }

        // Check if category with same name already exists
        const existingCategory = await prisma.category.findUnique({
            where: { name: name.trim() }
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "Kategori dengan nama tersebut sudah ada" },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
            },
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error("Failed to create category:", error);
        return NextResponse.json(
            { error: "Gagal membuat kategori" },
            { status: 500 }
        );
    }
}
