"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";

/**
 * AuthContext — manages JWT access/refresh tokens and current user.
 *
 * Tokens are stored in localStorage:
 *   access_token  — short-lived (30 min), sent as Bearer in every API request
 *   refresh_token — long-lived (7 days), used to silently get a new access token
 *   auth_user     — user object { id, email, name }
 *
 * The axios interceptor in api.js automatically refreshes the access token on 401,
 * so you rarely need to call refreshToken manually.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  /** Email + password login */
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * Google OAuth login.
   * Call this after the user completes the Google sign-in popup/redirect
   * and you have their Google access token.
   *
   * @param {string} googleAccessToken - Token from Google OAuth flow
   */
  const loginWithGoogle = async (googleAccessToken) => {
    const res = await authApi.googleLogin(googleAccessToken);
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
  };

  /** Logout — clears tokens and user from memory + localStorage */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Silently ignore logout errors (token may already be invalid)
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
