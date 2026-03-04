import { create } from "zustand";

export type UserRole = "SISWA" | "PENJUAL" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateBalance: (newBalance: number) => void;
  deductBalance: (amount: number) => boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  updateBalance: (newBalance) =>
    set((state) => ({
      user: state.user ? { ...state.user, balance: newBalance } : null,
    })),

  deductBalance: (amount) => {
    const { user } = get();
    if (!user || user.balance < amount) {
      return false;
    }
    set({ user: { ...user, balance: user.balance - amount } });
    return true;
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
}));
