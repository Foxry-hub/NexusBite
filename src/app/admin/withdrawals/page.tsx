"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  User,
  Banknote,
  Calendar,
  MessageSquare,
  Filter,
  ChevronDown,
  Check,
} from "lucide-react";

interface WithdrawalUser {
  id: string;
  name: string;
  email: string;
  balance: number;
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
  user: WithdrawalUser;
}

interface Stats {
  PENDING: { count: number; amount: number };
  APPROVED: { count: number; amount: number };
  REJECTED: { count: number; amount: number };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: Withdrawal["status"]) {
  switch (status) {
    case "PENDING":
      return {
        label: "Menunggu",
        color: "text-amber-400",
        bg: "bg-amber-500/20",
        border: "border-amber-500/30",
        icon: Clock,
      };
    case "APPROVED":
      return {
        label: "Disetujui",
        color: "text-green-400",
        bg: "bg-green-500/20",
        border: "border-green-500/30",
        icon: CheckCircle,
      };
    case "REJECTED":
      return {
        label: "Ditolak",
        color: "text-red-400",
        bg: "bg-red-500/20",
        border: "border-red-500/30",
        icon: XCircle,
      };
  }
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<Stats>({
    PENDING: { count: 0, amount: 0 },
    APPROVED: { count: 0, amount: 0 },
    REJECTED: { count: 0, amount: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Dropdown state
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  const statusOptions = [
    { value: "all", label: "Semua Status", icon: Filter, color: "text-neutral-400" },
    { value: "PENDING", label: "Menunggu", icon: Clock, color: "text-amber-400" },
    { value: "APPROVED", label: "Disetujui", icon: CheckCircle, color: "text-green-400" },
    { value: "REJECTED", label: "Ditolak", icon: XCircle, color: "text-red-400" },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const url = filterStatus !== "all" 
        ? `/api/admin/withdrawals?status=${filterStatus}`
        : "/api/admin/withdrawals";
      const res = await fetch(url);
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
      setStats(data.stats || {
        PENDING: { count: 0, amount: 0 },
        APPROVED: { count: 0, amount: 0 },
        REJECTED: { count: 0, amount: 0 },
      });
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: adminNote || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyetujui penarikan");
      }

      setSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} untuk ${selectedWithdrawal.user.name} berhasil disetujui!`);
      setShowApproveModal(false);
      setSelectedWithdrawal(null);
      setAdminNote("");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyetujui penarikan");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    if (!adminNote.trim()) {
      setError("Alasan penolakan harus diisi");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menolak penarikan");
      }

      setSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} untuk ${selectedWithdrawal.user.name} berhasil ditolak.`);
      setShowRejectModal(false);
      setSelectedWithdrawal(null);
      setAdminNote("");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menolak penarikan");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        w.user.name.toLowerCase().includes(query) ||
        w.user.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Penarikan Saldo</h1>
        <p className="text-neutral-400">Kelola permintaan penarikan saldo dari penjual</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Menunggu</p>
                <p className="text-xl font-bold text-amber-400">{stats.PENDING.count}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-amber-400/70">{formatPrice(stats.PENDING.amount)}</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Disetujui</p>
                <p className="text-xl font-bold text-green-400">{stats.APPROVED.count}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-green-400/70">{formatPrice(stats.APPROVED.amount)}</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Ditolak</p>
                <p className="text-xl font-bold text-red-400">{stats.REJECTED.count}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-red-400/70">{formatPrice(stats.REJECTED.amount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email penjual..."
              className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-2.5 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-xl text-white hover:bg-neutral-700/50 hover:border-neutral-600 transition-all min-w-[160px] justify-between"
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const option = statusOptions.find(o => o.value === filterStatus);
                  const IconComponent = option?.icon || Filter;
                  return (
                    <>
                      <IconComponent className={`w-4 h-4 ${option?.color || 'text-neutral-400'}`} />
                      <span className="font-medium">{option?.label || 'Semua Status'}</span>
                    </>
                  );
                })()}
              </div>
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showStatusDropdown ? "rotate-180" : ""}`} />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  {statusOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterStatus(option.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          filterStatus === option.value
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${filterStatus === option.value ? 'text-orange-400' : option.color}`} />
                          <span>{option.label}</span>
                        </div>
                        {filterStatus === option.value && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowDownCircle className="w-8 h-8 text-neutral-600" />
            </div>
            <p className="text-neutral-500">Tidak ada permintaan penarikan</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredWithdrawals.map((withdrawal) => {
              const config = getStatusConfig(withdrawal.status);
              const StatusIcon = config.icon;
              return (
                <div
                  key={withdrawal.id}
                  className="p-6 hover:bg-neutral-800/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - User info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {withdrawal.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{withdrawal.user.name}</h3>
                        <p className="text-neutral-500 text-sm">{withdrawal.user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(withdrawal.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Banknote className="w-3 h-3" />
                            Saldo: {formatPrice(withdrawal.user.balance)}
                          </span>
                        </div>
                        {withdrawal.note && (
                          <div className="mt-2 text-xs text-neutral-400 bg-neutral-800/50 rounded-lg p-2 max-w-md">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            {withdrawal.note}
                          </div>
                        )}
                        {withdrawal.adminNote && withdrawal.status !== "PENDING" && (
                          <div className={`mt-2 text-xs rounded-lg p-2 max-w-md ${
                            withdrawal.status === "REJECTED" 
                              ? "text-red-400 bg-red-500/10" 
                              : "text-green-400 bg-green-500/10"
                          }`}>
                            <span className="opacity-70">Admin: </span>
                            {withdrawal.adminNote}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Amount and actions */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-2">
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-xs font-medium ${config.color} ${config.bg} px-2 py-0.5 rounded-full`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(withdrawal.amount)}
                      </p>
                      {withdrawal.adminFee > 0 && (
                        <div className="text-xs text-neutral-400 space-y-0.5 mt-1">
                          <p>Potongan admin: <span className="text-red-400">{formatPrice(withdrawal.adminFee)}</span></p>
                          <p>Diterima penjual: <span className="text-green-400">{formatPrice(withdrawal.netAmount)}</span></p>
                        </div>
                      )}
                      <p className="text-xs text-neutral-500 mt-2 mb-3">Metode: Cash</p>
                      
                      {withdrawal.status === "PENDING" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setAdminNote("");
                              setShowApproveModal(true);
                            }}
                            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Setujui
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setAdminNote("");
                              setShowRejectModal(true);
                            }}
                            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Setujui Penarikan</h3>
                <p className="text-neutral-500 text-sm">Konfirmasi persetujuan penarikan saldo</p>
              </div>
            </div>

            <div className="bg-neutral-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {selectedWithdrawal.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedWithdrawal.user.name}</p>
                  <p className="text-neutral-500 text-sm">{selectedWithdrawal.user.email}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Jumlah Penarikan</span>
                  <span className="text-white font-medium">{formatPrice(selectedWithdrawal.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Potongan Admin (5%)</span>
                  <span className="text-red-400 font-medium">- {formatPrice(selectedWithdrawal.adminFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-700">
                  <span className="text-neutral-300 font-medium">Yang Diterima Penjual</span>
                  <span className="text-xl font-bold text-green-400">{formatPrice(selectedWithdrawal.netAmount)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-neutral-400 text-sm mb-2">
                Catatan untuk penjual (opsional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                placeholder="Contoh: Silakan ambil di ruang admin..."
                rows={2}
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-400/90">
                  Saldo sebesar {formatPrice(selectedWithdrawal.amount)} akan dikurangi dari akun penjual setelah disetujui.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedWithdrawal(null);
                  setAdminNote("");
                }}
                className="flex-1 px-4 py-3 bg-neutral-800 text-neutral-300 rounded-xl font-medium hover:bg-neutral-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Setujui
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Tolak Penarikan</h3>
                <p className="text-neutral-500 text-sm">Berikan alasan penolakan penarikan</p>
              </div>
            </div>

            <div className="bg-neutral-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {selectedWithdrawal.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedWithdrawal.user.name}</p>
                  <p className="text-neutral-500 text-sm">{selectedWithdrawal.user.email}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-neutral-700">
                <span className="text-neutral-400">Jumlah Penarikan</span>
                <span className="text-xl font-bold text-red-400">{formatPrice(selectedWithdrawal.amount)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-neutral-400 text-sm mb-2">
                Alasan penolakan <span className="text-red-400">*</span>
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                placeholder="Contoh: Saldo tidak mencukupi, data tidak valid..."
                rows={3}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedWithdrawal(null);
                  setAdminNote("");
                }}
                className="flex-1 px-4 py-3 bg-neutral-800 text-neutral-300 rounded-xl font-medium hover:bg-neutral-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !adminNote.trim()}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Tolak
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
