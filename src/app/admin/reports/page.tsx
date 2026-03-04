"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Utensils,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Timer,
  Package,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  menu: {
    id: string;
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  pickupTime: "BREAK_1" | "BREAK_2";
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED";
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
}

interface BestSeller {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface ReportData {
  date: string;
  totalRevenue: number;
  completedRevenue: number;
  orderStats: {
    total: number;
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
  };
  bestSellers: BestSeller[];
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusConfig(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return { label: "Menunggu", color: "text-yellow-400", bg: "bg-yellow-500/20", icon: Clock };
    case "PREPARING":
      return { label: "Diproses", color: "text-blue-400", bg: "bg-blue-500/20", icon: Timer };
    case "READY":
      return { label: "Siap Diambil", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle };
    case "COMPLETED":
      return { label: "Selesai", color: "text-gray-400", bg: "bg-gray-500/20", icon: CheckCircle };
  }
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?date=${date}`);
      const data = await res.json();
      setReportData(data);
    } catch {
      console.error("Failed to fetch report");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate, fetchReport]);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            Laporan Harian
          </h1>
          <p className="text-gray-400 mt-1">Ringkasan penjualan dan statistik</p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-xl p-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            />
          </div>
          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Date Display */}
      <div className="text-center py-2">
        <p className="text-lg font-medium text-white">
          {formatDate(selectedDate)}
          {isToday && <span className="ml-2 text-emerald-400 text-sm">(Hari ini)</span>}
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 animate-pulse">
              <div className="bg-gray-800 h-4 rounded w-1/2 mb-3" />
              <div className="bg-gray-800 h-8 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reportData ? (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-emerald-300 text-sm font-medium">Total Pendapatan</p>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-white text-2xl font-bold">{formatPrice(reportData.totalRevenue)}</p>
              <p className="text-emerald-400/60 text-xs mt-1">
                Dikonfirmasi: {formatPrice(reportData.completedRevenue)}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-300 text-sm font-medium">Total Pesanan</p>
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white text-2xl font-bold">{reportData.orderStats.total}</p>
              <p className="text-blue-400/60 text-xs mt-1">
                Selesai: {reportData.orderStats.completed}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-yellow-300 text-sm font-medium">Menunggu</p>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-white text-2xl font-bold">{reportData.orderStats.pending}</p>
              <p className="text-yellow-400/60 text-xs mt-1">
                Diproses: {reportData.orderStats.preparing}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-300 text-sm font-medium">Siap Diambil</p>
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white text-2xl font-bold">{reportData.orderStats.ready}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Best Sellers */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-400" />
                Menu Terlaris
              </h2>
              
              {reportData.bestSellers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada data penjualan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportData.bestSellers.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        index === 1 ? "bg-gray-400/20 text-gray-300" :
                        index === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-gray-600/20 text-gray-400"
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">{item.quantity} terjual</p>
                      </div>
                      <p className="text-emerald-400 font-semibold">{formatPrice(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                Pesanan Hari Ini
              </h2>
              
              {reportData.orders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada pesanan</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {reportData.orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div
                        key={order.id}
                        className="p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} text-xs font-medium px-2 py-1 rounded-full`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-white font-medium text-sm">{order.user.name}</p>
                        <p className="text-gray-400 text-xs">
                          {order.items.length} item • {formatPrice(order.totalAmount)} • {order.pickupTime === "BREAK_1" ? "Istirahat 1" : "Istirahat 2"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Gagal memuat data laporan</p>
        </div>
      )}
    </div>
  );
}
