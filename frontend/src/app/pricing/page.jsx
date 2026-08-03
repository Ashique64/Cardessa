"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const plans = [
    {
      name: "Classic",
      price: "₹699",
      billing: "one-time payment",
      desc: "Perfect for simple, elegant digital invitations.",
      features: [
        "✔ Access to cardessa classic Invitations",
        "✔ 6 Premium Animated Templates",
        "✔ 1 Invitation Webpage",
        "✔ Unlimited Edits Until Event Date",
        "✔ Music, Photos & Custom Uploads",
        "✔ Google Maps & Multi-Language Support",
        "❌ Cinematic Royal Invitation Experience",
        "❌ Luxury Video-Based Opening Experience",
        "❌ Premium Motion Storytelling"
      ],
      cta: "Choose Classic",
      slug: "classic"
    },
    {
      name: "Royal",
      price: "₹1,399",
      billing: "one-time payment",
      desc: "Our premium custom cinematic invitation experience.",
      features: [
        "✔ Everything in Classic, plus:",
        "✔ Access to ALL Classic + Royal Invitations",
        "✔ 10 Premium Animated Templates",
        "✔ Cinematic Royal Invitation Experience",
        "✔ Luxury Video-Based Opening Experience",
        "✔ Premium Motion Storytelling",
        "✔ Exclusive Royal Template Collection"
      ],
      cta: "Choose Royal",
      slug: "royal",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-36 pb-24">
        
        {/* Header */}
        <header className="text-center mb-20 max-w-xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Investment</span>
          <h1 className="text-4xl font-serif font-light text-brand-dark sm:text-5xl tracking-tight">
            Simple, Elegant <span className="italic font-normal">Pricing</span>
          </h1>
          <div className="h-0.5 w-16 bg-brand-accent mx-auto mt-2" />
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Pick the perfect plan to announce your special day. All tiers include unlimited edits even after publishing.
          </p>
        </header>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 grid-cols-1 items-stretch max-w-4xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.slug}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className={`bg-brand-bg rounded-2xl p-8 border flex flex-col justify-between shadow-sm relative transition-all duration-300 ${
                plan.popular
                  ? "border-brand-accent shadow-md shadow-brand-accent/5 ring-1 ring-brand-accent"
                  : "border-brand-border/60"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-accent text-brand-dark text-[9px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className={`text-2xl font-serif font-medium ${plan.popular ? "text-brand-accent" : "text-brand-dark"}`}>
                    {plan.name}
                  </h3>
                  <p className="text-brand-text-muted text-xs mt-1.5 leading-relaxed">{plan.desc}</p>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-light text-brand-dark">{plan.price}</span>
                  <span className="text-brand-text-muted text-xs ml-1">/ {plan.billing}</span>
                </div>

                <div className="h-px bg-brand-border/60" />

                <ul className="space-y-3.5 text-xs text-brand-text-muted">
                  {plan.features.map((f, idx) => {
                    const isExcluded = f.startsWith("❌");
                    const cleanText = f.replace(/^([✔❌])\s*/, "");
                    return (
                      <li key={idx} className={`flex items-start leading-relaxed ${isExcluded ? "text-brand-text-muted/40" : "text-brand-text-muted"}`}>
                        <span className={`mr-2.5 shrink-0 ${isExcluded ? "" : "text-brand-accent font-bold"}`}>
                          {isExcluded ? "❌" : "✔"}
                        </span>
                        <span>{cleanText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={{
                    pathname: "/checkout",
                    query: { plan: plan.slug }
                  }}
                  className={`w-full block text-center py-3.5 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                    plan.popular
                      ? "bg-brand-dark hover:bg-brand-accent hover:text-white text-brand-bg shadow-sm"
                      : "bg-brand-bg-soft border border-brand-border/60 hover:bg-brand-accent hover:border-brand-accent hover:text-white text-brand-dark"
                  }`}
                >
                  {plan.cta}
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
