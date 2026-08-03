"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
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
    { name: "Pricing", href: "/pricing" },
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
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-brand-text-muted hover:text-brand-dark transition-colors duration-300"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="bg-brand-dark hover:bg-brand-accent text-brand-bg text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-lg transition-colors duration-300 shadow-sm"
              >
                Logout
              </button>
            </>
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
