"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Tags,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    AlertCircle,
    Search,
    Package,
} from "lucide-react";

// --- Types ---
interface Category {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    _count: {
        menus: number;
    };
}

// --- Loading Skeleton ---
function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-lg bg-neutral-800" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 rounded bg-neutral-800" />
                            <div className="h-3 w-2/3 rounded bg-neutral-800" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- Main Page ---
export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form states
    const [formName, setFormName] = useState("");
    const [formDescription, setFormDescription] = useState("");

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const resetForm = () => {
        setFormName("");
        setFormDescription("");
        setEditingCategory(null);
        setError("");
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormName(category.name);
        setFormDescription(category.description || "");
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formName.trim()) {
            setError("Nama kategori harus diisi");
            return;
        }

        setIsSubmitting(true);

        try {
            const body = {
                name: formName,
                description: formDescription || null,
            };

            const res = editingCategory
                ? await fetch(`/api/admin/categories/${editingCategory.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                })
                : await fetch("/api/admin/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal menyimpan kategori");
            }

            fetchCategories();
            setShowModal(false);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan kategori");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (categoryId: string) => {
        try {
            const res = await fetch(`/api/admin/categories/${categoryId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchCategories();
            }
        } catch {
            console.error("Failed to delete category");
        } finally {
            setDeleteConfirm(null);
        }
    };

    // Filter categories by search query
    const filteredCategories = categories.filter((category) => {
        const query = searchQuery.toLowerCase();
        return (
            category.name.toLowerCase().includes(query) ||
            (category.description && category.description.toLowerCase().includes(query))
        );
    });

    if (loading) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Kelola Kategori
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Buat dan kelola kategori menu
                    </p>
                </div>
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Kelola Kategori
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Buat dan kelola kategori menu
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/25"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Tambah Kategori</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Cari kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>
            </div>

            {/* Stats Bar */}
            {categories.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Total Kategori
                        </p>
                        <p className="mt-1 text-2xl font-bold text-orange-400">
                            {categories.length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Total Menu
                        </p>
                        <p className="mt-1 text-2xl font-bold text-amber-400">
                            {categories.reduce((sum, cat) => sum + cat._count.menus, 0)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Rata-rata Menu/Kategori
                        </p>
                        <p className="mt-1 text-2xl font-bold text-blue-400">
                            {categories.length > 0
                                ? (categories.reduce((sum, cat) => sum + cat._count.menus, 0) / categories.length).toFixed(1)
                                : 0}
                        </p>
                    </div>
                </div>
            )}

            {/* Categories List */}
            {filteredCategories.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Tags className="w-10 h-10 text-neutral-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {searchQuery ? "Tidak ada kategori ditemukan" : "Belum ada kategori"}
                    </h2>
                    <p className="text-neutral-400 mb-6 max-w-sm mx-auto">
                        {searchQuery
                            ? "Coba cari dengan kata kunci lain"
                            : "Mulai dengan membuat kategori pertama untuk mengelompokkan menu"}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Kategori
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCategories.map((category) => (
                        <div
                            key={category.id}
                            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 hover:border-orange-500/50 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Tags className="w-6 h-6 text-orange-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white text-lg truncate">
                                        {category.name}
                                    </h3>
                                    {category.description && (
                                        <p className="text-neutral-400 text-sm mt-1 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                        <Package className="w-4 h-4 text-neutral-500" />
                                        <span className="text-sm text-neutral-500">
                                            {category._count.menus} menu
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-800">
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-400 text-sm font-medium transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(category.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 text-sm font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Hapus
                                </button>
                            </div>

                            {/* Delete Confirmation */}
                            {deleteConfirm === category.id && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <p className="text-red-400 text-sm mb-3">
                                        Hapus kategori &quot;{category.name}&quot;?
                                        {category._count.menus > 0 && (
                                            <span className="block mt-1 text-neutral-400">
                                                {category._count.menus} menu akan kehilangan kategori ini.
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 font-medium"
                                        >
                                            Ya, Hapus
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="flex-1 px-3 py-2 bg-neutral-700 text-white text-sm rounded-lg hover:bg-neutral-600"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
                            <h2 className="text-lg font-bold text-white">
                                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Nama Kategori <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Contoh: Makanan Berat"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Deskripsi kategori..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 resize-none transition-colors"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-neutral-600 disabled:to-neutral-600 text-white font-semibold py-3 rounded-xl transition-all"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {editingCategory ? "Simpan Perubahan" : "Buat Kategori"}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
