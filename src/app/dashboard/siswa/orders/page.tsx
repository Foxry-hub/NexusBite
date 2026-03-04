"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle,
  Timer,
  Utensils,
  Package,
  ChevronRight,
} from "lucide-react";

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
  items: OrderItem[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return {
        label: "Menunggu",
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
        icon: Clock,
      };
    case "PREPARING":
      return {
        label: "Diproses",
        color: "text-blue-400",
        bg: "bg-blue-500/20",
        icon: Timer,
      };
    case "READY":
      return {
        label: "Siap Diambil",
        color: "text-emerald-400",
        bg: "bg-emerald-500/20",
        icon: CheckCircle,
      };
    case "COMPLETED":
      return {
        label: "Selesai",
        color: "text-slate-400",
        bg: "bg-slate-500/20",
        icon: CheckCircle,
      };
  }
}

function getPickupTimeLabel(time: "BREAK_1" | "BREAK_2") {
  return time === "BREAK_1" ? "Istirahat 1 (09:30)" : "Istirahat 2 (12:00)";
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const activeOrders = orders.filter((o) => o.status !== "COMPLETED");
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Pesanan Saya</h1>
        </div>
      </header>

      <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
                <div className="bg-slate-800 h-4 rounded w-1/3 mb-3" />
                <div className="bg-slate-800 h-3 rounded w-2/3 mb-2" />
                <div className="bg-slate-800 h-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-4">Belum ada pesanan</p>
            <a
              href="/dashboard/siswa"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Utensils className="w-5 h-5" />
              Pesan Sekarang
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-400" />
                  Pesanan Aktif
                </h2>
                <div className="space-y-3">
                  {activeOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} text-xs font-medium px-2.5 py-1 rounded-full`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          <span className="text-slate-400 text-xs">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium text-sm">
                              {order.items.length} item • {formatPrice(order.totalAmount)}
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              Ambil: {getPickupTimeLabel(order.pickupTime)}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div>
                <h2 className="text-slate-400 font-semibold mb-3">Riwayat Pesanan</h2>
                <div className="space-y-3">
                  {completedOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 hover:border-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`${statusConfig.color} text-xs font-medium`}>
                            {statusConfig.label}
                          </span>
                          <span className="text-slate-500 text-xs">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 text-sm">
                            {order.items.length} item • {formatPrice(order.totalAmount)}
                          </p>
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        </div>
                      </button>
                    );
                  })}
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
            {/* Status Header */}
            {(() => {
              const statusConfig = getStatusConfig(selectedOrder.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div className={`${statusConfig.bg} p-4 text-center`}>
                  <StatusIcon className={`w-10 h-10 ${statusConfig.color} mx-auto mb-2`} />
                  <p className={`${statusConfig.color} font-semibold`}>{statusConfig.label}</p>
                  {selectedOrder.status === "READY" && (
                    <p className="text-emerald-300 text-sm mt-1">Silakan ambil pesanan Anda di kantin!</p>
                  )}
                </div>
              );
            })()}

            {/* Order Info */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-slate-400 text-xs mb-1">Waktu Pengambilan</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  {getPickupTimeLabel(selectedOrder.pickupTime)}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-2">Detail Pesanan</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-2">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.menu.image ? (
                          <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Utensils className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.menu.name}</p>
                        <p className="text-slate-400 text-xs">{item.quantity}x {formatPrice(item.menu.price)}</p>
                      </div>
                      <p className="text-orange-400 text-sm font-medium">
                        {formatPrice(item.menu.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-white font-medium">Total</span>
                <span className="text-orange-400 font-bold text-lg">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>

              <p className="text-slate-500 text-xs text-center">
                Order ID: {selectedOrder.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Close Button */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
