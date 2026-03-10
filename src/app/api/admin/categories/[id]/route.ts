import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/categories/[id] — Get single category
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { menus: true }
                }
            }
        });

        if (!category) {
            return NextResponse.json(
                { error: "Kategori tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("Failed to fetch category:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data kategori" },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/categories/[id] — Update category
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description } = body;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Kategori tidak ditemukan" },
                { status: 404 }
            );
        }

        // If name is being changed, check for duplicates
        if (name && name.trim() !== existingCategory.name) {
            const duplicateCategory = await prisma.category.findUnique({
                where: { name: name.trim() }
            });

            if (duplicateCategory) {
                return NextResponse.json(
                    { error: "Kategori dengan nama tersebut sudah ada" },
                    { status: 400 }
                );
            }
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
            },
        });

        return NextResponse.json({ success: true, category: updatedCategory });
    } catch (error) {
        console.error("Failed to update category:", error);
        return NextResponse.json(
            { error: "Gagal memperbarui kategori" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/categories/[id] — Delete category
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { menus: true }
                }
            }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Kategori tidak ditemukan" },
                { status: 404 }
            );
        }

        // Check if category has menus - will set menus' categoryId to null due to onDelete: SetNull
        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Kategori "${existingCategory.name}" berhasil dihapus. ${existingCategory._count.menus} menu tidak lagi memiliki kategori.`
        });
    } catch (error) {
        console.error("Failed to delete category:", error);
        return NextResponse.json(
            { error: "Gagal menghapus kategori" },
            { status: 500 }
        );
    }
}
