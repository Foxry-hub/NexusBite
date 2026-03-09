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
  QrCode,
  Key,
  Store,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED";
  seller: {
    id: string;
    name: string;
  } | null;
  items: OrderItem[];
}

interface OrderGroup {
  id: string;
  groupNumber: string;
  totalAmount: number;
  pickupTime: "BREAK_1" | "BREAK_2";
  verificationCode: string;
  qrToken: string;
  createdAt: string;
  orders: Order[];
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

// Get overall status for order group (lowest status among all orders)
function getGroupStatus(orders: Order[]): Order["status"] {
  const statusPriority: Order["status"][] = ["PENDING", "PREPARING", "READY", "COMPLETED"];
  let lowestStatus: Order["status"] = "COMPLETED";
  
  for (const order of orders) {
    const currentPriority = statusPriority.indexOf(order.status);
    const lowestPriority = statusPriority.indexOf(lowestStatus);
    if (currentPriority < lowestPriority) {
      lowestStatus = order.status;
    }
  }
  
  return lowestStatus;
}

// Check if all orders in group are completed
function isGroupCompleted(orders: Order[]): boolean {
  return orders.every(order => order.status === "COMPLETED");
}

// Get all items from all orders in group
function getAllItems(orders: Order[]): OrderItem[] {
  return orders.flatMap(order => order.items);
}

// Get total item count
function getTotalItemCount(orders: Order[]): number {
  return orders.reduce((total, order) => 
    total + order.items.reduce((sum, item) => sum + item.quantity, 0), 0
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<OrderGroup | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const fetchOrderGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrderGroups(data.orderGroups || []);
    } catch {
      console.error("Failed to fetch order groups");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderGroups();
    const interval = setInterval(fetchOrderGroups, 30000);
    return () => clearInterval(interval);
  }, [fetchOrderGroups]);

