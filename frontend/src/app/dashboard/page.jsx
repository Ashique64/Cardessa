"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const PLAN_LABELS = {
  classic: { label: "Classic", cls: "bg-brand-bg-soft text-brand-text-muted border border-brand-border/60" },
  royal: { label: "Royal", cls: "bg-brand-accent/12 text-brand-accent border border-brand-accent/20" },
};

function StatusPill({ status }) {
  const s = status?.toLowerCase();
  if (s === "published")
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Published
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Draft
    </span>
  );
}

function EmptyState() {
  return (
    <motion.div {...fadeUp} className="flex flex-col items-center justify-center py-28 px-8 text-center max-w-sm mx-auto space-y-8">
      {/* Monogram seal */}
      <div className="relative">
        <div className="h-20 w-20 rounded-full border border-brand-border/60 bg-brand-bg-soft flex items-center justify-center">
          <div className="h-14 w-14 rounded-full border border-brand-accent/20 bg-brand-bg flex items-center justify-center">
            <svg className="h-6 w-6 text-brand-accent/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">No Invitations Yet</p>
        <h3 className="font-serif text-2xl font-light text-brand-dark leading-snug">
          Begin your <span className="italic font-normal">design journey</span>
        </h3>
        <p className="text-sm text-brand-text-muted leading-relaxed">
          Choose from our curated Classic or Royal collection and create your first luxury digital invitation.
        </p>
      </div>

      <Link
        href="/templates"
        className="bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm"
      >
        Browse Templates
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { setLoading(false); return; }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInvitations(Array.isArray(data) ? data : data.results ?? []);
        }
      } catch {
        // silently fail — empty state will show
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-6 pt-36 pb-28 grow">

        {/* Header */}
        <motion.header
          {...fadeUp}
          className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12 pb-8 border-b border-brand-border/40"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Workspace</span>
            <h1 className="font-serif text-4xl font-light text-brand-dark tracking-tight leading-tight">
              Hello, <span className="italic font-normal">{firstName}</span>
            </h1>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Manage, edit, and personalize your digital invitations.
            </p>
          </div>

          <Link
            href="/templates"
            className="self-start sm:self-auto flex items-center gap-2 bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors duration-300 shadow-sm"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Invitation
          </Link>
        </motion.header>

        {/* Stats Row */}
        {!loading && invitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-10"
          >
            {[
              { label: "Total Invitations", value: invitations.length },
              { label: "Published", value: invitations.filter((i) => i.status?.toLowerCase() === "published").length },
              { label: "Draft", value: invitations.filter((i) => i.status?.toLowerCase() !== "published").length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-brand-bg border border-brand-border/50 rounded-2xl p-5 space-y-1">
                <p className="text-2xl font-serif font-light text-brand-dark">{value}</p>
                <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Invitations List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="bg-brand-bg border border-brand-border/50 rounded-3xl overflow-hidden shadow-xs"
        >
          {loading ? (
            <div className="flex items-center justify-center py-28 gap-3">
              <svg className="animate-spin h-5 w-5 text-brand-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-brand-text-muted font-medium tracking-wide">Loading invitations…</span>
            </div>
          ) : invitations.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-brand-border/40">
              {invitations.map((item, idx) => {
                const plan = PLAN_LABELS[item.tier?.toLowerCase()] ?? PLAN_LABELS.classic;
                return (
                  <motion.li
                    key={item.id ?? idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                    className="group p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-brand-bg-soft/30 transition-colors duration-300"
                  >
                    <div className="flex items-start gap-5">
                      {/* Template thumbnail placeholder */}
                      <div className="hidden sm:flex h-12 w-12 rounded-xl bg-brand-bg-soft border border-brand-border/60 items-center justify-center shrink-0">
                        <svg className="h-5 w-5 text-brand-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-serif text-xl font-light text-brand-dark leading-tight">
                            {item.couple_name || item.title || "Untitled Invitation"}
                          </h3>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${plan.cls}`}>
                            {plan.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-text-muted">
                          {item.template_name && (
                            <span>Template: <strong className="text-brand-dark font-medium">{item.template_name}</strong></span>
                          )}
                          {item.event_date && (
                            <>
                              <span className="text-brand-border">·</span>
                              <span>Date: <strong className="text-brand-dark font-medium">{new Date(item.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <StatusPill status={item.status} />

                      {item.slug && (
                        <a
                          href={`/i/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-brand-bg border border-brand-border/60 hover:bg-brand-accent hover:border-brand-accent hover:text-white text-brand-dark font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
                        >
                          View Live
                        </a>
                      )}

                      <Link
                        href={`/editor/${item.slug || item.id}`}
                        className="bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors duration-300"
                      >
                        Edit
                      </Link>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
