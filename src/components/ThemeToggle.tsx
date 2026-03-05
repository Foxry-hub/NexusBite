"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full p-1 transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500/50 overflow-hidden group"
      style={{
        background: theme === "dark" 
          ? "linear-gradient(to right, #1e293b, #334155)" 
          : "linear-gradient(to right, #fcd34d, #f97316)",
      }}
      aria-label="Toggle theme"
    >
      {/* Stars/Clouds background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars for dark mode */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            theme === "dark" ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Fixed star positions to avoid hydration mismatch */}
          <span className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: "20%", left: "15%", opacity: 0.8 }} />
          <span className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: "60%", left: "25%", opacity: 0.6, animationDelay: "0.2s" }} />
          <span className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: "35%", left: "55%", opacity: 0.9, animationDelay: "0.4s" }} />
          <span className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: "75%", left: "70%", opacity: 0.7, animationDelay: "0.6s" }} />
          <span className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: "45%", left: "85%", opacity: 0.8, animationDelay: "0.8s" }} />
          <span className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: "15%", left: "75%", opacity: 0.6, animationDelay: "1s" }} />
        </div>
        {/* Clouds for light mode */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            theme === "light" ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="absolute w-3 h-2 bg-white/40 rounded-full top-1 left-2" />
          <span className="absolute w-4 h-2 bg-white/30 rounded-full top-2 right-6" />
          <span className="absolute w-2 h-1.5 bg-white/50 rounded-full bottom-1.5 left-4" />
        </div>
      </div>

      {/* Toggle knob */}
      <div
        className={`relative w-6 h-6 rounded-full shadow-lg transition-all duration-500 ease-out transform flex items-center justify-center ${
          theme === "dark" 
            ? "translate-x-0 bg-slate-800 rotate-0" 
            : "translate-x-6 bg-yellow-100 rotate-180"
        }`}
      >
        {/* Moon icon */}
        <Moon
          className={`absolute w-4 h-4 text-yellow-300 transition-all duration-300 ${
            theme === "dark" ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
        />
        {/* Sun icon */}
        <Sun
          className={`absolute w-4 h-4 text-orange-500 transition-all duration-300 ${
            theme === "light" ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
        />
      </div>

      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
          theme === "light" ? "opacity-100" : "opacity-0"
        }`}
        style={{
          boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)",
        }}
      />
    </button>
  );
}
