"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Wallet,
  UserCircle,
  Plus,
  CheckCircle,
  AlertCircle,
  History,
  RefreshCw,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

interface BalanceHistory {
  id: string;
  userId: string;
  amount: number;
  type: string;
  note: string | null;
  createdAt: string;
  user: User;
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

export default function BalanceTopUpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isTopUp, setIsTopUp] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<BalanceHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const quickAmounts = [5000, 10000, 20000, 50000, 100000];

  // Fetch history from database
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const res = await fetch("/api/admin/balance?history=true");
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/balance?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch {
      console.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchUsers]);

  const handleTopUp = async () => {
    if (!selectedUser || !topUpAmount) {
      setError("Pilih siswa dan masukkan jumlah top-up");
      return;
    }

    const amount = parseInt(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Jumlah top-up tidak valid");
      return;
    }

    setIsTopUp(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan top-up");
      }

      setSuccess(data.message);
      
      // Refresh history from database
      fetchHistory();

      // Update selected user balance
      setSelectedUser(data.user);
      setTopUpAmount("");

      // Also update search results if the user is there
      setSearchResults((prev) =>
        prev.map((u) => (u.id === data.user.id ? data.user : u))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melakukan top-up");
    } finally {
      setIsTopUp(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-orange-400" />
          </div>
          Manajemen Saldo
        </h1>
        <p className="text-neutral-400 mt-1">Top-up saldo siswa secara manual</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Search & Select User */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Box */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 animate-pop-in animation-delay-100">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Cari Siswa
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama atau email..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-neutral-600 border-t-orange-400 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setError(null);
                      setSuccess(null);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      selectedUser?.id === user.id
                        ? "bg-orange-500/20 border border-orange-500/50"
                        : "bg-neutral-800/50 hover:bg-neutral-800 border border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center text-neutral-300 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-neutral-400 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-semibold">{formatPrice(user.balance)}</p>
                      <p className="text-neutral-500 text-xs">Saldo saat ini</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="mt-4 text-center py-8 text-neutral-400">
                <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada siswa ditemukan</p>
              </div>
            )}
          </div>

          {/* Selected User & Top Up Form */}
          {selectedUser && (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 animate-pop-in">
              <div className="flex items-center justify-between mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold text-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selectedUser.name}</p>
                    <p className="text-neutral-400 text-sm">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold text-xl">{formatPrice(selectedUser.balance)}</p>
                  <p className="text-neutral-400 text-xs">Saldo saat ini</p>
                </div>
              </div>

              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Jumlah Top-Up
              </label>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">Rp</span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0"
                  min="1000"
                  className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-lg font-semibold placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      topUpAmount === amount.toString()
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    {formatPrice(amount)}
                  </button>
                ))}
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <p className="text-orange-400 text-sm">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleTopUp}
                disabled={isTopUp || !topUpAmount}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30"
              >
                {isTopUp ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Top-Up Saldo
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Recent Top-Ups */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 h-fit animate-pop-in animation-delay-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              Riwayat Top-Up
            </h2>
            <button
              onClick={fetchHistory}
              disabled={isLoadingHistory}
              className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
            </button>
          </div>
          
          {isLoadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-neutral-800/50 rounded-xl animate-pulse">
                  <div className="bg-neutral-700 h-4 w-2/3 rounded mb-2" />
                  <div className="bg-neutral-700 h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-neutral-800/50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium text-sm">{item.user.name}</p>
                    <span className="text-orange-400 font-semibold text-sm">
                      +{formatPrice(item.amount)}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs">
                    {formatDateTime(item.createdAt)} • Saldo: {formatPrice(item.user.balance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
