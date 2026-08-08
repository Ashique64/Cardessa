"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Use AuthContext.login() — this calls the API AND calls setUser()
      // so the Navbar immediately reflects the logged-in state
      await login(formData.email, formData.password);
      router.push("/");
    } catch (err) {
      const rawMsg = err?.response?.data
        ? Object.values(err.response.data).flat().join(" ").toLowerCase()
        : (err?.message || "").toLowerCase();

      let friendly = "Something went wrong. Please try again.";
      if (rawMsg.includes("credentials") || rawMsg.includes("password") || rawMsg.includes("email")) {
        friendly = "Incorrect email or password. Please double-check and try again.";
      } else if (rawMsg.includes("not found") || rawMsg.includes("no active account")) {
        friendly = "No account found with this email. Create one below.";
      } else if (rawMsg.includes("inactive")) {
        friendly = "This account has been deactivated. Please contact support.";
      } else if (rawMsg.includes("network") || rawMsg.includes("connect")) {
        friendly = "Unable to connect to the server. Please try again.";
      }
      setError(friendly);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Trigger Google Sign-In pop-up.");
    router.push("/dashboard");
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

        {/* Center Testimonial */}
        <div className="relative z-10 space-y-8">
          {/* Decorative monogram */}

          <blockquote className="space-y-4">
            <p className="font-serif text-2xl font-light text-brand-bg leading-relaxed tracking-wide">
              "Cardessa turned our wedding invitation into a{" "}
              <span className="italic text-brand-accent">living experience</span> our guests still talk about."
            </p>
            <footer className="space-y-0.5">
              <p className="text-xs font-bold tracking-widest uppercase text-brand-bg/70">Priya & Arjun</p>
              <p className="text-[10px] text-brand-bg/40 tracking-wider uppercase">Royal Collection · Chennai</p>
            </footer>
          </blockquote>

          {/* Stats row */}
          <div className="flex gap-8 pt-4 border-t border-brand-bg/10">
            {[["2,400+", "Couples"], ["98%", "Satisfaction"], ["12+", "Designs"]].map(([num, label]) => (
              <div key={label}>
                <p className="font-serif text-xl font-semibold text-brand-bg">{num}</p>
                <p className="text-[10px] text-brand-bg/40 uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>
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
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-3">Welcome Back</p>
            <h1 className="font-serif text-4xl font-light text-brand-dark tracking-tight leading-tight">
              Sign in to your<br />
              <span className="italic font-normal">account</span>
            </h1>
            <p className="text-brand-text-muted text-sm mt-3 leading-relaxed">
              Manage and share your digital wedding invitations.
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
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/70">
                  Password
                </label>
                <Link href="#" className="text-[10px] text-brand-accent hover:text-brand-accent-hover font-semibold tracking-wider transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  suppressHydrationWarning
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 pr-11 text-sm text-brand-dark placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted/50 hover:text-brand-accent transition-colors duration-200"
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
                  Signing in…
                </span>
              ) : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7 flex items-center">
            <div className="flex-1 border-t border-brand-border/60" />
            <span className="px-4 text-[10px] uppercase font-bold tracking-widest text-brand-text-muted/50">or</span>
            <div className="flex-1 border-t border-brand-border/60" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-brand-border hover:border-brand-accent/50 text-brand-dark font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-xs hover:shadow-sm"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Sign up link */}
          <p className="text-center text-xs text-brand-text-muted mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-brand-dark hover:text-brand-accent transition-colors underline underline-offset-2">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
