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
  X,
  Calendar,
  MapPin,
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

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function getStatusConfig(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return {
        label: "Menunggu",
        color: "text-amber-400",
        bg: "bg-amber-500/20",
        border: "border-amber-500/30",
        icon: Clock,
      };
    case "PREPARING":
      return {
        label: "Diproses",
        color: "text-orange-400",
        bg: "bg-orange-500/20",
        border: "border-orange-500/30",
        icon: Timer,
      };
    case "READY":
      return {
        label: "Siap Diambil",
        color: "text-green-400",
        bg: "bg-green-500/20",
        border: "border-green-500/30",
        icon: CheckCircle,
      };
    case "COMPLETED":
      return {
        label: "Selesai",
        color: "text-neutral-400",
        bg: "bg-neutral-500/20",
        border: "border-neutral-700",
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
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const activeOrders = orders.filter((o) => o.status !== "COMPLETED");
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Pesanan Saya</h1>
            <p className="text-sm text-neutral-400">Lacak status pesanan kamu</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-neutral-800 h-6 rounded-full w-24" />
                  <div className="bg-neutral-800 h-4 rounded w-16" />
                </div>
                <div className="space-y-3">
                  <div className="bg-neutral-800 h-4 rounded w-3/4" />
                  <div className="bg-neutral-800 h-4 rounded w-1/2" />
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="bg-neutral-800 h-8 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-neutral-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Belum ada pesanan</h2>
            <p className="text-neutral-400 mb-6 text-center max-w-md">
              Kamu belum pernah melakukan pemesanan. Yuk mulai pesan makanan favoritmu!
            </p>
            <a
              href="/dashboard/siswa"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/25"
            >
              <Utensils className="w-5 h-5" />
              Pesan Sekarang
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Pesanan Aktif</h2>
                    <p className="text-sm text-neutral-400">{activeOrders.length} pesanan dalam proses</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-neutral-900/50 border ${statusConfig.border} rounded-2xl p-6 cursor-pointer hover:bg-neutral-900 transition-all group`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`inline-flex items-center gap-2 ${statusConfig.bg} ${statusConfig.color} text-sm font-medium px-3 py-1.5 rounded-full`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                          <span className="text-neutral-500 text-sm">
                            {formatShortDate(order.createdAt)}
                          </span>
                        </div>

                        {/* Order Info */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-neutral-300">
                            <Utensils className="w-4 h-4 text-neutral-500" />
                            <span className="font-medium">{order.items.length} item</span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-400">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            <span className="text-sm">{getPickupTimeLabel(order.pickupTime)}</span>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex -space-x-2 mb-4">
                          {order.items.slice(0, 4).map((item, idx) => (
                            <div
                              key={item.id}
                              className="w-10 h-10 bg-neutral-800 rounded-full border-2 border-neutral-900 flex items-center justify-center overflow-hidden"
                              style={{ zIndex: 4 - idx }}
                            >
                              {item.menu.image ? (
                                <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                              ) : (
                                <Utensils className="w-4 h-4 text-neutral-600" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-10 h-10 bg-neutral-700 rounded-full border-2 border-neutral-900 flex items-center justify-center text-xs font-medium text-white">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                          <span className="text-orange-400 font-bold text-lg">
                            {formatPrice(order.totalAmount)}
                          </span>
                          <span className="text-sm text-neutral-500 group-hover:text-orange-400 transition-colors">
                            Lihat Detail →
                          </span>
                        </div>

                        {/* Ready Notice */}
                        {order.status === "READY" && (
                          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">
                                Silakan ambil pesanan di kantin!
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Riwayat Pesanan</h2>
                    <p className="text-sm text-neutral-400">{completedOrders.length} pesanan selesai</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {completedOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-5 cursor-pointer hover:bg-neutral-900/50 hover:border-neutral-700 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`${statusConfig.color} text-xs font-medium`}>
                            {statusConfig.label}
                          </span>
                          <span className="text-neutral-500 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatShortDate(order.createdAt)}
                          </span>
                        </div>
                        <p className="text-neutral-300 text-sm mb-2">
                          {order.items.length} item • {order.pickupTime === "BREAK_1" ? "Ist. 1" : "Ist. 2"}
                        </p>
                        <p className="text-orange-400/80 font-semibold">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            {(() => {
              const statusConfig = getStatusConfig(selectedOrder.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div className={`${statusConfig.bg} p-6 text-center relative`}>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/80 hover:text-white hover:bg-black/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className={`w-16 h-16 ${statusConfig.bg} border ${statusConfig.border} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
                  </div>
                  <p className={`${statusConfig.color} font-bold text-lg`}>{statusConfig.label}</p>
                  {selectedOrder.status === "READY" && (
                    <p className="text-green-300 text-sm mt-2">Silakan ambil pesanan Anda di kantin!</p>
                  )}
                </div>
              );
            })()}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Pickup Time */}
              <div className="bg-neutral-800/50 rounded-xl p-4">
                <p className="text-neutral-400 text-xs mb-1">Waktu Pengambilan</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  {getPickupTimeLabel(selectedOrder.pickupTime)}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-neutral-400 text-xs mb-3">Detail Pesanan</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-neutral-800/30 rounded-xl p-3">
                      <div className="w-14 h-14 bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.menu.image ? (
                          <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                        ) : (
                          <Utensils className="w-6 h-6 text-neutral-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.menu.name}</p>
                        <p className="text-neutral-400 text-sm">{item.quantity}x @ {formatPrice(item.menu.price)}</p>
                      </div>
                      <p className="text-orange-400 font-semibold">
                        {formatPrice(item.menu.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white font-medium">Total Pembayaran</span>
                <span className="text-orange-400 font-bold text-xl">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>

              {/* Order ID */}
              <p className="text-neutral-500 text-xs text-center">
                Order ID: {selectedOrder.id.slice(0, 8).toUpperCase()} • {formatDate(selectedOrder.createdAt)}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-colors"
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
