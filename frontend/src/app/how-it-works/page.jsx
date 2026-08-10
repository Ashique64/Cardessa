"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Select & Customize",
      desc: "Browse our collections, pick a design, and fill in the details: bride & groom names, event schedule, venues, custom welcome notes, and bottom attributions.",
      icon: "🎨",
    },
    {
      num: "02",
      title: "Media & Features",
      desc: "Make it truly yours by writing your love story, uploading cover portraits, establishing a photo gallery album, and enabling the guest RSVP system.",
      icon: "📸",
    },
    {
      num: "03",
      title: "Interactive Preview",
      desc: "Instantly check your progress in real-time. View the card's premium animations, music playback, and direction maps inside a realistic mobile mockup frame.",
      icon: "📱",
    },
    {
      num: "04",
      title: "Pay & Share",
      desc: "Review your template order summary, make a secure one-time payment, and immediately generate a unique shareable link to text your guests on WhatsApp.",
      icon: "✨",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans overflow-x-hidden flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 pt-36 pb-24 grow">
        {/* Header */}
        <header className="text-center mb-20 max-w-xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Workflow</span>
          <h1 className="text-4xl font-serif font-light text-brand-dark sm:text-5xl tracking-tight">
            How It <span className="italic font-normal">Works</span>
          </h1>
          <div className="h-0.5 w-16 bg-brand-accent mx-auto mt-2" />
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Cardessa simplifies digital wedding invites. Create, customize, and publish your invitations in minutes with zero print waste.
          </p>
        </header>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white border border-brand-border/60 rounded-2xl p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 bg-brand-bg-soft rounded-xl border border-brand-border flex items-center justify-center text-2xl shadow-2xs">
                    {step.icon}
                  </div>
                  <span className="font-serif text-3xl font-extralight text-brand-accent/40 tracking-wider">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-medium text-brand-dark mb-3">{step.title}</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Informative Block */}
        <div className="bg-[#6B8E70]/5 border border-[#6B8E70]/20 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto space-y-6 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Sustainability & Value</span>
          <h3 className="font-serif text-2xl md:text-3xl font-light text-brand-dark">No Subscriptions. Edit Anytime.</h3>
          <p className="text-xs text-brand-text-muted leading-relaxed max-w-xl mx-auto">
            Unlike other invitation websites that force you into recurring plans, Cardessa offers a simple one-time payment per template. You can edit your customized details, adjust timings, or swap music for free even after sharing. 
            <span className="block font-semibold text-brand-dark mt-2">All invites remain online and will be automatically deleted 10 days after the event date.</span>
          </p>
          <div className="pt-4">
            <Link
              href="/templates"
              className="bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-brand-dark font-bold py-4 px-10 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 inline-block shadow-sm"
            >
              Start Designing
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
