"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Camera,
  Save,
  Calendar,
  GraduationCap,
  BookOpen,
  IdCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useUserStore } from "@/store/useUserStore";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
  profilePhoto: string | null;
  kelas: string | null;
  jurusan: string | null;
  tanggalLahir: string | null;
  nis: string | null;
}

export default function ProfileClient({ 
  initialUser 
}: { 
  initialUser: { id: string; name: string; email: string; role: string; balance: number } 
}) {
  const router = useRouter();
  const { setUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [nis, setNis] = useState("");

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        setProfile(data.user);
        setName(data.user.name || "");
        setProfilePhoto(data.user.profilePhoto || null);
        setKelas(data.user.kelas || "");
        setJurusan(data.user.jurusan || "");
        setTanggalLahir(
          data.user.tanggalLahir 
            ? new Date(data.user.tanggalLahir).toISOString().split("T")[0] 
            : ""
        );
        setNis(data.user.nis || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto maksimal 2MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          profilePhoto,
          kelas: kelas || null,
          jurusan: jurusan || null,
          tanggalLahir: tanggalLahir || null,
          nis: nis || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data.user);
      setUser({ ...initialUser, name: data.user.name } as any);
      setSuccess("Profile berhasil diperbarui!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // List of jurusan options
  const jurusanOptions = [
    "RPL",
    "MP",
    "BR",
    "AK",
    "DKV 1",
    "DKV 2",
  ];

  // List of kelas options
  const kelasOptions = [
    "X", "XI", "XII"
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Sidebar 
        user={{ 
          name: profile?.name || initialUser.name, 
          email: profile?.email || initialUser.email, 
          role: initialUser.role,
          balance: profile?.balance || initialUser.balance,
        }} 
        role="SISWA" 
      />

      <main className="pl-64 min-h-screen">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <h1 className="text-3xl font-bold mb-2">Profile Saya</h1>
            <p className="text-neutral-400">
              Kelola informasi profile Anda
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              {success}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Photo Section */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-orange-400" />
                  Foto Profile
                </h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-orange-500/30"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-3xl font-bold border-4 border-orange-500/30">
                        {getInitials(name || initialUser.name)}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-400 text-sm mb-2">
                      Upload foto profile Anda. Format yang didukung: JPG, PNG, GIF. Maksimal 2MB.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                    >
                      Pilih Foto
                    </button>
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setProfilePhoto(null)}
                        className="ml-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-400" />
                  Informasi Pribadi
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      className="w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700 rounded-xl text-neutral-500 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-neutral-500 mt-1">Email tidak dapat diubah</p>
                  </div>

                  {/* NIS */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      <IdCard className="w-4 h-4 inline mr-2" />
                      NIS (Nomor Induk Siswa)
                    </label>
                    <input
                      type="text"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                      placeholder="Contoh: 12345678"
                      maxLength={20}
                    />
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-400" />
                  Informasi Akademik
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Kelas */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Kelas
                    </label>
                    <input
                      type="text"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                      placeholder="Contoh: XII RPL 1"
                    />
                  </div>

                  {/* Jurusan */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      <GraduationCap className="w-4 h-4 inline mr-2" />
                      Jurusan
                    </label>
                    <select
                      value={jurusan}
                      onChange={(e) => setJurusan(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusanOptions.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
