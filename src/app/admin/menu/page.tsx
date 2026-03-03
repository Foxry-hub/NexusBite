"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────
interface Menu {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string | null;
    status: "AVAILABLE" | "OUT_OF_STOCK";
    createdAt: string;
}

// ─── Format currency ─────────────────────────────────────────────
function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

// ─── Status Badge ────────────────────────────────────────────────
function StatusBadge({ status }: { status: Menu["status"] }) {
    const isAvailable = status === "AVAILABLE";
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${isAvailable
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-red-400/10 text-red-400"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-400" : "bg-red-400"
                    }`}
            />
            {isAvailable ? "Tersedia" : "Habis"}
        </span>
    );
}

// ─── Toggle Button ───────────────────────────────────────────────
function ToggleButton({
    status,
    loading,
    onClick,
}: {
    status: Menu["status"];
    loading: boolean;
    onClick: () => void;
}) {
    const isAvailable = status === "AVAILABLE";
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="group relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
                backgroundColor: isAvailable
                    ? "rgb(16 185 129 / 0.3)"
                    : "rgb(75 85 99 / 0.5)",
            }}
            title={isAvailable ? "Tandai Habis" : "Tandai Tersedia"}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg ring-0 transition-all duration-300 ${isAvailable
                        ? "translate-x-6 bg-emerald-400"
                        : "translate-x-1 bg-gray-400"
                    }`}
            />
        </button>
    );
}

// ─── Add Menu Modal ──────────────────────────────────────────────
function AddMenuModal({
    isOpen,
    onClose,
    onCreated,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = useCallback(() => {
        setName("");
        setDescription("");
        setPrice("");
        setImagePreview(null);
        setSubmitting(false);
        setDragActive(false);
    }, []);

    useEffect(() => {
        if (!isOpen) resetForm();
    }, [isOpen, resetForm]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    function handleImageChange(file: File | undefined) {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran gambar maksimal 2MB");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        handleImageChange(file);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !price.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    price: Number(price),
                    image: imagePreview,
                }),
            });
            if (!res.ok) throw new Error("Failed to create menu");
            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Gagal menambahkan menu. Silakan coba lagi.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-100">Tambah Menu Baru</h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    {/* Name */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">
                            Nama Menu <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Nasi Goreng Spesial"
                            required
                            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">
                            Deskripsi
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Deskripsi singkat menu..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">
                            Harga (Rp) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                Rp
                            </span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0"
                                required
                                min={0}
                                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">
                            Foto Menu
                        </label>
                        <div
                            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${dragActive
                                    ? "border-emerald-400 bg-emerald-400/5"
                                    : "border-gray-700 hover:border-gray-600"
                                }`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageChange(e.target.files?.[0])}
                            />
                            {imagePreview ? (
                                <div className="relative group">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-48 w-full rounded-xl object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <span className="text-sm font-medium text-white">
                                            Klik untuk ganti
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
                                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                    </svg>
                                    <p className="text-sm">
                                        Drag & drop atau{" "}
                                        <span className="font-medium text-emerald-400">pilih file</span>
                                    </p>
                                    <p className="text-xs text-gray-600">PNG, JPG max 2MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || !name.trim() || !price.trim()}
                        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-500"
                    >
                        {submitting ? (
                            <span className="inline-flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Menyimpan...
                            </span>
                        ) : (
                            "Simpan Menu"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800/50">
                <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-300">
                Belum ada menu
            </h3>
            <p className="mb-6 text-sm text-gray-500">
                Tambahkan menu pertama untuk kantin kamu
            </p>
            <button
                onClick={onAdd}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-400 active:scale-95"
            >
                + Tambah Menu
            </button>
        </div>
    );
}

// ─── Main Page Component ─────────────────────────────────────────
export default function AdminMenuPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchMenus = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/menu");
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setMenus(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    async function handleToggle(id: string) {
        setTogglingId(id);
        try {
            const res = await fetch(`/api/admin/menu/${id}/toggle`, {
                method: "PATCH",
            });
            if (!res.ok) throw new Error("Failed");
            const updated = await res.json();
            setMenus((prev) =>
                prev.map((m) => (m.id === updated.id ? updated : m))
            );
        } catch (err) {
            console.error(err);
            alert("Gagal mengubah status menu.");
        } finally {
            setTogglingId(null);
        }
    }

    // ─── Loading skeleton ──────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-800" />
                    <div className="h-10 w-36 animate-pulse rounded-xl bg-gray-800" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 animate-pulse rounded-xl bg-gray-800/50"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-100">
                        Menu Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola daftar menu kantin kamu
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-95"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Menu
                </button>
            </div>

            {/* Stats Bar */}
            {menus.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                            Total Menu
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-100">
                            {menus.length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                            Tersedia
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-400">
                            {menus.filter((m) => m.status === "AVAILABLE").length}
                        </p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-gray-800 bg-gray-900/50 p-4 sm:col-span-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                            Habis
                        </p>
                        <p className="mt-1 text-2xl font-bold text-red-400">
                            {menus.filter((m) => m.status === "OUT_OF_STOCK").length}
                        </p>
                    </div>
                </div>
            )}

            {/* Menu List */}
            {menus.length === 0 ? (
                <EmptyState onAdd={() => setModalOpen(true)} />
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden overflow-hidden rounded-xl border border-gray-800 bg-gray-900/30 sm:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800 text-left">
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Menu
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Harga
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {menus.map((menu) => (
                                    <tr
                                        key={menu.id}
                                        className="transition-colors hover:bg-gray-800/30"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3.5">
                                                {menu.image ? (
                                                    <img
                                                        src={menu.image}
                                                        alt={menu.name}
                                                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-800"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-gray-600">
                                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-gray-100">
                                                        {menu.name}
                                                    </p>
                                                    <p className="truncate text-sm text-gray-500">
                                                        {menu.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-semibold text-gray-200">
                                                {formatRupiah(menu.price)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={menu.status} />
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <ToggleButton
                                                status={menu.status}
                                                loading={togglingId === menu.id}
                                                onClick={() => handleToggle(menu.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="space-y-3 sm:hidden">
                        {menus.map((menu) => (
                            <div
                                key={menu.id}
                                className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50"
                            >
                                <div className="flex gap-3.5 p-4">
                                    {menu.image ? (
                                        <img
                                            src={menu.image}
                                            alt={menu.name}
                                            className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-gray-800"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-gray-600">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-gray-100">
                                            {menu.name}
                                        </p>
                                        <p className="mt-0.5 truncate text-sm text-gray-500">
                                            {menu.description}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-emerald-400">
                                            {formatRupiah(menu.price)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-800 bg-gray-900/30 px-4 py-3">
                                    <StatusBadge status={menu.status} />
                                    <ToggleButton
                                        status={menu.status}
                                        loading={togglingId === menu.id}
                                        onClick={() => handleToggle(menu.id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add Menu Modal */}
            <AddMenuModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={fetchMenus}
            />
        </div>
    );
}
