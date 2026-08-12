import { create } from "zustand";
import { authApi } from "@/lib/api";

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  initializeAuth: () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        try {
          set({ user: JSON.parse(storedUser) });
        } catch {
          // ignore parsing error
        }
      }
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access, refresh, user: userData } = res.data;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("auth_user", JSON.stringify(userData));
    }
    set({ user: userData });
  },

  loginWithGoogle: async (googleAccessToken) => {
    const res = await authApi.googleLogin(googleAccessToken);
    const { access, refresh, user: userData } = res.data;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("auth_user", JSON.stringify(userData));
    }
    set({ user: userData });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Silently ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");
    }
    set({ user: null });
  },
}));
