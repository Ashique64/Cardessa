"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") || "classic";

  const prices = {
    classic: "₹699",
    royal: "₹1,399"
  };

  const handlePay = () => {
    alert("Razorpay Payment Gateway Triggered.\n(Simulated Payment Verified)");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center py-16 px-6 relative overflow-hidden">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-bg-soft/20 rounded-full filter blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full border border-brand-border/40 p-1.5 rounded-3xl bg-brand-bg"
      >
        <div className="bg-brand-bg border border-brand-border/40 rounded-2xl p-8 md:p-10 shadow-xs relative text-center">
          
          {/* Logo / Header */}
          <Link href="/" className="inline-flex items-center gap-1.5 justify-center mb-6">
            <span className="font-serif text-3xl font-extrabold tracking-wider text-brand-dark hover:text-brand-accent transition-colors duration-300">
              Cardessa
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent mt-2"></span>
          </Link>
          
          <h2 className="text-2xl font-serif font-light text-brand-dark tracking-tight mb-2">
            Order <span className="italic font-normal">Summary</span>
          </h2>
          <p className="text-brand-text-muted text-xs mb-8">Complete payment via Razorpay to activate your premium digital invitation canvas.</p>

          <div className="bg-brand-bg-soft/50 rounded-xl p-5 border border-brand-border/40 mb-8 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-serif text-lg font-medium text-brand-dark capitalize">{plan} Plan</span>
              <span className="font-serif text-lg font-semibold text-brand-accent">
                {prices[plan] || prices.classic}
              </span>
            </div>
            <div className="h-px bg-brand-border/30" />
            <div className="text-[11px] text-brand-text-muted/80 leading-relaxed">
              • Includes permanent secure cloud hosting<br />
              • Unlimited updates and edits post-launch<br />
              • High-definition asset performance optimization
            </div>
          </div>

          <button
            onClick={handlePay}
            className="w-full bg-brand-accent border border-brand-accent hover:bg-transparent hover:text-brand-accent text-brand-dark font-bold py-4 px-4 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 shadow-sm"
          >
            Pay with Razorpay (UPI, Card, NetBanking)
          </button>

          <Link
            href="/pricing"
            className="block text-center text-[10px] text-brand-text-muted hover:text-brand-dark transition font-bold uppercase tracking-widest mt-6"
          >
            Cancel and return to Pricing
          </Link>

        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center font-serif text-brand-text-muted text-sm italic">
        Loading summary...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
