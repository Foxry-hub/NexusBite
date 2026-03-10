"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  TrendingDown,
  History,
  RefreshCw,
  Send,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useUserStore } from "@/store/useUserStore";

interface Withdrawal {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  method: string;
  note: string | null;
  adminNote: string | null;
  processedAt: string | null;
  createdAt: string;
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

export default function KeuanganClient({ initialUser }: { initialUser: { id: string; name: string; email: string; role: string; balance: number } }) {
  const { user, setUser } = useUserStore();
  const [balance, setBalance] = useState(initialUser.balance || 0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");

  const quickAmounts = [50000, 100000, 200000, 500000];

  useEffect(() => {
    setUser(initialUser as never);
  }, [initialUser, setUser]);

  const currentUser = user || initialUser;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const res = await fetch("/api/penjual/withdrawals");
      const data = await res.json();
      if (res.ok) {
        setWithdrawals(data.withdrawals || []);
        setBalance(data.balance || 0);
        setPendingAmount(data.pendingAmount || 0);
        setTotalWithdrawn(data.totalWithdrawn || 0);
      }
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount);

    if (!amount || amount <= 0) {
      setError("Masukkan jumlah penarikan");
      return;
    }

    const availableBalance = balance - pendingAmount;
    if (amount > availableBalance) {
      setError(`Saldo tidak mencukupi. Saldo tersedia: ${formatPrice(availableBalance)}`);
      return;
    }

    if (amount < 10000) {
      setError("Minimum penarikan adalah Rp 10.000");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/penjual/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          note: withdrawNote || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengajukan penarikan");
      }

      setSuccess("Permintaan penarikan berhasil diajukan! Silakan tunggu konfirmasi admin.");
      setWithdrawAmount("");
      setWithdrawNote("");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengajukan penarikan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableBalance = balance - pendingAmount;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Sidebar user={currentUser} role="PENJUAL" />

      <main className="ml-64 min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Keuangan</h1>
          <p className="text-neutral-400">Kelola saldo dan penarikan dana Anda</p>
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

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Balance */}
          <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Total Saldo</p>
                <p className="text-2xl font-bold text-orange-400">{formatPrice(balance)}</p>
              </div>
            </div>
            {pendingAmount > 0 && (
              <div className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatPrice(pendingAmount)} sedang diproses
              </div>
            )}
          </div>

          {/* Available Balance */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Banknote className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Saldo Tersedia</p>
                <p className="text-2xl font-bold text-green-400">{formatPrice(availableBalance)}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Dapat ditarik kapan saja</p>
          </div>

          {/* Total Withdrawn */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Total Tarik Tunai</p>
                <p className="text-2xl font-bold text-blue-400">{formatPrice(totalWithdrawn)}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Seluruh penarikan yang disetujui</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Tarik Saldo</h2>
                <p className="text-neutral-500 text-sm">Metode: Cash (Ambil langsung)</p>
              </div>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-neutral-400 text-sm mb-2">
                  Jumlah Penarikan
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">Rp</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Minimum penarikan: Rp 10.000</p>
              </div>

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setWithdrawAmount(amount.toString())}
                    disabled={amount > availableBalance}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      amount > availableBalance
                        ? "bg-neutral-800/30 text-neutral-600 cursor-not-allowed"
                        : withdrawAmount === amount.toString()
                        ? "bg-orange-500 text-white"
                        : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50 hover:text-white"
                    }`}
                  >
                    {formatPrice(amount)}
                  </button>
                ))}
              </div>

              {/* Note */}
              <div>
                <label className="block text-neutral-400 text-sm mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  rows={2}
                />
              </div>

              {/* Fee Calculation */}
              {withdrawAmount && parseInt(withdrawAmount) > 0 && (
                <div className="bg-neutral-800/30 border border-neutral-700 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-neutral-300 mb-3">Rincian Penarikan</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Jumlah Penarikan</span>
                    <span className="text-white">{formatPrice(parseInt(withdrawAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Biaya Admin (5%)</span>
                    <span className="text-red-400">- {formatPrice(Math.round(parseInt(withdrawAmount) * 0.05))}</span>
                  </div>
                  <div className="border-t border-neutral-700 pt-2 mt-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-neutral-300">Yang Diterima</span>
                      <span className="text-green-400">{formatPrice(Math.round(parseInt(withdrawAmount) * 0.95))}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-400/90">
                    <p className="font-medium mb-1">Informasi Penarikan</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-400/70">
                      <li>Dikenakan biaya admin sebesar <span className="font-semibold text-amber-400">5%</span> dari jumlah penarikan</li>
                      <li>Permintaan penarikan akan diproses oleh admin</li>
                      <li>Pengambilan dilakukan secara tunai (cash)</li>
                      <li>Hubungi admin setelah pengajuan disetujui</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !withdrawAmount || parseInt(withdrawAmount) <= 0}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Ajukan Penarikan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Withdrawal History */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Riwayat Penarikan</h2>
                  <p className="text-neutral-500 text-sm">{withdrawals.length} permintaan</p>
                </div>
              </div>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ArrowDownCircle className="w-8 h-8 text-neutral-600" />
                </div>
                <p className="text-neutral-500 text-sm">Belum ada permintaan penarikan</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {withdrawals.map((withdrawal) => {
                  const config = getStatusConfig(withdrawal.status);
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={withdrawal.id}
                      className={`bg-neutral-800/30 border ${config.border} rounded-xl p-4 transition-all hover:bg-neutral-800/50`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${config.color}`} />
                          <span className={`text-xs font-medium ${config.color} ${config.bg} px-2 py-0.5 rounded-full`}>
                            {config.label}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {formatPrice(withdrawal.amount)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                        <Clock className="w-3 h-3" />
                        <span>Diajukan: {formatDateTime(withdrawal.createdAt)}</span>
                      </div>
                      
                      {withdrawal.processedAt && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                          <CheckCircle className="w-3 h-3" />
                          <span>Diproses: {formatDateTime(withdrawal.processedAt)}</span>
                        </div>
                      )}

                      {withdrawal.note && (
                        <div className="text-xs text-neutral-400 bg-neutral-900/50 rounded-lg p-2 mb-2">
                          <span className="text-neutral-500">Catatan:</span> {withdrawal.note}
                        </div>
                      )}

                      {withdrawal.adminNote && (
                        <div className={`text-xs ${withdrawal.status === "REJECTED" ? "text-red-400 bg-red-500/10" : "text-green-400 bg-green-500/10"} rounded-lg p-2`}>
                          <span className="opacity-70">Admin:</span> {withdrawal.adminNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
