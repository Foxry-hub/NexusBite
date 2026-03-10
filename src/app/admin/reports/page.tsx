"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Utensils,
  Calendar,
  Clock,
  CheckCircle,
  Timer,
  Package,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Wallet,
  ArrowDownCircle,
  XCircle,
  Banknote,
  Check,
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

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  adminFee: number;
  netAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  method: string;
  note: string | null;
  adminNote: string | null;
  processedAt: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface WithdrawalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  totalAdminFee: number;
  totalNetAmount: number;
  approvedAmount: number;
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
  withdrawals: Withdrawal[];
  withdrawalStats: WithdrawalStats;
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
      return { label: "Menunggu", color: "text-amber-400", bg: "bg-amber-500/20", icon: Clock };
    case "PREPARING":
      return { label: "Diproses", color: "text-orange-400", bg: "bg-orange-500/20", icon: Timer };
    case "READY":
      return { label: "Siap Diambil", color: "text-orange-300", bg: "bg-orange-400/20", icon: CheckCircle };
    case "COMPLETED":
      return { label: "Selesai", color: "text-neutral-400", bg: "bg-neutral-500/20", icon: CheckCircle };
  }
}

function getWithdrawalStatusConfig(status: Withdrawal["status"]) {
  switch (status) {
    case "PENDING":
      return { label: "Menunggu", color: "text-amber-400", bg: "bg-amber-500/20", icon: Clock };
    case "APPROVED":
      return { label: "Disetujui", color: "text-green-400", bg: "bg-green-500/20", icon: CheckCircle };
    case "REJECTED":
      return { label: "Ditolak", color: "text-red-400", bg: "bg-red-500/20", icon: XCircle };
  }
}

// Generate years for dropdown (current year - 5 to current year)
function generateYears() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }
  return years;
}

// Generate months
const months = [
  { value: 0, label: "Januari" },
  { value: 1, label: "Februari" },
  { value: 2, label: "Maret" },
  { value: 3, label: "April" },
  { value: 4, label: "Mei" },
  { value: 5, label: "Juni" },
  { value: 6, label: "Juli" },
  { value: 7, label: "Agustus" },
  { value: 8, label: "September" },
  { value: 9, label: "Oktober" },
  { value: 10, label: "November" },
  { value: 11, label: "Desember" },
];

