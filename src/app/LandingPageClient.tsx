"use client";

import { useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Coffee,
  Pizza,
  Sandwich,
  IceCream,
  Soup,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

// Smooth scroll handler with offset for fixed navbar
function smoothScrollTo(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    const navbarHeight = 80; // Height of fixed navbar
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}

// Data menu trending
const trendingMenus = [
  { id: 1, name: "Nasi Goreng Spesial", stand: "Warung Bu Siti", price: 15000, rating: 4.8, emoji: "🍛" },
  { id: 2, name: "Mie Ayam Bakso", stand: "Mie Ayam Pak Joko", price: 12000, rating: 4.9, emoji: "🍜" },
  { id: 3, name: "Es Teh Manis", stand: "Kantin Sejahtera", price: 5000, rating: 4.7, emoji: "🧊" },
  { id: 4, name: "Ayam Geprek", stand: "Geprek Mantap", price: 18000, rating: 4.9, emoji: "🍗" },
  { id: 5, name: "Soto Ayam", stand: "Soto Mbak Yuni", price: 14000, rating: 4.6, emoji: "🥣" },
  { id: 6, name: "Jus Alpukat", stand: "Juice Corner", price: 10000, rating: 4.8, emoji: "🥤" },
  { id: 7, name: "Bakso Urat", stand: "Bakso Pak Kumis", price: 15000, rating: 4.7, emoji: "🍢" },
  { id: 8, name: "Seblak Pedas", stand: "Seblak Mbak Rina", price: 12000, rating: 4.8, emoji: "🌶️" },
];

// Format harga ke Rupiah
function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

// Floating Food Icons Component
function FloatingFoods() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">🍔</div>
      <div className="absolute top-40 right-20 text-5xl animate-float-delay-1 opacity-20">🍕</div>
      <div className="absolute bottom-40 left-20 text-4xl animate-float-delay-2 opacity-20">🍜</div>
      <div className="absolute top-60 left-1/4 text-3xl animate-float opacity-20">🧁</div>
      <div className="absolute bottom-20 right-1/4 text-4xl animate-float-delay-1 opacity-20">🍦</div>
      <div className="absolute top-32 right-1/3 text-3xl animate-float-delay-2 opacity-20">🥤</div>
    </div>
  );
}

