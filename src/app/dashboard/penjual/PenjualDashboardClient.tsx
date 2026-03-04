"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Wallet,
  Utensils,
  Bell,
  LogOut,
  Store,
  Package,
  TrendingUp,
  Plus,
  Settings,
  Clock,
  CheckCircle,
  Timer,
  Eye,
  ChevronRight,
  X,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

interface OrderItem {
  id: string;
  quantity: number;
  menu: {
    id: string;
    name: string;
    price: number;
    image: string | null;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  pickupTime: "BREAK_1" | "BREAK_2";
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
}

interface Stats {
  total: number;
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function getStatusConfig(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return { label: "Menunggu", color: "text-yellow-400", bg: "bg-yellow-500/20", next: "PREPARING" as const };
    case "PREPARING":
      return { label: "Diproses", color: "text-blue-400", bg: "bg-blue-500/20", next: "READY" as const };
    case "READY":
      return { label: "Siap Diambil", color: "text-emerald-400", bg: "bg-emerald-500/20", next: "COMPLETED" as const };
    case "COMPLETED":
      return { label: "Selesai", color: "text-slate-400", bg: "bg-slate-500/20", next: null };
  }
}

export default function PenjualDashboardClient({ initialUser }: { initialUser: { id: string; name: string; email: string; role: string; balance: number } }) {
  const router = useRouter();
  const { user, setUser, logout } = useUserStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, preparing: 0, ready: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"BREAK_1" | "BREAK_2">("BREAK_1");

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

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/penjual/orders");
      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || { total: 0, pending: 0, preparing: 0, ready: 0, completed: 0 });
      
      // Calculate today's revenue from completed orders
      const completedOrders = (data.orders || []).filter((o: Order) => o.status === "COMPLETED");
      const revenue = completedOrders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
      setTodayRevenue(revenue);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/penjual/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch {
      console.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const ordersForTab = orders.filter((o) => o.pickupTime === activeTab && o.status !== "COMPLETED");
  const pendingOrders = ordersForTab.filter((o) => o.status === "PENDING");
  const preparingOrders = ordersForTab.filter((o) => o.status === "PREPARING");
  const readyOrders = ordersForTab.filter((o) => o.status === "READY");

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div>
              <p className="text-white font-medium text-sm">Halo, {currentUser.name.split(" ")[0]}!</p>
              <p className="text-slate-400 text-xs flex items-center gap-1">
                <Store className="w-3 h-3" /> Penjual NexusBite
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.pending}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-300 text-xs font-medium">Pendapatan Hari Ini</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-white text-xl font-bold">{formatPrice(todayRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-300 text-xs font-medium">Pesanan Masuk</p>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-white text-xl font-bold">{stats.total}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/dashboard/penjual/menu"
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
              <Utensils className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-white font-medium text-sm">Kelola Menu</p>
            <p className="text-slate-400 text-xs mt-0.5">Tambah & edit menu</p>
          </Link>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-purple-100" />
            </div>
            <p className="text-purple-100 text-xs">Saldo Penjualan</p>
            <p className="text-white text-xl font-bold">{formatPrice(currentUser.balance || 0)}</p>
          </div>
        </div>

        {/* Pickup Time Tabs */}
        <div className="flex bg-slate-900/50 rounded-xl p-1 mb-4">
          <button
            onClick={() => setActiveTab("BREAK_1")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "BREAK_1"
                ? "bg-orange-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            Istirahat 1
            {orders.filter((o) => o.pickupTime === "BREAK_1" && o.status !== "COMPLETED").length > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === "BREAK_1" ? "bg-white/20" : "bg-orange-500/20 text-orange-400"}`}>
                {orders.filter((o) => o.pickupTime === "BREAK_1" && o.status !== "COMPLETED").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("BREAK_2")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "BREAK_2"
                ? "bg-orange-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            Istirahat 2
            {orders.filter((o) => o.pickupTime === "BREAK_2" && o.status !== "COMPLETED").length > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === "BREAK_2" ? "bg-white/20" : "bg-orange-500/20 text-orange-400"}`}>
                {orders.filter((o) => o.pickupTime === "BREAK_2" && o.status !== "COMPLETED").length}
              </span>
            )}
          </button>
        </div>

