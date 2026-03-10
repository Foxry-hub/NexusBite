"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Utensils,
  Users,
  Wallet,
  BarChart3,
  LogOut,
  ChefHat,
  Shield,
  ArrowDownCircle,
  Tags,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminSidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const navLinks = [
  { href: "/admin/categories", label: "Kategori", icon: Tags },
  { href: "/admin/menu", label: "Menu", icon: Utensils },
  { href: "/admin/users", label: "List Pengguna", icon: Users },
  { href: "/admin/balance", label: "Top-Up Saldo", icon: Wallet },
  { href: "/admin/withdrawals", label: "Penarikan Saldo", icon: ArrowDownCircle },
  { href: "/admin/reports", label: "Laporan", icon: BarChart3 },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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

  const isActive = (href: string) => pathname.startsWith(href);

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user.name}</p>
              <p className="text-neutral-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-2 rounded-lg text-xs font-medium">
            <Shield className="w-4 h-4" />
            Administrator
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-3 px-3">
          Menu Admin
        </p>
        <div className="space-y-1">
          {navLinks.map((link, index) => {
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

      {/* Theme Toggle & Logout */}
      <div className="p-4 border-t border-neutral-800 space-y-3">
        <div className="flex items-center justify-between px-3">
          <span className="text-neutral-400 text-sm">Mode Gelap</span>
          <ThemeToggle />
        </div>
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
