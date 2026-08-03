"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const [invitations, setInvitations] = useState([
    {
      id: "1",
      couple: "Rahul & Priya",
      template: "Ivory Bloom",
      slug: "rahul-priya",
      tier: "Classic",
      status: "Published",
      date: "Nov 15, 2026"
    }
  ]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-6 pt-36 pb-24 grow">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12 pb-6 border-b border-brand-border/40">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Workspace</span>
            <h1 className="font-serif text-4xl font-light text-brand-dark tracking-tight">
              Your <span className="italic font-normal">Dashboard</span>
            </h1>
            <p className="text-xs text-brand-text-muted">Manage, edit, and personalize your digital invitations.</p>
          </div>
          <Link
            href="/templates"
            className="self-start sm:self-auto bg-brand-dark hover:bg-brand-accent hover:text-white text-brand-bg font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-wider transition-colors duration-300 shadow-sm"
          >
            Create New Invitation
          </Link>
        </header>

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-brand-border/40 p-1.5 rounded-3xl bg-brand-bg shadow-xs"
        >
          <div className="bg-brand-bg border border-brand-border/40 rounded-2xl overflow-hidden">
            
            {invitations.length === 0 ? (
              <div className="text-center py-20 px-6 max-w-sm mx-auto space-y-6">
                {/* Gold Seal Ornament Illustration */}
                <div className="h-16 w-16 bg-brand-bg-soft rounded-full border border-brand-border mx-auto flex items-center justify-center font-serif text-2xl font-extrabold text-brand-accent/50 shadow-xs">
                  C
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-medium text-brand-dark">No Invitations Yet</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    Begin designing your bespoke digital announcement from our premium template collection.
                  </p>
                </div>
                <Link
                  href="/templates"
                  className="inline-block bg-brand-bg-soft hover:bg-brand-accent hover:text-white border border-brand-border text-brand-dark font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-wider transition-colors duration-300"
                >
                  Choose a Template
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-brand-border/40">
                {invitations.map((item) => (
                  <motion.li
                    key={item.id}
                    whileHover={{ backgroundColor: "rgba(95, 125, 103, 0.02)" }}
                    className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-serif text-2xl font-light text-brand-dark">
                          {item.couple}'s <span className="italic font-normal">Wedding</span>
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                            item.tier === "Royal"
                              ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/20"
                              : "bg-brand-bg-soft text-brand-text-muted border border-brand-border/60"
                          }`}
                        >
                          {item.tier}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-brand-text-muted">
                        <span>Template: <strong className="text-brand-dark font-medium">{item.template}</strong></span>
                        <span>•</span>
                        <span>Event Date: <strong className="text-brand-dark font-medium">{item.date}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center rounded-md bg-green-50/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700 border border-green-200/50 mr-4 shadow-2xs">
                        {item.status}
                      </span>
                      
                      <a
                        href={`/i/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-brand-bg-soft border border-brand-border hover:bg-brand-accent hover:border-brand-accent hover:text-white text-brand-dark font-bold py-2.5 px-5 rounded-lg text-xs uppercase tracking-wider transition-all duration-300 text-center shadow-2xs"
                      >
                        View Live
                      </a>
                      
                      <Link
                        href={`/editor/${item.slug}`}
                        className="bg-brand-dark hover:bg-brand-accent hover:text-white text-brand-bg font-bold py-2.5 px-5 rounded-lg text-xs uppercase tracking-wider transition-all duration-300 text-center shadow-xs"
                      >
                        Edit Canvas
                      </Link>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
