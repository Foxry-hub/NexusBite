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
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
        alert(data.message);
        setIsLogin(true); // Switch to login mode
        setPassword(""); // Clear password
        return;
      }

      // Redirect based on role from API response
      router.push(data.redirectUrl || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              NexusBite
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1 sm:mb-2">
              {isLogin ? "Selamat Datang Kembali!" : "Buat Akun Baru"}
            </h1>
            <p className="text-slate-400 text-center text-sm sm:text-base mb-5 sm:mb-6">
              {isLogin
                ? "Masuk untuk melanjutkan"
                : "Daftar untuk mulai pesan makanan"}
            </p>

            {/* Toggle Buttons */}
            <div className="flex bg-slate-800/50 rounded-xl p-1 mb-5 sm:mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  isLogin
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  !isLogin
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Daftar
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (only for register) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
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
                  className={`p-3 rounded-xl border transition-all ${
                    isStudentEmail
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-slate-800/30 border-slate-700/30"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isStudentEmail ? (
                      <GraduationCap className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-sm">
                      {isStudentEmail ? (
                        <>
                          <p className="text-emerald-400 font-medium">
                            Email Siswa Terdeteksi!
                          </p>
                          <p className="text-slate-400 mt-0.5">
                            Kamu akan terdaftar sebagai{" "}
                            <span className="text-emerald-400 font-medium">
                              Siswa
                            </span>{" "}
                            dan dapat langsung memesan makanan.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-300 font-medium">
                            Tips Pendaftaran
                          </p>
                          <p className="text-slate-400 mt-0.5">
                            Gunakan email{" "}
                            <span className="text-orange-400">
                              @smkn40-jkt.sch.id
                            </span>{" "}
                            untuk akses fitur siswa. Email lainnya akan mendaftar sebagai
                            {" "}<span className="text-amber-400">Penjual</span> (perlu persetujuan admin).
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
                className="w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base active:scale-[0.98]"
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
            </form>
          </div>

          {/* Back to home link */}
          <div className="mt-5 sm:mt-6 text-center">
            <a
              href="/"
              className="text-slate-400 hover:text-orange-400 text-sm transition-colors inline-flex items-center gap-1"
            >
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-slate-500 text-xs sm:text-sm">
          © 2026 NexusBite. E-Canteen SMKN 40 Jakarta
        </p>
      </div>
    </div>
  );
}
