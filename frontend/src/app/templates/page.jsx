"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
    },
    {
      name: "Emerald Velvet",
      slug: "emerald-velvet",
      tier: "Royal",
      style: "Vintage Regal",
      desc: "Deep emerald background with elegant gold accents, royal seals, and classic serif borders.",
      icon: "🌿"
    },
    {
      name: "Serene Sage",
      slug: "serene-sage",
      tier: "Classic",
      style: "Organic Botanical",
      desc: "Soft sage green background with hand-sketched olive branch monograms and delicate text style.",
      icon: "🍃"
    },
    {
      name: "Golden Ethereal",
      slug: "golden-ethereal",
      tier: "Royal",
      style: "Luxurious Shimmer",
      desc: "Warm cream backdrop with reflective golden light particles, smooth transitions, and premium monograms.",
      icon: "⚜️"
    },
    {
      name: "Terracotta Warmth",
      slug: "terracotta-warmth",
      tier: "Classic",
      style: "Autumn Rustic",
      desc: "Warm terracotta clay theme with minimalist dry flora details, perfect for fall weddings.",
      icon: "🍂"
    },
    {
      name: "Minimal Line",
      slug: "minimal-line",
      tier: "Classic",
      style: "Ultra Modern",
      desc: "Sophisticated single line-art graphics, wide letter spacing, and a focus on clean margins.",
      icon: "◽"
    },
    {
      name: "Sapphire Waves",
      slug: "sapphire-waves",
      tier: "Royal",
      style: "Fluid Abstract",
      desc: "Stunning indigo marbling effects with metallic leaf layers and smooth scrolling animations.",
      icon: "🌊"
    },
    {
      name: "Crimson Dynasty",
      slug: "crimson-dynasty",
      tier: "Royal",
      style: "Traditional Regal",
      desc: "Deep rich red theme featuring traditional border carvings, ambient lantern lights, and gold foil seal.",
      icon: "🏮"
    },
    {
      name: "Boho Chic",
      slug: "boho-chic",
      tier: "Classic",
      style: "Warm Botanical",
      desc: "Dreamy pampas grass decorations, soft neutral colors, and hand-written script fonts.",
      icon: "🌾"
    }
  ];

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const gridRef = useRef(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    setTimeout(() => {
      if (gridRef.current) {
        const yOffset = -120;
        const y = gridRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 50);
  };

  // Filtering
  const filteredTemplates = templates.filter((tpl) => {
    if (activeTab === "all") return true;
    return tpl.tier.toLowerCase() === activeTab.toLowerCase();
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 pt-36 pb-24 grow">
        
        {/* Header */}
        <header className="text-center mb-16 max-w-xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Collection</span>
          <h1 className="text-4xl font-serif font-light text-brand-dark sm:text-5xl tracking-tight">
            Select Your <span className="italic font-normal">Wedding Design</span>
          </h1>
          <div className="h-0.5 w-16 bg-brand-accent mx-auto mt-2" />
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Choose a luxury mobile-friendly template. Preview the animations, soundscapes, and map integrations.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-4 mb-16">
          {[
            { id: "all", label: "All Designs" },
            { id: "classic", label: "Classic Collection" },
            { id: "royal", label: "Royal Collection" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                  isActive
                    ? "bg-brand-dark border-brand-dark text-white shadow-sm"
                    : "bg-brand-bg-soft border-brand-border/60 text-brand-dark hover:bg-brand-accent hover:border-brand-accent hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Template Cards Grid */}
        <motion.div 
          ref={gridRef}
          layout
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {paginatedTemplates.map((tpl) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 12px 30px -10px rgba(95, 125, 103, 0.12)",
                  borderColor: "rgba(95, 125, 103, 0.4)"
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 28,
                  layout: { duration: 0.35, type: "tween", ease: "easeInOut" }
                }}
                key={tpl.slug}
                className="bg-brand-bg rounded-2xl border border-brand-border/60 p-8 flex flex-col justify-between shadow-2xs"
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
          </AnimatePresence>
        </motion.div>

        {/* Pagination Dock */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-20 pt-8 border-t border-brand-border/30 font-sans">
            {/* Previous Arrow */}
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
              className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                currentPage === 1
                  ? "opacity-30 cursor-not-allowed border-brand-border/30 text-brand-text-muted"
                  : "bg-brand-bg-soft border-brand-border/60 text-brand-dark hover:bg-brand-accent hover:border-brand-accent hover:text-white"
              }`}
            >
              <svg className="h-3.5 w-3.5 stroke-current fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-9 w-9 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center border ${
                      isActive
                        ? "bg-brand-dark border-brand-dark text-white shadow-xs"
                        : "bg-transparent border-transparent text-brand-text-muted hover:bg-brand-bg-soft hover:text-brand-dark hover:border-brand-border/60"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Arrow */}
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
              className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                currentPage === totalPages
                  ? "opacity-30 cursor-not-allowed border-brand-border/30 text-brand-text-muted"
                  : "bg-brand-bg-soft border-brand-border/60 text-brand-dark hover:bg-brand-accent hover:border-brand-accent hover:text-white"
              }`}
            >
              <svg className="h-3.5 w-3.5 stroke-current fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
