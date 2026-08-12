"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";


function UserDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 group focus:outline-none"
        aria-label="Account menu"
      >
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-brand-dark group-hover:bg-brand-accent transition-colors duration-300 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-brand-bg tracking-wide">{initials}</span>
        </div>
        {/* Chevron */}
        <svg
          className={`h-3.5 w-3.5 text-brand-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-60 bg-brand-bg border border-brand-border/60 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* User info */}
            <div className="px-5 py-4 border-b border-brand-border/40">
              <p className="text-xs font-bold text-brand-dark truncate">{user?.name || "Account"}</p>
              <p className="text-[11px] text-brand-text-muted truncate mt-0.5">{user?.email || ""}</p>
            </div>

            {/* Links */}
            <div className="py-2">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-sm text-brand-text-muted hover:text-brand-dark hover:bg-brand-bg-soft transition-colors duration-200"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/templates"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-sm text-brand-text-muted hover:text-brand-dark hover:bg-brand-bg-soft transition-colors duration-200"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h7.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m-7.5 0h7.5" />
                </svg>
                Browse Templates
              </Link>
            </div>

            <div className="border-t border-brand-border/40 py-2">
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-500/80 hover:text-red-600 hover:bg-red-50/60 transition-colors duration-200"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [visible, setVisible] = useState(true);
  const [isHeroPassed, setIsHeroPassed] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Navbar changes to glassmorphism background after scroll Y exceeds 80px
      setIsHeroPassed(currentScrollY > 80);

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        setVisible(false);
        setIsOpen(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Templates", href: "/templates" },
    { name: "How it works", href: "/how-it-works" },
  ];

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isHeroPassed
          ? "bg-brand-bg/80 backdrop-blur-md border-b border-brand-border/60 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Elegant Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-3xl font-extrabold tracking-wider text-brand-dark group-hover:text-brand-accent transition-colors duration-300">
            Cardessa
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent group-hover:scale-150 transition-transform duration-300 mt-2"></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 relative">
          {navLinks.map((link, idx) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative px-4 py-2 text-sm font-semibold tracking-wide text-brand-text-muted hover:text-brand-dark transition-colors duration-300"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className="relative z-10">{link.name}</span>
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.span
                    layoutId="navHover"
                    className="absolute inset-0 bg-brand-bg-soft rounded-lg z-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <UserDropdown user={user} logout={logout} />
          ) : (
            <>
              <Link
                href="/login"
                className="bg-brand-bg-soft border border-brand-border hover:bg-transparent hover:border-brand-accent hover:text-brand-accent text-brand-dark text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-lg transition-all duration-300 shadow-xs"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-brand-dark hover:bg-brand-accent text-brand-bg text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-lg transition-colors duration-300 shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburguer Menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg text-brand-text hover:bg-brand-bg-soft transition-colors duration-300 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span
            className={`w-5 h-0.5 bg-current rounded-full transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
            }`}
          />
          <span
            className={`w-5 h-0.5 bg-current rounded-full transition-transform duration-300 mt-1 ${
              isOpen ? "-rotate-45 -translate-y-0.5" : "translate-y-0.5"
            }`}
          />
        </button>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-brand-border bg-brand-bg overflow-hidden shadow-lg"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-brand-text-muted hover:text-brand-dark transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-brand-border my-2" />
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-brand-text-muted hover:text-brand-dark transition-colors duration-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-3.5 rounded-lg text-sm tracking-wide transition-colors duration-300 text-center uppercase"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-brand-bg-soft border border-brand-border hover:bg-transparent hover:border-brand-accent hover:text-brand-accent text-brand-dark font-bold py-3.5 rounded-lg text-sm tracking-wide transition-all duration-300 text-center uppercase"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-3.5 rounded-lg text-sm tracking-wide transition-colors duration-300 text-center uppercase"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
