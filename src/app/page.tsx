import {
  Utensils,
  Clock,
  Wallet,
  ShoppingBag,
  ChefHat,
  CheckCircle,
  Timer,
  ArrowRight,
  Smartphone,
  Users,
  Star,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

// Data menu trending
const trendingMenus = [
  {
    id: 1,
    name: "Nasi Goreng Spesial",
    stand: "Warung Bu Siti",
    price: 15000,
    rating: 4.8,
    image: "/images/nasi-goreng.jpg",
  },
  {
    id: 2,
    name: "Mie Ayam Bakso",
    stand: "Mie Ayam Pak Joko",
    price: 12000,
    rating: 4.9,
    image: "/images/mie-ayam.jpg",
  },
  {
    id: 3,
    name: "Es Teh Manis",
    stand: "Kantin Sejahtera",
    price: 5000,
    rating: 4.7,
    image: "/images/es-teh.jpg",
  },
  {
    id: 4,
    name: "Ayam Geprek",
    stand: "Geprek Mantap",
    price: 18000,
    rating: 4.9,
    image: "/images/ayam-geprek.jpg",
  },
  {
    id: 5,
    name: "Soto Ayam",
    stand: "Soto Mbak Yuni",
    price: 14000,
    rating: 4.6,
    image: "/images/soto-ayam.jpg",
  },
  {
    id: 6,
    name: "Jus Alpukat",
    stand: "Juice Corner",
    price: 10000,
    rating: 4.8,
    image: "/images/jus-alpukat.jpg",
  },
];

// Format harga ke Rupiah
function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default async function Home() {
  // Check if user is authenticated - redirect to their dashboard
  const user = await getSessionUser();
  if (user) {
    switch (user.role) {
      case "SISWA":
        redirect("/dashboard/siswa");
      case "PENJUAL":
        redirect("/dashboard/penjual");
      case "ADMIN":
        redirect("/admin/menu");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                NexusBite
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#menu" className="text-slate-300 hover:text-orange-400 transition-colors">
                Menu
              </a>
              <a href="#fitur" className="text-slate-300 hover:text-orange-400 transition-colors">
                Fitur
              </a>
              <a href="#cara-kerja" className="text-slate-300 hover:text-orange-400 transition-colors">
                Cara Kerja
              </a>
            </div>
            <a
              href="/login"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-orange-500/25"
            >
              Masuk
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 mb-6">
              <ChefHat className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-slate-300">E-Canteen untuk Sekolahmu</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Showcase Your Art,
              </span>
              <br />
              <span className="text-white">Grow Your Bite</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Pesan makanan favoritmu dari kelas, tanpa perlu antre di kantin!
              Nikmati kemudahan pre-order dan ambil pesananmu saat{" "}
              <span className="text-orange-400 font-semibold">Jam Istirahat 1</span> atau{" "}
              <span className="text-orange-400 font-semibold">Jam Istirahat 2</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-2 text-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Mulai Pesan
              </a>
              <a
                href="#cara-kerja"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-full transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                Lihat Cara Kerja
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">500+</div>
                <div className="text-sm text-slate-500">Siswa Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">15+</div>
                <div className="text-sm text-slate-500">Stand Kantin</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">50+</div>
                <div className="text-sm text-slate-500">Menu Tersedia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pickup Time Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Istirahat 1</h3>
                <p className="text-slate-400">09:30 - 10:00 WIB</p>
                <p className="text-sm text-slate-500">Pesan sebelum 09:00</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Istirahat 2</h3>
                <p className="text-slate-400">12:00 - 12:30 WIB</p>
                <p className="text-sm text-slate-500">Pesan sebelum 11:30</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Bites Section */}
      <section id="menu" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400">Paling Diminati</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Trending Bites
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Menu favorit yang paling banyak dipesan oleh teman-temanmu minggu ini
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-xl hover:shadow-orange-500/10 group"
              >
                {/* Image placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-700 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils className="w-16 h-16 text-slate-600 group-hover:text-orange-500/50 transition-colors" />
                  </div>
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium text-white">{menu.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-orange-400 transition-colors">
                    {menu.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {menu.stand}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                      {formatPrice(menu.price)}
                    </span>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-orange-500/25 text-sm flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" />
                      Pesan Sekarang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="/menu"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              Lihat Semua Menu
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Fitur{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Unggulan
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Semua yang kamu butuhkan untuk pengalaman jajan yang lebih praktis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Saldo Virtual */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 text-center hover:border-orange-500/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Saldo Virtual</h3>
              <p className="text-slate-400 leading-relaxed">
                Bayar pesananmu secara cashless! Saldo akunmu akan terpotong otomatis saat checkout.
                Tidak perlu bawa uang tunai lagi.
              </p>
            </div>

            {/* Status Antrean */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 text-center hover:border-orange-500/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Status Antrean</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Pantau status pesananmu secara real-time dari HP. Tahu kapan harus ke kantin!
              </p>
              <div className="flex justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Disiapkan
                </span>
                <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Siap Diambil
                </span>
              </div>
            </div>

            {/* Pre-Order */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 text-center hover:border-orange-500/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pre-Order dari Kelas</h3>
              <p className="text-slate-400 leading-relaxed">
                Pesan dari mana saja! Saat pelajaran berlangsung, cukup buka HP dan pesan.
                Makanan siap saat istirahat tiba.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Cara{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Kerjanya
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Tiga langkah mudah untuk menikmati makanan tanpa antre
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="text-6xl font-bold text-slate-800 absolute -top-4 -left-2">1</div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 pt-8">
                <h3 className="text-lg font-bold text-white mb-2">Pilih Menu</h3>
                <p className="text-slate-400 text-sm">
                  Jelajahi berbagai menu dari stand-stand kantin favoritmu dan tambahkan ke keranjang.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="text-6xl font-bold text-slate-800 absolute -top-4 -left-2">2</div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 pt-8">
                <h3 className="text-lg font-bold text-white mb-2">Bayar & Tunggu</h3>
                <p className="text-slate-400 text-sm">
                  Checkout dengan saldo virtualmu dan pilih waktu pengambilan. Pesanan langsung diproses!
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="text-6xl font-bold text-slate-800 absolute -top-4 -left-2">3</div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 pt-8">
                <h3 className="text-lg font-bold text-white mb-2">Ambil Pesanan</h3>
                <p className="text-slate-400 text-sm">
                  Saat status berubah jadi &quot;Siap Diambil&quot;, langsung ke kantin dan tunjukkan kode pesananmu!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Users className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">500+ siswa sudah bergabung</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Siap Jajan Tanpa Antre?
              </h2>
              <p className="text-white/90 max-w-xl mx-auto mb-8">
                Gabung sekarang dan nikmati kemudahan pre-order makanan dari kelasmu.
                Tidak ada lagi antrean panjang saat istirahat!
              </p>

              <a
                href="/register"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl text-lg"
              >
                <Utensils className="w-5 h-5" />
                Join the Nexus
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                NexusBite
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-orange-400 transition-colors">
                Tentang Kami
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                Bantuan
              </a>
            </div>

            <p className="text-sm text-slate-500">
              © 2026 NexusBite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
