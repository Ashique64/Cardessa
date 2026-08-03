"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Simulate register success
    localStorage.setItem("access_token", "dummy-access");
    localStorage.setItem("refresh_token", "dummy-refresh");
    localStorage.setItem("auth_user", JSON.stringify({ email: formData.email, name: formData.name }));
    router.push("/pricing");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center py-16 px-6 relative overflow-hidden">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-bg-soft/20 rounded-full filter blur-3xl pointer-events-none" />

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
              Create your <span className="italic font-normal">Account</span>
            </h2>
            <p className="text-brand-text-muted text-xs mt-1">Join Cardessa to design your dream invitations.</p>
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

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-serif font-semibold text-brand-dark uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-brand-border/60 rounded-lg py-2.5 px-3.5 bg-brand-bg focus:border-brand-accent focus:ring-1 focus:ring-brand-accent text-brand-dark text-xs focus:outline-none placeholder-brand-text-muted/30 transition-all duration-300 font-sans"
                placeholder="Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-semibold text-brand-dark uppercase tracking-wider mb-1.5">
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
              <label className="block text-xs font-serif font-semibold text-brand-dark uppercase tracking-wider mb-1.5">
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

            <div>
              <label className="block text-xs font-serif font-semibold text-brand-dark uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border border-brand-border/60 rounded-lg py-2.5 px-3.5 bg-brand-bg focus:border-brand-accent focus:ring-1 focus:ring-brand-accent text-brand-dark text-xs focus:outline-none placeholder-brand-text-muted/30 transition-all duration-300 font-sans"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-dark hover:bg-brand-accent hover:text-white text-brand-bg font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 mt-2 shadow-sm"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-xs text-brand-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-accent hover:underline">
              Log in
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
}