// Generate days for a given month/year
function generateDays(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

export default function ReportsPage() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Dropdown states
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const dayDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  const selectedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const isToday = selectedDate === today.toISOString().split("T")[0];

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

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(e.target as Node)) {
        setShowDayDropdown(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target as Node)) {
        setShowMonthDropdown(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node)) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Export to Excel
  const exportToExcel = () => {
    if (!reportData) return;

    // Create CSV content with proper formatting
    let csvContent = "\uFEFF"; // BOM for UTF-8
    
    // Header
    csvContent += `Laporan Penjualan NexusBite\n`;
    csvContent += `Tanggal: ${formatDate(selectedDate)}\n\n`;
    
    // Summary
    csvContent += `RINGKASAN\n`;
    csvContent += `Total Pendapatan,${reportData.totalRevenue}\n`;
    csvContent += `Pendapatan Dikonfirmasi,${reportData.completedRevenue}\n`;
    csvContent += `Total Pesanan,${reportData.orderStats.total}\n`;
    csvContent += `Pesanan Selesai,${reportData.orderStats.completed}\n`;
    csvContent += `Pesanan Menunggu,${reportData.orderStats.pending}\n`;
    csvContent += `Pesanan Diproses,${reportData.orderStats.preparing}\n`;
    csvContent += `Pesanan Siap Diambil,${reportData.orderStats.ready}\n\n`;
    
    // Best Sellers
    csvContent += `MENU TERLARIS\n`;
    csvContent += `No,Nama Menu,Jumlah Terjual,Pendapatan\n`;
    reportData.bestSellers.forEach((item, idx) => {
      csvContent += `${idx + 1},"${item.name}",${item.quantity},${item.revenue}\n`;
    });
    csvContent += `\n`;
    
    // Orders
    csvContent += `DAFTAR PESANAN\n`;
    csvContent += `No,Waktu,Nama Pembeli,Email,Status,Waktu Ambil,Jumlah Item,Total\n`;
    reportData.orders.forEach((order, idx) => {
      const time = new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const pickupTime = order.pickupTime === "BREAK_1" ? "Istirahat 1" : "Istirahat 2";
      const statusConfig = getStatusConfig(order.status);
      csvContent += `${idx + 1},"${time}","${order.user.name}","${order.user.email}","${statusConfig.label}","${pickupTime}",${order.items.length},${order.totalAmount}\n`;
    });
    csvContent += `\n`;
    
    // Withdrawals
    csvContent += `PENARIKAN SALDO\n`;
    csvContent += `Ringkasan Penarikan\n`;
    csvContent += `Total Request,${reportData.withdrawalStats.total}\n`;
    csvContent += `Total Diajukan,${reportData.withdrawalStats.totalAmount}\n`;
    csvContent += `Total Potongan Admin,${reportData.withdrawalStats.totalAdminFee}\n`;
    csvContent += `Total Dicairkan,${reportData.withdrawalStats.totalNetAmount}\n`;
    csvContent += `Menunggu,${reportData.withdrawalStats.pending}\n`;
    csvContent += `Disetujui,${reportData.withdrawalStats.approved}\n`;
    csvContent += `Ditolak,${reportData.withdrawalStats.rejected}\n\n`;
    csvContent += `Daftar Penarikan\n`;
    csvContent += `No,Waktu,Nama Penjual,Email,Jumlah,Potongan Admin,Diterima,Status\n`;
    reportData.withdrawals.forEach((withdrawal, idx) => {
      const time = new Date(withdrawal.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const statusConfig = getWithdrawalStatusConfig(withdrawal.status);
      csvContent += `${idx + 1},"${time}","${withdrawal.user.name}","${withdrawal.user.email}",${withdrawal.amount},${withdrawal.adminFee},${withdrawal.netAmount},"${statusConfig.label}"\n`;
    });
    
    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_NexusBite_${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export to PDF (using print)
  const exportToPDF = () => {
    if (!reportData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan NexusBite - ${formatDate(selectedDate)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px; }
          .header h1 { color: #f97316; font-size: 24px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .section { margin-bottom: 30px; }
          .section h2 { font-size: 16px; color: #f97316; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
          .stat-card { background: #f8f8f8; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-card .value { font-size: 20px; font-weight: bold; color: #f97316; }
          .stat-card .label { font-size: 12px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f8f8; font-weight: bold; color: #333; }
          tr:hover { background: #fafafa; }
          .text-right { text-align: right; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 11px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NexusBite - Laporan Harian</h1>
          <p>${formatDate(selectedDate)}</p>
        </div>
        
        <div class="section">
          <h2>Ringkasan</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="value">${formatPrice(reportData.totalRevenue)}</div>
              <div class="label">Total Pendapatan</div>
            </div>
            <div class="stat-card">
              <div class="value">${reportData.orderStats.total}</div>
              <div class="label">Total Pesanan</div>
            </div>
            <div class="stat-card">
              <div class="value">${reportData.orderStats.completed}</div>
              <div class="label">Pesanan Selesai</div>
            </div>
            <div class="stat-card">
              <div class="value">${reportData.orderStats.pending + reportData.orderStats.preparing + reportData.orderStats.ready}</div>
              <div class="label">Dalam Proses</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Menu Terlaris</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Menu</th>
                <th class="text-right">Jumlah Terjual</th>
                <th class="text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.bestSellers.slice(0, 10).map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${formatPrice(item.revenue)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>Daftar Pesanan</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Waktu</th>
                <th>Pembeli</th>
                <th>Status</th>
                <th>Waktu Ambil</th>
                <th class="text-right">Item</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.orders.map((order, idx) => {
                const time = new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                const statusConfig = getStatusConfig(order.status);
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${time}</td>
                    <td>${order.user.name}</td>
                    <td>${statusConfig.label}</td>
                    <td>${order.pickupTime === "BREAK_1" ? "Istirahat 1" : "Istirahat 2"}</td>
                    <td class="text-right">${order.items.length}</td>
                    <td class="text-right">${formatPrice(order.totalAmount)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>Laporan Penarikan Saldo</h2>
          <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 15px;">
            <div class="stat-card">
              <div class="value" style="color: #22c55e;">${formatPrice(reportData.withdrawalStats.totalNetAmount)}</div>
              <div class="label">Total Dicairkan</div>
            </div>
            <div class="stat-card">
              <div class="value">${reportData.withdrawalStats.total}</div>
              <div class="label">Total Request</div>
            </div>
            <div class="stat-card">
              <div class="value">${reportData.withdrawalStats.pending}</div>
              <div class="label">Menunggu</div>
            </div>
            <div class="stat-card">
              <div class="value" style="color: #ef4444;">${formatPrice(reportData.withdrawalStats.totalAdminFee)}</div>
              <div class="label">Potongan Admin</div>
            </div>
          </div>
          ${reportData.withdrawals.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Waktu</th>
                <th>Penjual</th>
                <th class="text-right">Jumlah</th>
                <th class="text-right">Potongan</th>
                <th class="text-right">Diterima</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.withdrawals.map((w, idx) => {
                const time = new Date(w.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                const statusLabel = w.status === "PENDING" ? "Menunggu" : w.status === "APPROVED" ? "Disetujui" : "Ditolak";
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${time}</td>
                    <td>${w.user.name}</td>
                    <td class="text-right">${formatPrice(w.amount)}</td>
                    <td class="text-right" style="color: #ef4444;">-${formatPrice(w.adminFee)}</td>
                    <td class="text-right" style="color: #22c55e;">${formatPrice(w.netAmount)}</td>
                    <td>${statusLabel}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
          ` : `<p style="text-align: center; color: #999;">Belum ada permintaan penarikan</p>`}
        </div>
        
        <div class="footer">
          <p>Dicetak pada ${new Date().toLocaleString("id-ID")} - NexusBite E-Canteen System</p>
        </div>
        
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    setShowExportMenu(false);
  };

  const days = generateDays(selectedYear, selectedMonth);
  const years = generateYears();

  // Adjust day if it exceeds days in month
  useEffect(() => {
    const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </div>
            Laporan Harian
          </h1>
          <p className="text-neutral-400 mt-1">Ringkasan penjualan dan statistik</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Picker - Custom Dropdowns */}
          <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 rounded-xl p-2">
            <Calendar className="w-4 h-4 text-neutral-400 ml-2" />
            
            {/* Day Dropdown */}
            <div className="relative" ref={dayDropdownRef}>
              <button
                onClick={() => {
                  setShowDayDropdown(!showDayDropdown);
                  setShowMonthDropdown(false);
                  setShowYearDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 hover:border-neutral-600 transition-all min-w-[60px] justify-between"
              >
                <span className="font-medium">{selectedDay}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showDayDropdown ? "rotate-180" : ""}`} />
              </button>
              {showDayDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50 min-w-[80px] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-48 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                    {days.map((day) => (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDay(day);
                          setShowDayDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                          selectedDay === day
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        }`}
                      >
                        <span>{day}</span>
                        {selectedDay === day && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Month Dropdown */}
            <div className="relative" ref={monthDropdownRef}>
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowDayDropdown(false);
                  setShowYearDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 hover:border-neutral-600 transition-all min-w-[110px] justify-between"
              >
                <span className="font-medium">{months.find(m => m.value === selectedMonth)?.label}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showMonthDropdown ? "rotate-180" : ""}`} />
              </button>
              {showMonthDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50 min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                    {months.map((month) => (
                      <button
                        key={month.value}
                        onClick={() => {
                          setSelectedMonth(month.value);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                          selectedMonth === month.value
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        }`}
                      >
                        <span>{month.label}</span>
                        {selectedMonth === month.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Year Dropdown */}
            <div className="relative" ref={yearDropdownRef}>
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowDayDropdown(false);
                  setShowMonthDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 hover:border-neutral-600 transition-all min-w-[90px] justify-between"
              >
                <span className="font-medium">{selectedYear}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showYearDropdown ? "rotate-180" : ""}`} />
              </button>
              {showYearDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50 min-w-[100px] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-48 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                          selectedYear === year
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        }`}
                      >
                        <span>{year}</span>
                        {selectedYear === year && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/25"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-10 min-w-[180px]">
                <button
                  onClick={exportToExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 text-white transition-colors text-left"
                >
                  <FileSpreadsheet className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium">Excel (CSV)</p>
                    <p className="text-xs text-neutral-400">Spreadsheet format</p>
                  </div>
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 text-white transition-colors text-left border-t border-neutral-800"
                >
                  <FileText className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-neutral-400">Print / Save as PDF</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Display */}
      <div className="text-center py-2">
        <p className="text-lg font-medium text-white">
          {formatDate(selectedDate)}
          {isToday && <span className="ml-2 text-orange-400 text-sm">(Hari ini)</span>}
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 animate-pulse">
              <div className="bg-neutral-800 h-4 rounded w-1/2 mb-3" />
              <div className="bg-neutral-800 h-8 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reportData ? (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-300 text-sm font-medium">Total Pendapatan</p>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-white text-2xl font-bold">{formatPrice(reportData.totalRevenue)}</p>
              <p className="text-orange-400/60 text-xs mt-1">
                Dikonfirmasi: {formatPrice(reportData.completedRevenue)}
              </p>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-neutral-300 text-sm font-medium">Total Pesanan</p>
                <ShoppingBag className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-white text-2xl font-bold">{reportData.orderStats.total}</p>
              <p className="text-neutral-400/60 text-xs mt-1">
                Selesai: {reportData.orderStats.completed}
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-amber-300 text-sm font-medium">Menunggu</p>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-white text-2xl font-bold">{reportData.orderStats.pending}</p>
              <p className="text-amber-400/60 text-xs mt-1">
                Diproses: {reportData.orderStats.preparing}
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-300 text-sm font-medium">Siap Diambil</p>
                <Package className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-white text-2xl font-bold">{reportData.orderStats.ready}</p>
            </div>
          </div>

          {/* Withdrawal Stats Cards */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-400" />
              Laporan Penarikan Saldo
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-300 text-sm font-medium">Total Dicairkan</p>
                  <Banknote className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-white text-2xl font-bold">{formatPrice(reportData.withdrawalStats.totalNetAmount)}</p>
                <p className="text-green-400/60 text-xs mt-1">
                  dari {reportData.withdrawalStats.approved} penarikan
                </p>
              </div>
              
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-neutral-300 text-sm font-medium">Total Request</p>
                  <ArrowDownCircle className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-white text-2xl font-bold">{reportData.withdrawalStats.total}</p>
                <p className="text-neutral-400/60 text-xs mt-1">
                  {formatPrice(reportData.withdrawalStats.totalAmount)}
                </p>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-amber-300 text-sm font-medium">Menunggu</p>
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-white text-2xl font-bold">{reportData.withdrawalStats.pending}</p>
                <p className="text-amber-400/60 text-xs mt-1">
                  Perlu diproses
                </p>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-red-300 text-sm font-medium">Potongan Admin</p>
                  <Wallet className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-white text-2xl font-bold">{formatPrice(reportData.withdrawalStats.totalAdminFee)}</p>
                <p className="text-red-400/60 text-xs mt-1">
                  5% dari penarikan
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Best Sellers */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-400" />
                Menu Terlaris
              </h2>
              
              {reportData.bestSellers.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada data penjualan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportData.bestSellers.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? "bg-amber-500/20 text-amber-400" :
                        index === 1 ? "bg-neutral-400/20 text-neutral-300" :
                        index === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-neutral-600/20 text-neutral-400"
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-neutral-400 text-sm">{item.quantity} terjual</p>
                      </div>
                      <p className="text-orange-400 font-semibold">{formatPrice(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                Pesanan Hari Ini
              </h2>
              
              {reportData.orders.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
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
                        className="p-3 bg-neutral-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} text-xs font-medium px-2 py-1 rounded-full`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                          <span className="text-neutral-500 text-xs">
                            {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-white font-medium text-sm">{order.user.name}</p>
                        <p className="text-neutral-400 text-xs">
                          {order.items.length} item • {formatPrice(order.totalAmount)} • {order.pickupTime === "BREAK_1" ? "Istirahat 1" : "Istirahat 2"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal List */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-400" />
              Permintaan Penarikan Hari Ini
            </h2>
            
            {reportData.withdrawals.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada permintaan penarikan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left text-xs font-medium text-neutral-400 py-3 px-2">Waktu</th>
                      <th className="text-left text-xs font-medium text-neutral-400 py-3 px-2">Penjual</th>
                      <th className="text-right text-xs font-medium text-neutral-400 py-3 px-2">Jumlah</th>
                      <th className="text-right text-xs font-medium text-neutral-400 py-3 px-2">Potongan</th>
                      <th className="text-right text-xs font-medium text-neutral-400 py-3 px-2">Diterima</th>
                      <th className="text-center text-xs font-medium text-neutral-400 py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.withdrawals.map((withdrawal) => {
                      const statusConfig = getWithdrawalStatusConfig(withdrawal.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <tr key={withdrawal.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                          <td className="py-3 px-2 text-neutral-400 text-sm">
                            {new Date(withdrawal.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-2">
                            <p className="text-white text-sm font-medium">{withdrawal.user.name}</p>
                            <p className="text-neutral-500 text-xs">{withdrawal.user.email}</p>
                          </td>
                          <td className="py-3 px-2 text-right text-white text-sm font-medium">
                            {formatPrice(withdrawal.amount)}
                          </td>
                          <td className="py-3 px-2 text-right text-red-400 text-sm">
                            -{formatPrice(withdrawal.adminFee)}
                          </td>
                          <td className="py-3 px-2 text-right text-green-400 text-sm font-medium">
                            {formatPrice(withdrawal.netAmount)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color} text-xs font-medium px-2 py-1 rounded-full`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-neutral-400">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Gagal memuat data laporan</p>
        </div>
      )}
    </div>
  );
}
