"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Store,
  Mail,
  Loader2,
  GraduationCap,
  Search,
  ShoppingBag,
  Package,
  Wallet,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  balance: number;
  kelas: string | null;
  jurusan: string | null;
  nis: string | null;
  createdAt: string;
  _count: {
    orders: number;
    menus: number;
  };
}

interface UserStats {
  totalSiswa: number;
  totalPenjual: number;
  pendingPenjual: number;
  approvedPenjual: number;
}

type TabType = "all" | "siswa" | "penjual";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalSiswa: 0,
    totalPenjual: 0,
    pendingPenjual: 0,
    approvedPenjual: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    type: "approve" | "reject";
    userId: string;
    userName: string;
  } | null>(null);

  const fetchUsers = async (role?: string) => {
    try {
      const url = role ? `/api/admin/users?role=${role}` : "/api/admin/users";
      const response = await fetch(url);
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const roleMap: Record<TabType, string | undefined> = {
      all: undefined,
      siswa: "SISWA",
      penjual: "PENJUAL",
    };
    setIsLoading(true);
    fetchUsers(roleMap[activeTab]);
  }, [activeTab]);

  const handleApprove = async (userId: string, userName: string) => {
    setConfirmModal(null);
    setProcessingId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, isApproved: true } : user
          )
        );
        setStats((prev) => ({
          ...prev,
          pendingPenjual: prev.pendingPenjual - 1,
          approvedPenjual: prev.approvedPenjual + 1,
        }));
        showToast(`${userName} berhasil disetujui!`, "success");
      } else {
        showToast(data.error || "Gagal menyetujui user", "error");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    setConfirmModal(null);
    setProcessingId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setStats((prev) => ({
          ...prev,
          pendingPenjual: prev.pendingPenjual - 1,
          totalPenjual: prev.totalPenjual - 1,
        }));
        showToast(`User ${userName} berhasil dihapus`, "success");
      } else {
        showToast(data.error || "Gagal menghapus user", "error");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nis && user.nis.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingPenjual = filteredUsers.filter(
    (u) => u.role === "PENJUAL" && !u.isApproved
  );
  const approvedPenjual = filteredUsers.filter(
    (u) => u.role === "PENJUAL" && u.isApproved
  );
  const siswaUsers = filteredUsers.filter((u) => u.role === "SISWA");

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Manajemen Pengguna
            </h1>
            <p className="text-sm text-neutral-400">
              Kelola semua pengguna (Siswa & Penjual)
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalSiswa}</p>
              <p className="text-sm text-neutral-400">Total Siswa</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalPenjual}</p>
              <p className="text-sm text-neutral-400">Total Penjual</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.approvedPenjual}</p>
              <p className="text-sm text-neutral-400">Penjual Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pendingPenjual}</p>
              <p className="text-sm text-neutral-400">Menunggu Approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari nama, email, atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
        {/* Tabs */}
        <div className="flex rounded-xl bg-neutral-800/50 border border-neutral-700/50 p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-orange-500 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab("siswa")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "siswa"
                ? "bg-orange-500 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Siswa
          </button>
          <button
            onClick={() => setActiveTab("penjual")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "penjual"
                ? "bg-orange-500 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Penjual
          </button>
        </div>
      </div>

      {/* Pending Penjual Approvals */}
      {(activeTab === "all" || activeTab === "penjual") &&
        pendingPenjual.length > 0 && (
          <div className="bg-neutral-800/50 border border-amber-500/30 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">
                Penjual Menunggu Persetujuan ({pendingPenjual.length})
              </h2>
            </div>
            <div className="space-y-3">
              {pendingPenjual.map((user) => (
                <div
                  key={user.id}
                  className="bg-neutral-900/50 border border-neutral-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <Store className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <div className="flex items-center gap-1 text-sm text-neutral-400">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmModal({ type: "approve", userId: user.id, userName: user.name })}
                      disabled={processingId === user.id}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {processingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Setujui
                    </button>
                    <button
                      onClick={() => setConfirmModal({ type: "reject", userId: user.id, userName: user.name })}
                      disabled={processingId === user.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Siswa List */}
      {(activeTab === "all" || activeTab === "siswa") && (
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              Daftar Siswa ({siswaUsers.length})
            </h2>
          </div>
          {siswaUsers.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              {searchQuery ? "Tidak ada siswa yang cocok dengan pencarian" : "Belum ada siswa terdaftar"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-neutral-400 text-sm border-b border-neutral-700/50">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">NIS</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Kelas</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Saldo</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Orders</th>
                    <th className="pb-3 font-medium">Bergabung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/50">
                  {siswaUsers.map((user) => (
                    <tr key={user.id} className="text-sm">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-xs text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-neutral-300 hidden sm:table-cell">
                        {user.nis || "-"}
                      </td>
                      <td className="py-3 text-neutral-300 hidden md:table-cell">
                        {user.kelas && user.jurusan
                          ? `${user.kelas} ${user.jurusan}`
                          : user.kelas || "-"}
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-green-400">
                          <Wallet className="w-3 h-3" />
                          Rp {formatMoney(user.balance)}
                        </div>
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-neutral-300">
                          <ShoppingBag className="w-3 h-3" />
                          {user._count.orders}
                        </div>
                      </td>
                      <td className="py-3 text-neutral-400">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Approved Penjual */}
      {(activeTab === "all" || activeTab === "penjual") && (
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">
              Penjual Aktif ({approvedPenjual.length})
            </h2>
          </div>
          {approvedPenjual.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              {searchQuery ? "Tidak ada penjual yang cocok dengan pencarian" : "Belum ada penjual yang disetujui"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-neutral-400 text-sm border-b border-neutral-700/50">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Email</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Saldo</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Menu</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Bergabung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/50">
                  {approvedPenjual.map((user) => (
                    <tr key={user.id} className="text-sm">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <Store className="w-4 h-4 text-orange-400" />
                          </div>
                          <p className="font-medium text-white">{user.name}</p>
                        </div>
                      </td>
                      <td className="py-3 text-neutral-300 hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-green-400">
                          <Wallet className="w-3 h-3" />
                          Rp {formatMoney(user.balance)}
                        </div>
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-neutral-300">
                          <Package className="w-3 h-3" />
                          {user._count.menus} produk
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Aktif
                        </span>
                      </td>
                      <td className="py-3 text-neutral-400">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal !== null}
        title={confirmModal?.type === "approve" ? "Setujui Penjual" : "Tolak Penjual"}
        message={
          confirmModal?.type === "approve"
            ? `Apakah Anda yakin ingin menyetujui ${confirmModal?.userName} sebagai Penjual?`
            : `Apakah Anda yakin ingin menolak dan menghapus akun ${confirmModal?.userName}?`
        }
        confirmText={confirmModal?.type === "approve" ? "Ya, Setujui" : "Ya, Tolak & Hapus"}
        confirmVariant={confirmModal?.type === "approve" ? "primary" : "danger"}
        onConfirm={() => {
          if (confirmModal?.type === "approve") {
            handleApprove(confirmModal.userId, confirmModal.userName);
          } else if (confirmModal) {
            handleReject(confirmModal.userId, confirmModal.userName);
          }
        }}
        onCancel={() => setConfirmModal(null)}
        isLoading={processingId !== null}
      />
    </div>
  );
}
