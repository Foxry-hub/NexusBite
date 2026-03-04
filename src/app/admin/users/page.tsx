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
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string, userName: string) => {
    if (!confirm(`Setujui ${userName} sebagai Penjual?`)) return;

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
        alert(`✅ ${userName} berhasil disetujui!`);
      } else {
        alert(data.error || "Gagal menyetujui user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    if (!confirm(`Tolak dan hapus akun ${userName}?`)) return;

    setProcessingId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        alert(`User ${userName} berhasil dihapus`);
      } else {
        alert(data.error || "Gagal menghapus user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingUsers = users.filter((u) => !u.isApproved);
  const approvedUsers = users.filter((u) => u.isApproved);

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
              Manajemen Penjual
            </h1>
            <p className="text-sm text-neutral-400">
              Kelola persetujuan akun penjual
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingUsers.length}</p>
              <p className="text-sm text-neutral-400">Menunggu Persetujuan</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{approvedUsers.length}</p>
              <p className="text-sm text-neutral-400">Penjual Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="bg-neutral-800/50 border border-amber-500/30 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">
              Menunggu Persetujuan ({pendingUsers.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingUsers.map((user) => (
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
                    onClick={() => handleApprove(user.id, user.name)}
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
                    onClick={() => handleReject(user.id, user.name)}
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

      {/* Approved Users */}
      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">
            Penjual Aktif ({approvedUsers.length})
          </h2>
        </div>
        {approvedUsers.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">
            Belum ada penjual yang disetujui
          </p>
        ) : (
          <div className="space-y-3">
            {approvedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-neutral-900/50 border border-neutral-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Store className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <div className="flex items-center gap-1 text-sm text-neutral-400">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Aktif
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
