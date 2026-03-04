import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  ShoppingBag,
  Clock,
  Wallet,
  History,
  Utensils,
  Bell,
  ChevronRight,
  LogOut,
} from "lucide-react";

export const metadata = {
  title: "Dashboard Siswa — NexusBite",
  description: "Dashboard Pre-Order untuk siswa SMKN 40 Jakarta",
};

export default async function SiswaDashboard() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "SISWA") {
    // Redirect to appropriate dashboard
    if (user.role === "PENJUAL") redirect("/dashboard/penjual");
    if (user.role === "ADMIN") redirect("/admin/menu");
    redirect("/");
  }

  // Get first letter for avatar
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div>
              <p className="text-white font-medium text-sm">Halo, {user.name.split(" ")[0]}!</p>
              <p className="text-slate-400 text-xs">Siswa SMKN 40 Jakarta</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 mb-6 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-emerald-100">Saldo NexusBite</p>
            <Wallet className="w-5 h-5 text-emerald-100" />
          </div>
          <p className="text-3xl font-bold text-white mb-4">
            Rp {user.balance?.toLocaleString("id-ID") || "0"}
          </p>
          <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-white font-medium text-sm transition-colors">
            + Top Up Saldo
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href="/menu"
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
              <Utensils className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-white font-medium text-sm">Pesan Makanan</p>
            <p className="text-slate-400 text-xs mt-0.5">Pre-order sekarang</p>
          </a>
          <a
            href="/orders"
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-white font-medium text-sm">Pesanan Aktif</p>
            <p className="text-slate-400 text-xs mt-0.5">Lihat status</p>
          </a>
        </div>

        {/* Active Order (if any) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Pesanan Aktif</h2>
            <a href="/orders" className="text-orange-400 text-sm flex items-center gap-1">
              Lihat semua <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3 text-slate-400">
              <Clock className="w-5 h-5" />
              <p className="text-sm">Belum ada pesanan aktif</p>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Riwayat Pesanan</h2>
            <a href="/history" className="text-orange-400 text-sm flex items-center gap-1">
              Lihat semua <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3 text-slate-400">
              <History className="w-5 h-5" />
              <p className="text-sm">Belum ada riwayat pesanan</p>
            </div>
          </div>
        </div>

        {/* Pickup Time Info */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium text-sm">Waktu Pengambilan</p>
              <p className="text-slate-400 text-xs mt-1">
                Istirahat 1: 09:30 - 10:00 WIB<br />
                Istirahat 2: 12:00 - 12:30 WIB
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <a href="/dashboard/siswa" className="flex flex-col items-center gap-1 text-orange-400">
            <Utensils className="w-5 h-5" />
            <span className="text-xs">Beranda</span>
          </a>
          <a href="/menu" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs">Menu</span>
          </a>
          <a href="/orders" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
            <span className="text-xs">Pesanan</span>
          </a>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-xs">Keluar</span>
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}
