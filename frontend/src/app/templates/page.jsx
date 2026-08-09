"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

// Tier badge colors
const tierStyles = {
  royal:   "bg-[#6B8E70]/15 text-[#6B8E70] border border-[#6B8E70]/25",
  classic: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();

  // ── Data ───────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // ── Filter / pagination state ──────────────────────────────────────────────
  const [activeTier, setActiveTier] = useState("all");       // all | classic | royal
  const [activeCategory, setActiveCategory] = useState("all"); // all | <slug>
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const gridRef = useRef(null);

  // ── Loading slug (Use Design button) ────────────────────────────────────────
  const [loadingSlug, setLoadingSlug] = useState(null);

  // ── Fetch categories once ────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/categories/`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  // ── Fetch templates whenever category filter changes ──────────────────────
  useEffect(() => {
    setLoadingTemplates(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeTier !== "all") params.set("tier", activeTier);

    fetch(`${API}/templates/?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        setTemplates(list);
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, [activeCategory, activeTier]);

  // ── Reset page when filters change ────────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeTier]);

  // ── Use Design handler ─────────────────────────────────────────────────────
  const handleUseDesign = async (slug) => {
    if (!user) { router.push("/login"); return; }
    if (user.is_superuser || user.is_staff) { router.push(`/editor/${slug}`); return; }
    setLoadingSlug(slug);
    try {
      const res = await ordersApi.checkPlan();
      router.push(res.data.has_plan ? `/editor/${slug}` : "/pricing");
    } catch {
      router.push("/pricing");
    } finally {
      setLoadingSlug(null);
    }
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(templates.length / itemsPerPage);
  const paginatedTemplates = templates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (n) => {
    setCurrentPage(n);
    setTimeout(() => {
      if (gridRef.current) {
        window.scrollTo({
          top: gridRef.current.getBoundingClientRect().top + window.pageYOffset - 120,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 pt-36 pb-24 grow">

        {/* ── Header ── */}
        <header className="text-center mb-14 max-w-xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Collection</span>
          <h1 className="text-4xl font-serif font-light text-brand-dark sm:text-5xl tracking-tight">
            Select Your <span className="italic font-normal">Wedding Design</span>
          </h1>
          <div className="h-0.5 w-16 bg-brand-accent mx-auto mt-2" />
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Choose a luxury mobile-friendly template. Preview the animations, soundscapes, and map integrations.
          </p>
        </header>

        {/* ── Category Pills (from API) ── */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                activeCategory === "all"
                  ? "bg-brand-dark border-brand-dark text-white"
                  : "bg-brand-bg border-brand-border/60 text-brand-dark hover:border-brand-accent hover:text-brand-accent"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  activeCategory === cat.slug
                    ? "bg-brand-dark border-brand-dark text-white"
                    : "bg-brand-bg border-brand-border/60 text-brand-dark hover:border-brand-accent hover:text-brand-accent"
                }`}
              >
                {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Tier Filter Pills ── */}
        <div className="flex justify-center gap-3 mb-12">
          {[
            { id: "all",     label: "All Designs" },
            { id: "classic", label: "Classic" },
            { id: "royal",   label: "Royal" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTier(id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                activeTier === id
                  ? "bg-brand-dark border-brand-dark text-white shadow-sm"
                  : "bg-brand-bg-soft border-brand-border/60 text-brand-dark hover:bg-brand-accent hover:border-brand-accent hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Templates Grid ── */}
        {loadingTemplates ? (
          <div className="flex justify-center items-center py-24 gap-3">
            <div className="h-6 w-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-brand-text-muted">Loading templates…</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-24 text-brand-text-muted space-y-3">
            <p className="text-lg font-serif">No templates found</p>
            <p className="text-sm">Try a different category or tier filter.</p>
            <button
              onClick={() => { setActiveCategory("all"); setActiveTier("all"); }}
              className="text-xs text-brand-accent font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div
            ref={gridRef}
            layout
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {paginatedTemplates.map((tpl) => {
                // Category labels for the card (e.g. "Wedding · Engagement")
                const categoryLabels = (tpl.categories || [])
                  .map((c) => c.name)
                  .join(" · ");

                return (
                  <motion.div
                    layout
                    key={tpl.slug || tpl.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    whileHover={{ y: -6 }}
                    transition={{
                      type: "spring", stiffness: 280, damping: 28,
                      layout: { duration: 0.35, type: "tween", ease: "easeInOut" },
                    }}
                    className="bg-brand-bg rounded-2xl border border-brand-border/60 p-8 flex flex-col justify-between shadow-2xs hover:border-brand-accent/40 hover:shadow-[0_12px_30px_-10px_rgba(95,125,103,0.12)] transition-[border-color,box-shadow] duration-300"
                  >
                    <div>
                      {/* Tier badge + category tags */}
                      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                            tierStyles[tpl.tier?.toLowerCase()] || tierStyles.classic
                          }`}
                        >
                          {tpl.tier}
                        </span>

                        {categoryLabels && (
                          <span className="text-[10px] text-brand-text-muted font-medium tracking-wide">
                            {categoryLabels}
                          </span>
                        )}
                      </div>

                      {/* Template name + thumbnail/icon + description */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-12 w-12 bg-brand-bg-soft rounded-xl border border-brand-border flex items-center justify-center shrink-0 overflow-hidden">
                          {tpl.thumbnail ? (
                            <img
                              src={tpl.thumbnail}
                              alt={tpl.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🎴</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-serif font-medium text-brand-dark">{tpl.name}</h3>
                          <p className="text-brand-text-muted text-xs leading-relaxed mt-2 line-clamp-3">
                            {tpl.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4 pt-6">
                      <Link
                        href={`/templates/${tpl.slug}`}
                        className="flex-1 text-center bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-white font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors duration-300 shadow-xs"
                      >
                        Live Preview
                      </Link>
                      <button
                        onClick={() => handleUseDesign(tpl.slug)}
                        disabled={loadingSlug !== null}
                        className="flex-1 text-center bg-brand-bg-soft hover:bg-brand-dark text-brand-dark hover:text-brand-bg font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors duration-300 border border-brand-border/60 cursor-pointer disabled:opacity-50"
                      >
                        {loadingSlug === tpl.slug ? "Checking…" : "Use Design"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-20 pt-8 border-t border-brand-border/30">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                currentPage === 1
                  ? "opacity-30 cursor-not-allowed border-brand-border/30 text-brand-text-muted"
                  : "bg-brand-bg-soft border-brand-border/60 text-brand-dark hover:bg-brand-accent hover:border-brand-accent hover:text-white"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => handlePageChange(n)}
                className={`h-9 w-9 rounded-full text-xs font-bold border transition-all duration-300 ${
                  currentPage === n
                    ? "bg-brand-dark border-brand-dark text-white shadow-xs"
                    : "bg-transparent border-transparent text-brand-text-muted hover:bg-brand-bg-soft hover:text-brand-dark hover:border-brand-border/60"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                currentPage === totalPages
                  ? "opacity-30 cursor-not-allowed border-brand-border/30 text-brand-text-muted"
                  : "bg-brand-bg-soft border-brand-border/60 text-brand-dark hover:bg-brand-accent hover:border-brand-accent hover:text-white"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
