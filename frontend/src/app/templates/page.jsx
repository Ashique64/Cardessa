"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TemplatesPage() {
  const templates = [
    {
      name: "Ivory Bloom",
      slug: "ivory-bloom",
      tier: "Classic",
      style: "Elegant Minimalist",
      desc: "Warm off-white background with subtle antique gold monograms and clean typography.",
      icon: "🌸"
    },
    {
      name: "Midnight Luxe",
      slug: "midnight-luxe",
      tier: "Royal",
      style: "Dark Luxury",
      desc: "Deep obsidian backdrop with refined gold foil textures, scrolling text tickers, and parallax cards.",
      icon: "✨"
    },
    {
      name: "Modern Script",
      slug: "modern-script",
      tier: "Classic",
      style: "Clean Contemporary",
      desc: "Contemporary display typography, modern layouts, and quick social-sharing guest features.",
      icon: "✏️"
    },
    {
      name: "Royal Garden",
      slug: "royal-garden",
      tier: "Royal",
      style: "Traditional Ornate",
      desc: "Ambient floral particles, hand-drawn monogram SVGs, and deep maroon/gold color schemes.",
      icon: "🏰"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-36 pb-24">
        
        {/* Header */}
        <header className="text-center mb-20 max-w-xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Collection</span>
          <h1 className="text-4xl font-serif font-light text-brand-dark sm:text-5xl tracking-tight">
            Select Your <span className="italic font-normal">Wedding Design</span>
          </h1>
          <div className="h-0.5 w-16 bg-brand-accent mx-auto mt-2" />
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Choose a luxury mobile-friendly template. Preview the animations, soundscapes, and map integrations.
          </p>
        </header>

        {/* Template Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {templates.map((tpl) => (
            <motion.div
              key={tpl.slug}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="bg-brand-bg rounded-2xl border border-brand-border/60 p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    suppressHydrationWarning
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      tpl.tier === "Royal"
                        ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/20"
                        : "bg-brand-bg-soft text-brand-text-muted border border-brand-border/60"
                    }`}
                  >
                    {tpl.tier}
                  </span>
                  <span className="text-xs font-semibold text-brand-text-muted tracking-wider uppercase">
                    {tpl.style}
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 bg-brand-bg-soft rounded-lg border border-brand-border flex items-center justify-center text-xl shrink-0">
                    {tpl.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-medium text-brand-dark">{tpl.name}</h3>
                    <p className="text-brand-text-muted text-xs leading-relaxed mt-2">{tpl.desc}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <Link
                  href={`/templates/${tpl.slug}`}
                  className="flex-1 text-center bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-white font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors duration-300 shadow-xs"
                >
                  Live Preview
                </Link>
                <Link
                  href={`/editor/${tpl.slug}`}
                  className="flex-1 text-center bg-brand-bg-soft hover:bg-brand-dark text-brand-dark hover:text-brand-bg font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors duration-300 border border-brand-border/60"
                >
                  Use Design
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
