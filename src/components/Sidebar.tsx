"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Clock,
  Utensils,
  Package,
  Settings,
  Users,
  Wallet,
  BarChart3,
  LogOut,
  ChefHat,
  Store,
  UserCircle,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    balance?: number;
    profilePhoto?: string | null;
  };
  role: "SISWA" | "PENJUAL" | "ADMIN";
}

const roleConfigs = {
  SISWA: {
    subtitle: "Siswa SMKN 40 Jakarta",
    links: [
      { href: "/dashboard/siswa", label: "Beranda", icon: Home },
      { href: "/dashboard/siswa/orders", label: "Pesanan Saya", icon: ShoppingBag },
      { href: "/dashboard/siswa/profile", label: "Profile Saya", icon: UserCircle },
    ],
  },
  PENJUAL: {
    subtitle: "Penjual NexusBite",
    links: [
      { href: "/dashboard/penjual", label: "Beranda", icon: Home },
      { href: "/dashboard/penjual/menu", label: "Kelola Menu", icon: Utensils },
    ],
  },
  ADMIN: {
    subtitle: "Administrator",
    links: [
      { href: "/admin/menu", label: "Menu", icon: Utensils },
      { href: "/admin/users", label: "Verifikasi Penjual", icon: Users },
      { href: "/admin/balance", label: "Top-Up Saldo", icon: Wallet },
      { href: "/admin/reports", label: "Laporan", icon: BarChart3 },
    ],
  },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function Sidebar({ user, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const config = roleConfigs[role];

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", redirect: "manual" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/siswa" || href === "/dashboard/penjual") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-neutral-900/50 border-r border-neutral-800 flex flex-col z-40 animate-fade-in-left">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Nexus<span className="text-orange-500">Bite</span>
            </h1>
            <p className="text-xs text-neutral-500">E-Kantin SMKN 40</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-neutral-800">
        <div className="bg-neutral-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            {user.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/50"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user.name}</p>
              <p className="text-neutral-500 text-xs truncate">{config.subtitle}</p>
            </div>
          </div>
          {(role === "SISWA" || role === "PENJUAL") && user.balance !== undefined && (
            <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg p-3 border border-orange-500/20">
              <p className="text-orange-400/80 text-xs mb-1">
                {role === "SISWA" ? "Saldo Anda" : "Saldo Penjualan"}
              </p>
              <p className="text-orange-400 font-bold">{formatPrice(user.balance)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-3 px-3">
          Menu
        </p>
        <div className="space-y-1">
          {config.links.map((link, index) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className={`w-5 h-5 ${active ? "text-orange-400" : ""}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Break Times Info - Only for Siswa */}
      {role === "SISWA" && (
        <div className="p-4 border-t border-neutral-800">
          <div className="bg-neutral-800/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <p className="text-white text-xs font-medium">Jam Istirahat</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-neutral-900/50 rounded-lg p-2 text-center">
                <p className="text-neutral-500">Break 1</p>
                <p className="text-white font-medium">09:30</p>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-2 text-center">
                <p className="text-neutral-500">Break 2</p>
                <p className="text-white font-medium">12:00</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
