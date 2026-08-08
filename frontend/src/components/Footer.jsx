"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-[#ECE6DD] border-t border-brand-border/10">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-3xl font-extrabold tracking-wider text-brand-bg hover:text-brand-accent transition-colors duration-300">
                Cardessa
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent mt-2"></span>
            </Link>
            <p className="text-sm text-brand-bg-soft/70 leading-relaxed max-w-xs">
              Say goodbye to traditional paper invites. Design stunning, premium animated invitations that tell your love story beautifully.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-brand-bg tracking-wide">Explore</h4>
            <ul className="space-y-3 text-sm text-brand-bg-soft/60">
              <li>
                <Link href="/" className="hover:text-brand-accent transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-brand-accent transition-colors duration-300">
                  Invitation Designs
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand-accent transition-colors duration-300">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-brand-bg tracking-wide">Resources</h4>
            <ul className="space-y-3 text-sm text-brand-bg-soft/60">
              <li>
                <span className="cursor-not-allowed hover:text-brand-accent/50 transition-colors duration-300">
                  FAQs & Support
                </span>
              </li>
              <li>
                <span className="cursor-not-allowed hover:text-brand-accent/50 transition-colors duration-300">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-not-allowed hover:text-brand-accent/50 transition-colors duration-300">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-brand-bg tracking-wide">Stay Updated</h4>
            <p className="text-sm text-brand-bg-soft/60 leading-relaxed">
              Get notified of new luxury animated templates and feature updates.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                suppressHydrationWarning
                placeholder="Your email address"
                className="bg-brand-bg-soft/10 border border-brand-border/10 rounded-lg px-4 py-2.5 text-xs text-brand-bg w-full focus:outline-none focus:border-brand-accent/50 transition-colors duration-300 placeholder-brand-bg-soft/30"
              />
              <button
                type="submit"
                className="bg-brand-accent hover:bg-brand-accent-hover text-brand-dark px-4 py-2.5 rounded-lg text-xs font-bold transition-colors duration-300"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-brand-bg-soft/40">
          <div>
            &copy; {currentYear} Cardessa Platform. Handcrafted for modern celebrations.
          </div>
          <div className="flex items-center gap-5">
            <a
              href="#"
              aria-label="Instagram"
              className="text-brand-bg-soft/60 hover:text-brand-accent transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/>
              </svg>
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="text-brand-bg-soft/60 hover:text-brand-accent transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a
              href="#"
              aria-label="WhatsApp"
              className="text-brand-bg-soft/60 hover:text-brand-accent transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.666.988 3.308 1.48 4.962 1.481 5.425 0 9.84-4.417 9.845-9.847.002-2.63-1.02-5.101-2.877-6.96C16.719 1.967 14.247.94 11.62.942c-5.427 0-9.845 4.417-9.85 9.848-.002 1.81.484 3.58 1.411 5.141l-1.092 3.99 4.103-1.077c1.6.873 3.327 1.328 4.965 1.328zm10.748-7.531c-.297-.15-1.758-.868-2.031-.967-.272-.099-.47-.148-.667.15-.198.297-.767.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.174.2-.298.298-.497.099-.198.05-.371-.025-.521-.075-.149-.667-1.611-.914-2.206-.242-.584-.487-.506-.667-.515-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