  const activeGroups = orderGroups.filter((g) => !isGroupCompleted(g.orders));
  const completedGroups = orderGroups.filter((g) => isGroupCompleted(g.orders));

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
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-neutral-800 h-6 rounded-full w-24" />
                  <div className="bg-neutral-800 h-4 rounded w-16" />
                </div>
                <div className="space-y-3">
                  <div className="bg-neutral-800 h-4 rounded w-3/4" />
                  <div className="bg-neutral-800 h-4 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : orderGroups.length === 0 ? (
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
            {activeGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Pesanan Aktif</h2>
                    <p className="text-sm text-neutral-400">{activeGroups.length} pesanan dalam proses</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGroups.map((group) => {
                    const groupStatus = getGroupStatus(group.orders);
                    const statusConfig = getStatusConfig(groupStatus);
                    const StatusIcon = statusConfig.icon;
                    const allItems = getAllItems(group.orders);
                    const totalItems = getTotalItemCount(group.orders);
                    
                    return (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className={`bg-neutral-900/50 border ${statusConfig.border} rounded-2xl p-6 cursor-pointer hover:bg-neutral-900 transition-all group`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`inline-flex items-center gap-2 ${statusConfig.bg} ${statusConfig.color} text-sm font-medium px-3 py-1.5 rounded-full`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                          <span className="text-neutral-500 text-sm">
                            {formatShortDate(group.createdAt)}
                          </span>
                        </div>

                        {/* Order Number */}
                        <div className="mb-4">
                          <p className="text-orange-400 font-mono text-sm font-bold">{group.groupNumber}</p>
                        </div>

                        {/* Sellers List */}
                        <div className="mb-4 space-y-2">
                          {group.orders.map((order) => {
                            const orderStatus = getStatusConfig(order.status);
                            return (
                              <div key={order.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-neutral-400">
                                  <Store className="w-4 h-4 text-neutral-500" />
                                  <span>{order.seller?.name || "Penjual"}</span>
                                </div>
                                <span className={`${orderStatus.color} text-xs`}>
                                  {orderStatus.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Info */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-neutral-300">
                            <Utensils className="w-4 h-4 text-neutral-500" />
                            <span className="font-medium">{totalItems} item</span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-400">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            <span className="text-sm">{getPickupTimeLabel(group.pickupTime)}</span>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex -space-x-2 mb-4">
                          {allItems.slice(0, 4).map((item, idx) => (
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
                          {allItems.length > 4 && (
                            <div className="w-10 h-10 bg-neutral-700 rounded-full border-2 border-neutral-900 flex items-center justify-center text-xs font-medium text-white">
                              +{allItems.length - 4}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                          <span className="text-orange-400 font-bold text-lg">
                            {formatPrice(group.totalAmount)}
                          </span>
                          <span className="text-sm text-neutral-500 group-hover:text-orange-400 transition-colors">
                            Lihat Detail →
                          </span>
                        </div>

                        {/* Ready Notice */}
                        {group.orders.some(o => o.status === "READY") && (
                          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <p className="text-green-400 text-sm font-medium">
                              Ada pesanan siap diambil!
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {completedGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Riwayat Pesanan</h2>
                    <p className="text-sm text-neutral-400">{completedGroups.length} transaksi selesai</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {completedGroups.map((group) => {
                    const statusConfig = getStatusConfig("COMPLETED");
                    const allItems = getAllItems(group.orders);
                    const totalItems = getTotalItemCount(group.orders);
                    
                    return (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer hover:bg-neutral-900 hover:border-neutral-700 transition-all"
                      >
                        {/* Product Images Header */}
                        <div className="relative h-32 bg-neutral-800/50">
                          {allItems.length > 0 && allItems[0].menu.image ? (
                            <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
                              {allItems.slice(0, 4).map((item, idx) => (
                                <div 
                                  key={item.id} 
                                  className={`relative overflow-hidden ${allItems.length === 1 ? 'col-span-2 row-span-2' : ''} ${allItems.length === 2 ? 'row-span-2' : ''} ${allItems.length === 3 && idx === 0 ? 'row-span-2' : ''}`}
                                >
                                  {item.menu.image ? (
                                    <img 
                                      src={item.menu.image} 
                                      alt={item.menu.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                      <Utensils className="w-8 h-8 text-neutral-600" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                              <Utensils className="w-10 h-10 text-neutral-600" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className={`inline-flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm`}>
                              <CheckCircle className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatShortDate(group.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="mb-3">
                            <p className="text-white text-sm font-medium line-clamp-1">
                              {allItems.map(item => item.menu.name).join(", ")}
                            </p>
                            <p className="text-neutral-500 text-xs mt-1">
                              {totalItems} item • {group.orders.length} toko
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                            <span className="text-orange-400 font-bold">
                              {formatPrice(group.totalAmount)}
                            </span>
                            <span className="text-xs text-neutral-500">
                              Lihat Detail →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Order Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedGroup(null)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            {(() => {
              const groupStatus = getGroupStatus(selectedGroup.orders);
              const statusConfig = getStatusConfig(groupStatus);
              const StatusIcon = statusConfig.icon;
              const isCompleted = isGroupCompleted(selectedGroup.orders);
              
              return (
                <div className={`${statusConfig.bg} p-6 text-center relative`}>
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/80 hover:text-white hover:bg-black/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className={`w-16 h-16 ${statusConfig.bg} border ${statusConfig.border} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
                  </div>
                  <p className={`${statusConfig.color} font-bold text-lg`}>
                    {isCompleted ? "Selesai" : statusConfig.label}
                  </p>
                </div>
              );
            })()}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Order Number */}
              <div className="text-center">
                <p className="text-orange-400 font-mono text-lg font-bold">{selectedGroup.groupNumber}</p>
                <p className="text-neutral-400 text-sm mt-1">
                  {selectedGroup.orders.length} toko • {getTotalItemCount(selectedGroup.orders)} item
                </p>
              </div>

              {/* QR Code & PIN - Only show if not completed */}
              {!isGroupCompleted(selectedGroup.orders) && (
                <div className="bg-neutral-800/50 rounded-2xl p-6 text-center">
                  <p className="text-neutral-400 text-xs mb-4">Tunjukkan ke semua penjual saat mengambil pesanan</p>
                  
                  {/* QR Code */}
                  <div className="bg-white rounded-xl p-4 inline-block mb-4">
                    <QRCodeSVG 
                      value={selectedGroup.qrToken} 
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  
                  {/* PIN */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 bg-neutral-700/50 rounded-lg px-4 py-2">
                      <Key className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-mono text-xl font-bold tracking-widest">
                        {selectedGroup.verificationCode}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedGroup.verificationCode)}
                      className="p-2 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 transition-colors"
                    >
                      {copiedPin ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-neutral-500 text-xs mt-3">PIN Verifikasi (berlaku untuk semua toko)</p>
                </div>
              )}

              {/* Pickup Time */}
              <div className="bg-neutral-800/50 rounded-xl p-4">
                <p className="text-neutral-400 text-xs mb-1">Waktu Pengambilan</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  {getPickupTimeLabel(selectedGroup.pickupTime)}
                </p>
              </div>

              {/* Orders by Seller */}
              <div>
                <p className="text-neutral-400 text-xs mb-3">Detail Pesanan per Toko</p>
                <div className="space-y-4">
                  {selectedGroup.orders.map((order) => {
                    const orderStatus = getStatusConfig(order.status);
                    const OrderStatusIcon = orderStatus.icon;
                    
                    return (
                      <div key={order.id} className={`bg-neutral-800/30 rounded-xl p-4 border ${orderStatus.border}`}>
                        {/* Seller Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-orange-400" />
                            <span className="text-white font-medium">{order.seller?.name || "Penjual"}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 ${orderStatus.bg} ${orderStatus.color} text-xs font-medium px-2 py-1 rounded-full`}>
                            <OrderStatusIcon className="w-3 h-3" />
                            {orderStatus.label}
                          </span>
                        </div>
                        
                        {/* Items */}
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {item.menu.image ? (
                                  <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Utensils className="w-4 h-4 text-neutral-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">{item.menu.name}</p>
                                <p className="text-neutral-500 text-xs">{item.quantity}x @ {formatPrice(item.menu.price)}</p>
                              </div>
                              <p className="text-orange-400 text-sm font-semibold">
                                {formatPrice(item.menu.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Subtotal */}
                        <div className="mt-3 pt-3 border-t border-neutral-700 flex justify-between">
                          <span className="text-neutral-400 text-sm">Subtotal</span>
                          <span className="text-white font-semibold">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white font-medium">Total Pembayaran</span>
                <span className="text-orange-400 font-bold text-xl">{formatPrice(selectedGroup.totalAmount)}</span>
              </div>

              {/* Order ID */}
              <p className="text-neutral-500 text-xs text-center">
                {selectedGroup.groupNumber} • {formatDate(selectedGroup.createdAt)}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800">
              <button
                onClick={() => setSelectedGroup(null)}
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
