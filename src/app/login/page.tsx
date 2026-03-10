"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  Info,
  Shield,
  Store,
  Zap,
  ShoppingBag,
  Clock,
  Wallet,
} from "lucide-react";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Check if email is student email
  const isStudentEmail = email.toLowerCase().includes("@smkn40-jkt.sch.id");

  // Quick login credentials for development
  const quickLoginAccounts = {
    admin: { email: "admin@nexusbite.com", password: "admin123" },
    siswa: { email: "budi@smkn40-jkt.sch.id", password: "siswa123" },
    penjual: { email: "joko.penjual@gmail.com", password: "penjual123" },
  };

  const handleQuickLogin = async (role: "admin" | "siswa" | "penjual") => {
    const account = quickLoginAccounts[role];
    setIsLoading(true);
    setError("");
    setIsLogin(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: account.email, password: account.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }

      router.push(data.redirectUrl || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { name, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }

      // Handle pending approval for PENJUAL
      if (data.pendingApproval) {
        setError("");
        showToast(data.message, "info", 6000);
        setIsLogin(true);
        setPassword("");
        return;
      }

      router.push(data.redirectUrl || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header with Logo */}
        <div className="p-6 lg:p-8">
          <a href="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              NexusBite
            </span>
          </a>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 pb-8">
          <div className="w-full max-w-md">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              {isLogin ? "Selamat Datang!" : "Buat Akun Baru"}
            </h1>
            <p className="text-neutral-400 mb-8">
              {isLogin
                ? "Masuk dengan mengisi informasi di bawah"
                : "Daftar untuk mulai pesan makanan"}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field (only for register) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-neutral-700">
                      <User className="w-5 h-5 text-neutral-500" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full pl-14 pr-4 py-3.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-neutral-700">
                    <User className="w-5 h-5 text-neutral-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-14 pr-4 py-3.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-neutral-700">
                    <Lock className="w-5 h-5 text-neutral-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-12 py-3.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Student Email Info (only for register) */}
              {!isLogin && (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isStudentEmail
                      ? "bg-orange-500/10 border-orange-500/30"
                      : "bg-neutral-900 border-neutral-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isStudentEmail ? (
                      <GraduationCap className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Info className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-sm">
                      {isStudentEmail ? (
                        <>
                          <p className="text-orange-400 font-medium">
                            Email Siswa Terdeteksi!
                          </p>
                          <p className="text-neutral-400 mt-1">
                            Kamu akan terdaftar sebagai{" "}
                            <span className="text-orange-400 font-medium">Siswa</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-neutral-300 font-medium">Tips Pendaftaran</p>
                          <p className="text-neutral-400 mt-1">
                            Gunakan email{" "}
                            <span className="text-orange-400">@smkn40-jkt.sch.id</span>{" "}
                            untuk akses fitur siswa
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isLogin ? "Memproses..." : "Mendaftar..."}</span>
                  </>
                ) : (
                  <span>{isLogin ? "Masuk" : "Daftar Sekarang"}</span>
                )}
              </button>

              {/* Toggle */}
              <p className="text-center text-neutral-400">
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  {isLogin ? "Daftar" : "Masuk"}
                </button>
              </p>
            </form>

            {/* Quick Login - Dev Mode */}
            {isLogin && (
              <div className="mt-8 pt-6 border-t border-neutral-800">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-neutral-400">
                    Quick Login (Dev)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin")}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-2 p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/50 rounded-xl transition-all disabled:opacity-50 group"
                  >
                    <Shield className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-red-400">Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("siswa")}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-2 p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500/50 rounded-xl transition-all disabled:opacity-50 group"
                  >
                    <GraduationCap className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-orange-400">Siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("penjual")}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-2 p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 rounded-xl transition-all disabled:opacity-50 group"
                  >
                    <Store className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-amber-400">Penjual</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center lg:text-left">
          <p className="text-neutral-500 text-sm">
            © 2026 NexusBite. E-Canteen SMKN 40 Jakarta
          </p>
        </div>
      </div>

      {/* Right Side - Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          {/* Floating Cards */}
          <div className="relative w-full max-w-md">
            {/* Main Card */}
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                  <Utensils className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-lg">NexusBite</h3>
                  <p className="text-neutral-500 text-sm">E-Canteen Digital</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  <span className="text-neutral-700 text-sm">Pesan dari mana saja</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="text-neutral-700 text-sm">Pre-order sebelum istirahat</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <Wallet className="w-5 h-5 text-green-500" />
                  <span className="text-neutral-700 text-sm">Bayar dengan saldo digital</span>
                </div>
              </div>
            </div>

            {/* Secondary Card */}
            <div className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-5 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🍜</span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">Mie Ayam Bakso</p>
                  <p className="text-orange-500 font-bold">Rp 12.000</p>
                </div>
              </div>
            </div>

            {/* Third Card */}
            <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4 transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🍛</span>
                </div>
                <div>
                  <p className="font-medium text-neutral-800 text-sm">Nasi Goreng</p>
                  <p className="text-orange-500 font-semibold text-sm">Rp 15.000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              Jajan Lebih Praktis
            </h2>
            <p className="text-white/80 max-w-sm">
              Pesan makanan favoritmu dari kelas, tanpa perlu antre di kantin!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
