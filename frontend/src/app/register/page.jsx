"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" },
};

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            password1: formData.password,
            password2: formData.confirmPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Map known DRF errors to friendly messages
        const rawMsg = Object.values(data).flat().join(" ").toLowerCase();
        let friendly = "Registration failed. Please check your details and try again.";
        if (rawMsg.includes("already exists") || rawMsg.includes("unique")) {
          friendly = "An account with this email already exists. Try signing in instead.";
        } else if (rawMsg.includes("password") && rawMsg.includes("common")) {
          friendly = "Your password is too common. Please choose a stronger one.";
        } else if (rawMsg.includes("password") && rawMsg.includes("short")) {
          friendly = "Your password is too short. Use at least 8 characters.";
        } else if (rawMsg.includes("password") && rawMsg.includes("numeric")) {
          friendly = "Your password can't be entirely numeric. Mix in some letters.";
        } else if (rawMsg.includes("email") && rawMsg.includes("valid")) {
          friendly = "Please enter a valid email address.";
        }
        setError(friendly);
        setLoading(false);
        return;
      }

      // Store real JWT tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ email: formData.email, name: formData.name })
      );
      router.push("/login");
    } catch {
      setError("Unable to connect to the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex font-sans">

      {/* ── Left Decorative Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-brand-dark relative overflow-hidden p-14 shrink-0">
        {/* Botanical ring ornament */}
        <div className="absolute -top-20 -left-20 w-100 h-100 rounded-full border border-brand-accent/10" />
        <div className="absolute -top-10 -left-10 w-75 h-75 rounded-full border border-brand-accent/8" />
        <div className="absolute -bottom-100 -right-100 w-100 h-100 rounded-full border border-brand-bg-soft/5" />
        <div className="absolute -bottom-50 -right-50 w-75 h-75 rounded-full border border-brand-bg-soft/5" />
        {/* Accent glow */}
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-brand-accent/8 rounded-full filter blur-3xl pointer-events-none" />

        {/* Brand logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2 w-fit">
          <span className="font-serif text-2xl font-bold tracking-widest text-brand-bg">Cardessa</span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent mt-1.5" />
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-8">


          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Begin your journey</p>
            <h2 className="font-serif text-3xl font-light text-brand-bg leading-relaxed tracking-wide">
              Craft invitations that feel as{" "}
              <span className="italic text-brand-accent">extraordinary</span>
              {" "}as your love story.
            </h2>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {[
              "Animated luxury invitation pages",
              "Cinematic royal video openings",
              "Google Maps & multi-language support",
              "Unlimited edits until your event date",
            ].map((feat) => (
              <li key={feat} className="flex items-start gap-3">
                <div className="mt-0.5 h-4 w-4 rounded-full border border-brand-accent/40 bg-brand-accent/10 flex items-center justify-center shrink-0">
                  <svg className="h-2 w-2 text-brand-accent" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                  </svg>
                </div>
                <span className="text-xs text-brand-bg/60 leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-[10px] text-brand-bg/25 uppercase tracking-widest">
          © {new Date().getFullYear()} Cardessa · Premium Digital Invitations
        </p>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden">
        {/* Subtle bg texture circles */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-accent/4 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-bg-soft/40 rounded-full filter blur-3xl pointer-events-none" />

        <motion.div
          {...fadeUp}
          className="w-full max-w-105 relative z-10"
        >
          {/* Mobile brand logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <span className="font-serif text-2xl font-bold tracking-widest text-brand-dark">Cardessa</span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent mt-1" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-3">Join Cardessa</p>
            <h1 className="font-serif text-4xl font-light text-brand-dark tracking-tight leading-tight">
              Create your<br />
              <span className="italic font-normal">free account</span>
            </h1>
            <p className="text-brand-text-muted text-sm mt-3 leading-relaxed">
              Start designing your dream wedding invitations today.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-50/80 border border-red-200/50 px-4 py-3.5 rounded-xl mb-6"
            >
              <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/70">
                Full Name
              </label>
              <input
                type="text"
                suppressHydrationWarning
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rahul Sharma"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-dark placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15 transition-all duration-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/70">
                Email Address
              </label>
              <input
                type="email"
                suppressHydrationWarning
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-dark placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15 transition-all duration-300"
              />
            </div>

            {/* Two-column password row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/70">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    suppressHydrationWarning
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 pr-10 text-sm text-brand-dark placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted/50 hover:text-brand-accent transition-colors duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/70">
                  Confirm
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    suppressHydrationWarning
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 pr-10 text-sm text-brand-dark placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted/50 hover:text-brand-accent transition-colors duration-200"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-4 px-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : "Create Account"}
            </button>
          </form>

          {/* Terms note */}
          <p className="text-[10px] text-brand-text-muted/60 text-center mt-4 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-brand-accent transition-colors">Terms</Link>{" "}
            &{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-brand-accent transition-colors">Privacy Policy</Link>.
          </p>

          {/* Sign in link */}
          <p className="text-center text-xs text-brand-text-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-dark hover:text-brand-accent transition-colors underline underline-offset-2">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
