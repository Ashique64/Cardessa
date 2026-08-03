"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill out all fields.");
      return;
    }
    // Simulate login success
    localStorage.setItem("access_token", "dummy-access");
    localStorage.setItem("refresh_token", "dummy-refresh");
    localStorage.setItem("auth_user", JSON.stringify({ email: formData.email, name: "User" }));
    router.push("/dashboard");
  };

  const handleGoogleLogin = () => {
    alert("Trigger Google Sign-In pop-up.");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center py-16 px-6 relative overflow-hidden">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-bg-soft/20 rounded-full filter blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full border border-brand-border/40 p-1.5 rounded-3xl bg-brand-bg"
      >
        <div className="bg-brand-bg border border-brand-border/40 rounded-2xl p-8 md:p-10 shadow-xs relative">
          
          {/* Logo / Brand Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 justify-center mb-6">
              <span className="font-serif text-3xl font-extrabold tracking-wider text-brand-dark hover:text-brand-accent transition-colors duration-300">
                Cardessa
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent mt-2"></span>
            </Link>
            
            <h2 className="text-2xl font-serif font-light text-brand-dark tracking-tight">
              Welcome <span className="italic font-normal">Back</span>
            </h2>
            <p className="text-brand-text-muted text-xs mt-1">Log in to manage your digital invitations.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50/80 border border-red-200/50 text-red-700 text-xs font-medium p-3 rounded-lg mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            <div>
              <label className="block text-xs font-serif font-semibold text-brand-dark uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-brand-border/60 rounded-lg py-2.5 px-3.5 bg-brand-bg focus:border-brand-accent focus:ring-1 focus:ring-brand-accent text-brand-dark text-xs focus:outline-none placeholder-brand-text-muted/30 transition-all duration-300 font-sans"
                placeholder="name@example.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-serif font-semibold text-brand-dark uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-brand-border/60 rounded-lg py-2.5 px-3.5 bg-brand-bg focus:border-brand-accent focus:ring-1 focus:ring-brand-accent text-brand-dark text-xs focus:outline-none placeholder-brand-text-muted/30 transition-all duration-300 font-sans"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-dark hover:bg-brand-accent hover:text-white text-brand-bg font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 shadow-sm"
            >
              Log In
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border/40" />
            </div>
            <span className="relative px-3 bg-brand-bg text-[10px] uppercase font-bold tracking-widest text-brand-text-muted/50">
              Or connect
            </span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-brand-bg-soft border border-brand-border/60 text-brand-dark hover:bg-brand-accent hover:border-brand-accent hover:text-white font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 mb-6"
          >
            <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.44-2.885-6.44-6.44 0-3.555 2.885-6.44 6.44-6.44 1.545 0 2.955.545 4.077 1.455l3.15-3.15C19.125 2.13 15.93 1 12 1 5.373 1 0 6.373 0 13s5.373 12 12 12c6.26 0 11.5-4.5 11.5-11.5 0-.75-.1-1.3-.26-1.715h-11z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-brand-text-muted">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-brand-accent hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
}
