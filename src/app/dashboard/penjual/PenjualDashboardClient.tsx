"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Utensils,
  Bell,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Timer,
  Eye,
  X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
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
      return { label: "Menunggu", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", next: "PREPARING" as const };
    case "PREPARING":
      return { label: "Diproses", color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", next: "READY" as const };
    case "READY":
      return { label: "Siap Diambil", color: "text-orange-300", bg: "bg-orange-400/20", border: "border-orange-400/30", next: "COMPLETED" as const };
    case "COMPLETED":
      return { label: "Selesai", color: "text-neutral-400", bg: "bg-neutral-500/20", border: "border-neutral-500/30", next: null };
  }
}

export default function PenjualDashboardClient({ initialUser }: { initialUser: { id: string; name: string; email: string; role: string; balance: number } }) {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  
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

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/penjual/orders");
      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || { total: 0, pending: 0, preparing: 0, ready: 0, completed: 0 });
      
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
    <div className="min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <Sidebar user={currentUser} role="PENJUAL" />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white animate-fade-in-up">
                Dashboard Penjual
              </h1>
              <p className="text-neutral-500 text-sm animate-fade-in-up animation-delay-100">
                Kelola pesanan dan menu kamu
              </p>
            </div>
            <button className="relative p-3 rounded-xl bg-neutral-800/50 border border-neutral-700 text-neutral-400 hover:text-orange-400 hover:border-orange-500/50 transition-all duration-300">
              <Bell className="w-5 h-5" />
              {stats.pending > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pop-in">
                  {stats.pending}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl p-6 animate-pop-in animation-delay-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-orange-300 text-sm font-medium">Pendapatan Hari Ini</p>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-white text-2xl font-bold">{formatPrice(todayRevenue)}</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 animate-pop-in animation-delay-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-neutral-400 text-sm font-medium">Total Pesanan</p>
                <Package className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 animate-pop-in animation-delay-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-neutral-400 text-sm font-medium">Menunggu</p>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-white text-2xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 animate-pop-in animation-delay-400">
              <div className="flex items-center justify-between mb-3">
                <p className="text-neutral-400 text-sm font-medium">Siap Diambil</p>
                <CheckCircle className="w-5 h-5 text-orange-300" />
              </div>
              <p className="text-white text-2xl font-bold">{stats.ready}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/dashboard/penjual/menu"
              className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 group animate-fade-in-up animation-delay-300 hover-lift"
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                <Utensils className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-white font-semibold text-lg">Kelola Menu</p>
              <p className="text-neutral-500 text-sm mt-1">Tambah, edit, atau hapus menu</p>
            </Link>
            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl p-6 animate-fade-in-up animation-delay-400">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-orange-300 text-sm">Saldo Penjualan</p>
              <p className="text-white text-2xl font-bold mt-1">{formatPrice(currentUser.balance || 0)}</p>
            </div>
          </div>

          {/* Pickup Time Tabs */}
          <div className="flex bg-neutral-900/50 rounded-xl p-1.5 mb-6 max-w-md animate-fade-in-up animation-delay-500">
            <button
              onClick={() => setActiveTab("BREAK_1")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "BREAK_1"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              Istirahat 1
              {orders.filter((o) => o.pickupTime === "BREAK_1" && o.status !== "COMPLETED").length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "BREAK_1" ? "bg-white/20" : "bg-orange-500/20 text-orange-400"}`}>
                  {orders.filter((o) => o.pickupTime === "BREAK_1" && o.status !== "COMPLETED").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("BREAK_2")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "BREAK_2"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              Istirahat 2
              {orders.filter((o) => o.pickupTime === "BREAK_2" && o.status !== "COMPLETED").length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "BREAK_2" ? "bg-white/20" : "bg-orange-500/20 text-orange-400"}`}>
                  {orders.filter((o) => o.pickupTime === "BREAK_2" && o.status !== "COMPLETED").length}
                </span>
              )}
            </button>
          </div>

          {/* Orders Queue */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 animate-pulse">
                  <div className="bg-neutral-800 h-5 rounded w-1/3 mb-4" />
                  <div className="bg-neutral-800 h-4 rounded w-2/3 mb-2" />
                  <div className="bg-neutral-800 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : ordersForTab.length === 0 ? (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-neutral-600" />
              </div>
              <p className="text-neutral-400 text-lg">Belum ada pesanan</p>
              <p className="text-neutral-500 text-sm">untuk {activeTab === "BREAK_1" ? "Istirahat 1" : "Istirahat 2"}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Orders */}
              {pendingOrders.length > 0 && (
                <div className="animate-fade-in-up animation-delay-600">
                  <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Menunggu ({pendingOrders.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingOrders.map((order, index) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onSelect={setSelectedOrder} 
                        onUpdateStatus={updateOrderStatus} 
                        isUpdating={isUpdating}
                        animationDelay={index * 0.05}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Preparing Orders */}
              {preparingOrders.length > 0 && (
                <div className="animate-fade-in-up animation-delay-700">
                  <h3 className="text-orange-400 font-semibold mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Sedang Diproses ({preparingOrders.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {preparingOrders.map((order, index) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onSelect={setSelectedOrder} 
                        onUpdateStatus={updateOrderStatus} 
                        isUpdating={isUpdating}
                        animationDelay={index * 0.05}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Ready Orders */}
              {readyOrders.length > 0 && (
                <div className="animate-fade-in-up animation-delay-800">
                  <h3 className="text-orange-300 font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Siap Diambil ({readyOrders.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readyOrders.map((order, index) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onSelect={setSelectedOrder} 
                        onUpdateStatus={updateOrderStatus} 
                        isUpdating={isUpdating}
                        animationDelay={index * 0.05}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden max-h-[85vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <div>
                <p className="text-white font-semibold text-lg">Detail Pesanan</p>
                <p className="text-neutral-500 text-sm">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Customer Info */}
              <div className="bg-neutral-800/50 rounded-xl p-4">
                <p className="text-neutral-500 text-xs mb-2">Pemesan</p>
                <p className="text-white font-medium">{selectedOrder.user.name}</p>
                <p className="text-neutral-400 text-sm">{selectedOrder.user.email}</p>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-neutral-500 text-xs mb-3">Item Pesanan</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-neutral-800/30 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 text-sm font-bold">
                          {item.quantity}x
                        </span>
                        <span className="text-white text-sm">{item.menu.name}</span>
                      </div>
                      <span className="text-neutral-400 text-sm">{formatPrice(item.menu.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white font-medium">Total</span>
                <span className="text-orange-400 font-bold text-xl">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-neutral-800">
              {(() => {
                const config = getStatusConfig(selectedOrder.status);
                return config.next ? (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, config.next!)}
                    disabled={isUpdating}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/30"
                  >
                    {isUpdating ? "Memproses..." : `Tandai ${getStatusConfig(config.next).label}`}
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-colors"
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

function OrderCard({ order, onSelect, onUpdateStatus, isUpdating, animationDelay }: { 
  order: Order; 
  onSelect: (order: Order) => void; 
  onUpdateStatus: (id: string, status: Order["status"]) => void;
  isUpdating: boolean;
  animationDelay: number;
}) {
  const config = getStatusConfig(order.status);
  
  return (
    <div 
      className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 hover:border-orange-500/30 transition-all duration-300 hover-lift animate-pop-in"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`${config.bg} ${config.color} ${config.border} border text-xs font-medium px-3 py-1 rounded-full`}>
            {config.label}
          </span>
          <span className="text-neutral-600 text-xs">#{order.id.slice(0, 6).toUpperCase()}</span>
        </div>
        <button
          onClick={() => onSelect(order)}
          className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-orange-400 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-white font-medium mb-1">{order.user.name}</p>
      <p className="text-neutral-500 text-sm mb-4">
        {order.items.length} item • {formatPrice(order.totalAmount)}
      </p>
      
      <div className="flex flex-wrap gap-1 text-xs text-neutral-500 mb-4">
        {order.items.slice(0, 3).map((item, i) => (
          <span key={item.id} className="bg-neutral-800/50 px-2 py-1 rounded">
            {item.quantity}x {item.menu.name}
          </span>
        ))}
        {order.items.length > 3 && (
          <span className="bg-neutral-800/50 px-2 py-1 rounded">
            +{order.items.length - 3} lagi
          </span>
        )}
      </div>
      
      {config.next && (
        <button
          onClick={() => onUpdateStatus(order.id, config.next!)}
          disabled={isUpdating}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30"
        >
          {order.status === "PENDING" ? "Proses Pesanan" : order.status === "PREPARING" ? "Siap Diambil" : "Selesai"}
        </button>
      )}
    </div>
  );
}