// Carousel Component
function MenuCarousel() {
  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--background)] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--background)] to-transparent z-10" />
      
      {/* Scrolling container */}
      <div className="flex animate-scroll">
        {/* First set of items */}
        {[...trendingMenus, ...trendingMenus].map((menu, index) => (
          <div
            key={`${menu.id}-${index}`}
            className="flex-shrink-0 w-72 mx-3 bg-[var(--card)] backdrop-blur-sm border border-[var(--border)] rounded-2xl p-5 hover:border-orange-500/50 transition-all hover:scale-105 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {menu.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--foreground)] truncate group-hover:text-orange-500 transition-colors">
                  {menu.name}
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] truncate">{menu.stand}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-amber-400">{menu.rating}</span>
                  <span className="text-orange-500 font-bold ml-auto">{formatPrice(menu.price)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Counter Component with animation
function AnimatedStat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center group">
      <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
        {count}{suffix}
      </div>
      <div className="text-sm text-[var(--foreground-secondary)] mt-1">{label}</div>
    </div>
  );
}

// Hero Graphic Component
function HeroGraphic() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Animated blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-amber-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob-delay-2" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob-delay-4" />
      
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)] backdrop-blur-xl rounded-3xl border border-[var(--border)] p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center animate-pulse-glow">
            <Utensils className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--foreground)] text-lg">NexusBite</h3>
            <p className="text-[var(--foreground-secondary)] text-sm">E-Canteen Digital</p>
          </div>
        </div>
        
        {/* Feature list */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <span className="text-[var(--foreground)] text-sm">Pesan dari mana saja</span>
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-[var(--foreground)] text-sm">Pre-order sebelum istirahat</span>
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <Wallet className="w-5 h-5 text-green-500" />
            <span className="text-[var(--foreground)] text-sm">Bayar dengan saldo digital</span>
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>

        {/* Order preview */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--foreground-secondary)] text-sm">Pesanan Aktif</span>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Siap Diambil
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl flex items-center justify-center text-2xl">
              🍜
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--foreground)]">Mie Ayam Bakso</p>
              <p className="text-sm text-orange-500 font-bold">Rp 12.000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -bottom-4 -left-8 bg-[var(--card)] backdrop-blur rounded-2xl shadow-xl p-4 border border-[var(--border)] animate-float">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">
            🍛
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)] text-sm">Nasi Goreng</p>
            <p className="text-orange-500 font-bold text-sm">Rp 15.000</p>
          </div>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 bg-[var(--card)] backdrop-blur rounded-2xl shadow-xl p-3 border border-[var(--border)] animate-float-delay-1">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="font-bold text-[var(--foreground)]">4.9</span>
          <span className="text-[var(--foreground-secondary)] text-sm">Rating</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPageClient() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
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
              <button 
                onClick={() => smoothScrollTo("menu")} 
                className="text-[var(--foreground-secondary)] hover:text-orange-400 transition-colors"
              >
                Menu
              </button>
              <button 
                onClick={() => smoothScrollTo("fitur")} 
                className="text-[var(--foreground-secondary)] hover:text-orange-400 transition-colors"
              >
                Fitur
              </button>
              <button 
                onClick={() => smoothScrollTo("cara-kerja")} 
                className="text-[var(--foreground-secondary)] hover:text-orange-400 transition-colors"
              >
                Cara Kerja
              </button>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <a
                href="/login"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-orange-500/25"
              >
                Masuk
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <FloatingFoods />
        
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-blob-delay-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-orange-500/5 to-transparent rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 mb-6 animate-fade-in-up">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-[var(--foreground-secondary)]">E-Canteen untuk Sekolahmu</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up animation-delay-100">
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent animate-gradient">
                  Pesan Makanan,
                </span>
                <br />
                <span className="text-[var(--foreground)]">Tanpa Antre!</span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--foreground-secondary)] mb-8 max-w-xl leading-relaxed animate-fade-in-up animation-delay-200">
                Pesan makanan favoritmu dari kelas, tanpa perlu antre di kantin!
                Nikmati kemudahan pre-order dan ambil pesananmu saat{" "}
                <span className="text-orange-400 font-semibold">istirahat</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up animation-delay-300">
                <a
                  href="/login"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-2 text-lg group"
                >
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Mulai Pesan
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <button
                  onClick={() => smoothScrollTo("cara-kerja")}
                  className="w-full sm:w-auto bg-[var(--card)] hover:bg-[var(--card-hover)] text-[var(--foreground)] font-semibold px-8 py-4 rounded-full transition-all border border-[var(--border)] flex items-center justify-center gap-2"
                >
                  Lihat Cara Kerja
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 animate-fade-in-up animation-delay-400">
                <AnimatedStat value={500} suffix="+" label="Siswa Aktif" />
                <AnimatedStat value={15} suffix="+" label="Stand Kantin" />
                <AnimatedStat value={50} suffix="+" label="Menu Tersedia" />
              </div>
            </div>

            {/* Right content - Hero Graphic */}
            <div className="hidden lg:block animate-fade-in-right animation-delay-200">
              <HeroGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* Menu Carousel Section */}
      <section id="menu" className="py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="text-sm text-orange-400 font-medium">Menu Terlaris</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Trending Bites
              </span>
            </h2>
            <p className="text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Menu favorit yang paling banyak dipesan oleh teman-temanmu
            </p>
          </div>
        </div>
        <MenuCarousel />
      </section>

      {/* Pickup Time Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)] border border-[var(--border)] rounded-2xl p-6 flex items-center gap-4 hover:border-orange-500/50 transition-all group">
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--foreground)]">Istirahat 1</h3>
                <p className="text-[var(--foreground-secondary)]">09:30 - 10:00 WIB</p>
                <p className="text-sm text-[var(--foreground-secondary)]">Pesan sebelum 09:00</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)] border border-[var(--border)] rounded-2xl p-6 flex items-center gap-4 hover:border-amber-500/50 transition-all group">
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--foreground)]">Istirahat 2</h3>
                <p className="text-[var(--foreground-secondary)]">12:00 - 12:30 WIB</p>
                <p className="text-sm text-[var(--foreground-secondary)]">Pesan sebelum 11:30</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Fitur{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Unggulan
              </span>
            </h2>
            <p className="text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Semua yang kamu butuhkan untuk pengalaman jajan yang lebih praktis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Saldo Virtual */}
            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)] border border-[var(--border)] rounded-2xl p-8 text-center hover:border-orange-500/50 transition-all group hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-pulse-glow">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Saldo Virtual</h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Bayar pesananmu secara cashless! Saldo akunmu akan terpotong otomatis saat checkout.
              </p>
            </div>

            {/* Status Antrean */}
            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)] border border-[var(--border)] rounded-2xl p-8 text-center hover:border-orange-500/50 transition-all group hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-pulse-glow">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Status Real-time</h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Pantau status pesananmu secara real-time dari HP. Tahu kapan harus ke kantin!
              </p>
              <div className="flex justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Disiapkan
                </span>
                <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Siap
                </span>
              </div>
            </div>

            {/* Pre-Order */}
            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)] border border-[var(--border)] rounded-2xl p-8 text-center hover:border-orange-500/50 transition-all group hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-pulse-glow">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Pre-Order</h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Pesan dari mana saja! Saat pelajaran berlangsung, cukup buka HP dan pesan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Cara{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Kerjanya
              </span>
            </h2>
            <p className="text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Tiga langkah mudah untuk menikmati makanan tanpa antre
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Pilih Menu", desc: "Jelajahi berbagai menu dari stand-stand kantin favoritmu dan tambahkan ke keranjang." },
              { num: "2", title: "Bayar & Tunggu", desc: "Checkout dengan saldo virtualmu dan pilih waktu pengambilan. Pesanan langsung diproses!" },
              { num: "3", title: "Ambil Pesanan", desc: "Saat status berubah jadi 'Siap Diambil', langsung ke kantin dan tunjukkan kode pesananmu!" },
            ].map((step, index) => (
              <div key={step.num} className="relative group">
                <div 
                  className="text-7xl font-bold text-[var(--border)] absolute -top-6 -left-2 z-0 transition-all duration-500 ease-out group-hover:text-orange-500/30 group-hover:scale-110"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {step.num}
                </div>
                <div className="relative z-10 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 pt-10 transition-all group-hover:border-orange-500/50 hover-lift">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{step.title}</h3>
                  <p className="text-[var(--foreground-secondary)] text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

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
              </p>

              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl text-lg group"
              >
                <Utensils className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Join the Nexus
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
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

            <div className="flex items-center gap-6 text-sm text-[var(--foreground-secondary)]">
              <a href="#" className="hover:text-orange-400 transition-colors">Tentang</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Privasi</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Bantuan</a>
            </div>

            <p className="text-sm text-[var(--foreground-secondary)]">
              © 2026 NexusBite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
