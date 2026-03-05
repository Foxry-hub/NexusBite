"use client";

import { useState, useEffect, useCallback } from "react";
import { Store, Utensils, Search } from "lucide-react";

// --- Types ---
interface Menu {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string | null;
    status: "AVAILABLE" | "OUT_OF_STOCK";
    createdAt: string;
    seller: {
        id: string;
        name: string;
        email: string;
    };
}

// --- Format currency ---
function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

// --- Status Badge ---
function StatusBadge({ status }: { status: Menu["status"] }) {
    const isAvailable = status === "AVAILABLE";
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${isAvailable
                    ? "bg-orange-400/10 text-orange-400"
                    : "bg-red-400/10 text-red-400"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-orange-400" : "bg-red-400"
                    }`}
            />
            {isAvailable ? "Tersedia" : "Habis"}
        </span>
    );
}

// --- Loading Skeleton ---
function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
                    <div className="flex gap-4">
                        <div className="h-16 w-16 rounded-lg bg-neutral-800" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 rounded bg-neutral-800" />
                            <div className="h-3 w-2/3 rounded bg-neutral-800" />
                            <div className="h-3 w-1/4 rounded bg-neutral-800" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- Main Page ---
export default function AdminMenuPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchMenus = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/menu");
            if (res.ok) {
                const data = await res.json();
                setMenus(data);
            }
        } catch (error) {
            console.error("Failed to fetch menus:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    // Filter menus by search query
    const filteredMenus = menus.filter((menu) => {
        const query = searchQuery.toLowerCase();
        return (
            menu.name.toLowerCase().includes(query) ||
            menu.description.toLowerCase().includes(query) ||
            menu.seller?.name.toLowerCase().includes(query)
        );
    });

    // Group menus by seller
    const menusBySeller = filteredMenus.reduce((acc, menu) => {
        const sellerId = menu.seller?.id || "unknown";
        if (!acc[sellerId]) {
            acc[sellerId] = {
                seller: menu.seller,
                menus: [],
            };
        }
        acc[sellerId].menus.push(menu);
        return acc;
    }, {} as Record<string, { seller: Menu["seller"]; menus: Menu[] }>);

    if (loading) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Semua Menu
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Daftar menu dari semua penjual
                    </p>
                </div>
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    Semua Menu
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Daftar menu dari semua penjual (hanya lihat)
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Cari menu atau penjual..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>
            </div>

            {/* Stats Bar */}
            {menus.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Total Menu
                        </p>
                        <p className="mt-1 text-2xl font-bold text-orange-400">
                            {menus.length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Total Penjual
                        </p>
                        <p className="mt-1 text-2xl font-bold text-amber-400">
                            {Object.keys(menusBySeller).length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Tersedia
                        </p>
                        <p className="mt-1 text-2xl font-bold text-orange-400">
                            {menus.filter((m) => m.status === "AVAILABLE").length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Habis
                        </p>
                        <p className="mt-1 text-2xl font-bold text-red-400">
                            {menus.filter((m) => m.status === "OUT_OF_STOCK").length}
                        </p>
                    </div>
                </div>
            )}

            {/* Menu List by Seller */}
            {filteredMenus.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-10 h-10 text-neutral-600" />
                    </div>
                    <p className="text-neutral-400 text-lg">
                        {searchQuery ? "Tidak ada menu yang cocok" : "Belum ada menu"}
                    </p>
                    <p className="text-neutral-500 text-sm">
                        {searchQuery ? "Coba kata kunci lain" : "Menu akan muncul setelah penjual menambahkan"}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.values(menusBySeller).map(({ seller, menus: sellerMenus }) => (
                        <div key={seller?.id || "unknown"}>
                            {/* Seller Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                    <Store className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">{seller?.name || "Penjual Tidak Diketahui"}</h2>
                                    <p className="text-neutral-500 text-sm">{sellerMenus.length} menu</p>
                                </div>
                            </div>

                            {/* Menu Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sellerMenus.map((menu) => (
                                    <div
                                        key={menu.id}
                                        className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden hover:border-neutral-700 transition-colors"
                                    >
                                        <div className="flex gap-4 p-4">
                                            {menu.image ? (
                                                <img
                                                    src={menu.image}
                                                    alt={menu.name}
                                                    className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-neutral-800"
                                                />
                                            ) : (
                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-600">
                                                    <Utensils className="h-8 w-8" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="truncate font-semibold text-orange-400">
                                                        {menu.name}
                                                    </p>
                                                    <StatusBadge status={menu.status} />
                                                </div>
                                                <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                                                    {menu.description}
                                                </p>
                                                <p className="mt-2 text-sm font-bold text-orange-400">
                                                    {formatRupiah(menu.price)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
