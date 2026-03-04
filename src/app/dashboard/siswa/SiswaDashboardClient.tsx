"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  Wallet,
  Utensils,
  Plus,
  Minus,
  X,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Timer,
  Search,
  Sparkles,
  Store,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";

interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  status: "AVAILABLE" | "OUT_OF_STOCK";
  seller: {
    id: string;
    name: string;
  };
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
  const { user, setUser } = useUserStore();
  const { items, addItem, removeItem, updateQuantity, pickupTime, setPickupTime, clearCart, getTotalAmount, getTotalItems } = useCartStore();
  
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize user from server-side props
  useEffect(() => {
    setUser(initialUser as any);
  }, [initialUser, setUser]);

  const currentUser = user || initialUser;

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
    <div className="min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <Sidebar user={currentUser} role="SISWA" />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white animate-fade-in-up">
                Selamat Datang, {currentUser.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-neutral-500 text-sm animate-fade-in-up animation-delay-100">
                Mau pesan apa hari ini?
              </p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-xl bg-neutral-800/50 border border-neutral-700 text-neutral-400 hover:text-orange-400 hover:border-orange-500/50 transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pop-in">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* Search */}
          <div className="relative mb-8 animate-fade-in-up animation-delay-200">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Cari menu favorit kamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xl pl-12 pr-4 py-3.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          {/* Menu Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6 animate-fade-in-up animation-delay-300">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Menu Tersedia</h2>
                <p className="text-neutral-500 text-sm">{availableMenus.length} menu siap dipesan</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 animate-pulse">
                    <div className="bg-neutral-800 h-40 rounded-xl mb-4" />
                    <div className="bg-neutral-800 h-5 rounded w-3/4 mb-2" />
                    <div className="bg-neutral-800 h-4 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : availableMenus.length === 0 ? (
              <div className="text-center py-16 animate-fade-in-up">
                <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-10 h-10 text-neutral-600" />
                </div>
                <p className="text-neutral-400 text-lg">Tidak ada menu tersedia</p>
                <p className="text-neutral-500 text-sm">Coba cek lagi nanti ya</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableMenus.map((menu, index) => {
                  const cartItem = items.find((i) => i.menuId === menu.id);
                  return (
                    <div
                      key={menu.id}
                      className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover-lift animate-pop-in group"
                      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    >
                      <div className="relative h-40 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center overflow-hidden">
                        {menu.image ? (
                          <img 
                            src={menu.image} 
                            alt={menu.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        ) : (
                          <Utensils className="w-12 h-12 text-neutral-700 group-hover:text-orange-500/50 transition-colors duration-300" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{menu.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
                          <Store className="w-3 h-3" />
                          <span className="line-clamp-1">{menu.seller?.name || 'Penjual'}</span>
                        </div>
                        <p className="text-neutral-500 text-xs mb-4 line-clamp-2 h-8">{menu.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-orange-400">{formatPrice(menu.price)}</span>
                          {cartItem ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(menu.id, cartItem.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-white text-sm w-6 text-center font-medium">{cartItem.quantity}</span>
                              <button
                                onClick={() => updateQuantity(menu.id, cartItem.quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(menu)}
                              className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-all duration-300 hover:scale-110"
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
            <div className="mb-8 animate-fade-in-up animation-delay-500">
              <h2 className="text-lg font-bold text-neutral-500 mb-4">Sedang Habis</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-50">
                {unavailableMenus.map((menu) => (
                  <div
                    key={menu.id}
                    className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                      <Utensils className="w-12 h-12 text-neutral-700" />
                      <div className="absolute inset-0 bg-neutral-900/70 flex items-center justify-center">
                        <span className="bg-red-500/20 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full border border-red-500/30">
                          Habis
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-400 text-sm mb-1">{menu.name}</h3>
                      <span className="text-neutral-500 text-sm">{formatPrice(menu.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Floating Button */}
        {getTotalItems() > 0 && !showCart && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center gap-4 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 z-30 animate-pop-in"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold">{formatPrice(getTotalAmount())}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{getTotalItems()}</span>
          </button>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-neutral-900 border-l border-neutral-800 flex flex-col animate-fade-in-right">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Keranjang</h2>
                  <p className="text-neutral-500 text-xs">{getTotalItems()} item</p>
                </div>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8">
                <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-neutral-600" />
                </div>
                <p className="text-lg font-medium">Keranjang kosong</p>
                <p className="text-neutral-500 text-sm">Yuk pilih menu favorit kamu!</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.menuId}
                      className="bg-neutral-800/50 rounded-xl p-4 flex items-center gap-4 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-16 h-16 bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Utensils className="w-6 h-6 text-neutral-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-orange-400 text-sm font-semibold">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-neutral-700 text-white flex items-center justify-center hover:bg-neutral-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white text-sm w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Section */}
                <div className="border-t border-neutral-800 p-6 space-y-4">
                  {/* Pickup Time Selection */}
                  <div>
                    <p className="text-white font-medium text-sm mb-3">Waktu Pengambilan</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPickupTime("BREAK_1")}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          pickupTime === "BREAK_1"
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-neutral-700 hover:border-neutral-600"
                        }`}
                      >
                        <Timer className={`w-5 h-5 mx-auto mb-2 ${pickupTime === "BREAK_1" ? "text-orange-400" : "text-neutral-400"}`} />
                        <p className={`text-sm font-medium ${pickupTime === "BREAK_1" ? "text-orange-400" : "text-white"}`}>Istirahat 1</p>
                        <p className="text-xs text-neutral-500">09:30 - 10:00</p>
                      </button>
                      <button
                        onClick={() => setPickupTime("BREAK_2")}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          pickupTime === "BREAK_2"
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-neutral-700 hover:border-neutral-600"
                        }`}
                      >
                        <Timer className={`w-5 h-5 mx-auto mb-2 ${pickupTime === "BREAK_2" ? "text-orange-400" : "text-neutral-400"}`} />
                        <p className={`text-sm font-medium ${pickupTime === "BREAK_2" ? "text-orange-400" : "text-white"}`}>Istirahat 2</p>
                        <p className="text-xs text-neutral-500">12:00 - 12:30</p>
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-neutral-800/50 rounded-xl p-4">
                    <div className="flex justify-between text-neutral-400 text-sm mb-2">
                      <span>Subtotal ({getTotalItems()} item)</span>
                      <span>{formatPrice(getTotalAmount())}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span className="text-orange-400">{formatPrice(getTotalAmount())}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400 text-sm mt-3 pt-3 border-t border-neutral-700">
                      <span>Saldo Anda</span>
                      <span className={currentUser.balance < getTotalAmount() ? "text-red-400" : "text-orange-400"}>
                        {formatPrice(currentUser.balance)}
                      </span>
                    </div>
                  </div>

                  {/* Balance Warning */}
                  {currentUser.balance < getTotalAmount() && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">
                        Saldo tidak mencukupi. Silakan top-up di koperasi sekolah.
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {orderSuccess && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <p className="text-orange-400 text-sm">
                        Pesanan berhasil dibuat! Mengalihkan...
                      </p>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isOrdering || currentUser.balance < getTotalAmount() || !pickupTime}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30"
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