        {/* Orders Queue */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
                <div className="bg-slate-800 h-4 rounded w-1/3 mb-3" />
                <div className="bg-slate-800 h-3 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : ordersForTab.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">Belum ada pesanan untuk {activeTab === "BREAK_1" ? "Istirahat 1" : "Istirahat 2"}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div>
                <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Menunggu ({pendingOrders.length})
                </h3>
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onSelect={setSelectedOrder} onUpdateStatus={updateOrderStatus} isUpdating={isUpdating} />
                  ))}
                </div>
              </div>
            )}

            {/* Preparing Orders */}
            {preparingOrders.length > 0 && (
              <div>
                <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Diproses ({preparingOrders.length})
                </h3>
                <div className="space-y-3">
                  {preparingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onSelect={setSelectedOrder} onUpdateStatus={updateOrderStatus} isUpdating={isUpdating} />
                  ))}
                </div>
              </div>
            )}

            {/* Ready Orders */}
            {readyOrders.length > 0 && (
              <div>
                <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Siap Diambil ({readyOrders.length})
                </h3>
                <div className="space-y-3">
                  {readyOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onSelect={setSelectedOrder} onUpdateStatus={updateOrderStatus} isUpdating={isUpdating} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <p className="text-white font-semibold">Detail Pesanan</p>
                <p className="text-slate-400 text-xs">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Customer Info */}
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-slate-400 text-xs mb-1">Pemesan</p>
                <p className="text-white font-medium">{selectedOrder.user.name}</p>
                <p className="text-slate-400 text-xs">{selectedOrder.user.email}</p>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-slate-400 text-xs mb-2">Item Pesanan</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-800/30 rounded-lg p-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 text-sm font-bold">
                          {item.quantity}x
                        </span>
                        <span className="text-white text-sm">{item.menu.name}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{formatPrice(item.menu.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-slate-800/50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-white font-medium">Total</span>
                <span className="text-orange-400 font-bold text-lg">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-800">
              {(() => {
                const config = getStatusConfig(selectedOrder.status);
                return config.next ? (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, config.next!)}
                    disabled={isUpdating}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    {isUpdating ? "Memproses..." : `Tandai ${getStatusConfig(config.next).label}`}
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Tutup
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onSelect, onUpdateStatus, isUpdating }: { 
  order: Order; 
  onSelect: (order: Order) => void; 
  onUpdateStatus: (id: string, status: Order["status"]) => void;
  isUpdating: boolean;
}) {
  const config = getStatusConfig(order.status);
  
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`${config.bg} ${config.color} text-xs font-medium px-2 py-1 rounded-full`}>
            {config.label}
          </span>
          <span className="text-slate-500 text-xs">#{order.id.slice(0, 6).toUpperCase()}</span>
        </div>
        <button
          onClick={() => onSelect(order)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-white font-medium text-sm mb-1">{order.user.name}</p>
      <p className="text-slate-400 text-xs mb-3">
        {order.items.length} item • {formatPrice(order.totalAmount)}
      </p>
      
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
        {order.items.slice(0, 3).map((item, i) => (
          <span key={item.id}>
            {item.quantity}x {item.menu.name}{i < Math.min(2, order.items.length - 1) ? "," : ""}
          </span>
        ))}
        {order.items.length > 3 && <span>+{order.items.length - 3} lagi</span>}
      </div>
      
      {config.next && (
        <button
          onClick={() => onUpdateStatus(order.id, config.next!)}
          disabled={isUpdating}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            order.status === "PENDING"
              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              : order.status === "PREPARING"
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
          }`}
        >
          {order.status === "PENDING" ? "Proses Pesanan" : order.status === "PREPARING" ? "Siap Diambil" : "Selesai"}
        </button>
      )}
    </div>
  );
}
