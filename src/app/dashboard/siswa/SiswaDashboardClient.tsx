"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  Wallet,
  Utensils,
  Bell,
  LogOut,
  Plus,
  Minus,
  X,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Timer,
  ChevronRight,
  Search,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";

interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  status: "AVAILABLE" | "OUT_OF_STOCK";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function SiswaDashboardClient({ initialUser }: { initialUser: { id: string; name: string; email: string; role: string; balance: number } }) {
  const router = useRouter();
  const { user, setUser, logout } = useUserStore();
  const { items, addItem, removeItem, updateQuantity, pickupTime, setPickupTime, clearCart, getTotalAmount, getTotalItems } = useCartStore();
  
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize user from server-side props
  useEffect(() => {
    setUser(initialUser as any);
  }, [initialUser, setUser]);

  const currentUser = user || initialUser;
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Fetch menus
  const fetchMenus = useCallback(async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenus(data.menus || []);
    } catch {
      console.error("Failed to fetch menus");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const handleAddToCart = (menu: Menu) => {
    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      image: menu.image,
    });
  };

  const handleCheckout = async () => {
    if (!pickupTime) {
      setError("Pilih waktu pengambilan terlebih dahulu");
      return;
    }

    const totalAmount = getTotalAmount();
    if (currentUser.balance < totalAmount) {
      setError(`Saldo tidak mencukupi. Dibutuhkan ${formatPrice(totalAmount)}, saldo Anda ${formatPrice(currentUser.balance)}`);
      return;
    }

    setIsOrdering(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            menuId: item.menuId,
            quantity: item.quantity,
          })),
          pickupTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan");
      }

      // Update balance in store
      if (data.newBalance !== undefined) {
        setUser({ ...currentUser, balance: data.newBalance } as any);
      }

      setOrderSuccess(true);
      clearCart();
      
      setTimeout(() => {
        setShowCheckout(false);
        setShowCart(false);
        setOrderSuccess(false);
        router.push("/dashboard/siswa/orders");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pesanan");
    } finally {
      setIsOrdering(false);
    }
  };

  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableMenus = filteredMenus.filter((m) => m.status === "AVAILABLE");
  const unavailableMenus = filteredMenus.filter((m) => m.status === "OUT_OF_STOCK");

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div>
              <p className="text-white font-medium text-sm">Halo, {currentUser.name.split(" ")[0]}!</p>
              <p className="text-slate-400 text-xs">Siswa SMKN 40 Jakarta</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs text-white flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 pb-24 max-w-4xl mx-auto">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 mb-6 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-emerald-100">Saldo NexusBite</p>
            <Wallet className="w-5 h-5 text-emerald-100" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {formatPrice(currentUser.balance || 0)}
          </p>
          <p className="text-emerald-100 text-sm">Top up di koperasi sekolah</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href="/dashboard/siswa/orders"
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-white font-medium text-sm">Pesanan Saya</p>
            <p className="text-slate-400 text-xs mt-0.5">Lihat status pesanan</p>
          </a>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-white font-medium text-sm">Jam Istirahat</p>
            <p className="text-slate-400 text-xs mt-0.5">09:30 & 12:00</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        {/* Menu Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-400" />
            Menu Tersedia
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
                  <div className="bg-slate-800 h-32 rounded-lg mb-3" />
                  <div className="bg-slate-800 h-4 rounded w-3/4 mb-2" />
                  <div className="bg-slate-800 h-3 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : availableMenus.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ada menu tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {availableMenus.map((menu) => {
                const cartItem = items.find((i) => i.menuId === menu.id);
                return (
                  <div
                    key={menu.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors group"
                  >
                    <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                      {menu.image ? (
                        <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                      ) : (
                        <Utensils className="w-10 h-10 text-slate-600 group-hover:text-orange-500/50 transition-colors" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{menu.name}</h3>
                      <p className="text-slate-400 text-xs mb-3 line-clamp-2">{menu.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-400 text-sm">{formatPrice(menu.price)}</span>
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(menu.id, cartItem.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white text-sm w-5 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(menu.id, cartItem.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(menu)}
                            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Unavailable Menus */}
        {unavailableMenus.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-400 mb-4">Sedang Habis</h2>
            <div className="grid grid-cols-2 gap-4 opacity-50">
              {unavailableMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                    <Utensils className="w-10 h-10 text-slate-600" />
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <span className="bg-red-500/20 text-red-400 text-xs font-medium px-2 py-1 rounded-full">
                        Habis
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-400 text-sm mb-1">{menu.name}</h3>
                    <span className="text-slate-500 text-sm">{formatPrice(menu.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Cart Floating Button */}
      {getTotalItems() > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-3 hover:bg-orange-600 transition-colors z-30"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">{formatPrice(getTotalAmount())}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{getTotalItems()}</span>
        </button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-400" />
                Keranjang
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                <p>Keranjang kosong</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.menuId}
                      className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Utensils className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-orange-400 text-sm font-semibold">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white text-sm w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Section */}
                <div className="border-t border-slate-800 p-4 space-y-4">
                  {/* Pickup Time Selection */}
                  <div>
                    <p className="text-white font-medium text-sm mb-2">Waktu Pengambilan</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPickupTime("BREAK_1")}
                        className={`p-3 rounded-xl border ${
                          pickupTime === "BREAK_1"
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-slate-700 hover:border-slate-600"
                        } transition-colors`}
                      >
                        <Timer className={`w-5 h-5 mx-auto mb-1 ${pickupTime === "BREAK_1" ? "text-orange-400" : "text-slate-400"}`} />
                        <p className={`text-sm font-medium ${pickupTime === "BREAK_1" ? "text-orange-400" : "text-white"}`}>Istirahat 1</p>
                        <p className="text-xs text-slate-400">09:30 - 10:00</p>
                      </button>
                      <button
                        onClick={() => setPickupTime("BREAK_2")}
                        className={`p-3 rounded-xl border ${
                          pickupTime === "BREAK_2"
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-slate-700 hover:border-slate-600"
                        } transition-colors`}
                      >
                        <Timer className={`w-5 h-5 mx-auto mb-1 ${pickupTime === "BREAK_2" ? "text-orange-400" : "text-slate-400"}`} />
                        <p className={`text-sm font-medium ${pickupTime === "BREAK_2" ? "text-orange-400" : "text-white"}`}>Istirahat 2</p>
                        <p className="text-xs text-slate-400">12:00 - 12:30</p>
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex justify-between text-slate-400 text-sm mb-2">
                      <span>Subtotal ({getTotalItems()} item)</span>
                      <span>{formatPrice(getTotalAmount())}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold">
                      <span>Total</span>
                      <span className="text-orange-400">{formatPrice(getTotalAmount())}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-sm mt-2">
                      <span>Saldo Anda</span>
                      <span className={currentUser.balance < getTotalAmount() ? "text-red-400" : "text-emerald-400"}>
                        {formatPrice(currentUser.balance)}
                      </span>
                    </div>
                  </div>

                  {/* Balance Warning */}
                  {currentUser.balance < getTotalAmount() && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">
                        Saldo tidak mencukupi. Silakan top-up di koperasi sekolah.
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {orderSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <p className="text-emerald-400 text-sm">
                        Pesanan berhasil dibuat! Mengalihkan...
                      </p>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isOrdering || currentUser.balance < getTotalAmount() || !pickupTime}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isOrdering ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Pesan Sekarang
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
