"use client";

import React from "react";
import { useAlertStore } from "@/store/alertStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomAlert() {
  const { isOpen, message, type, title, hideAlert } = useAlertStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hideAlert}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative bg-white border border-zinc-150 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 z-10 font-sans"
          >
            {/* Elegant icon based on type */}
            <div className="flex justify-center">
              {type === "success" ? (
                <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xl animate-bounce">
                  🌿
                </div>
              ) : type === "error" ? (
                <div className="h-12 w-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-xl">
                  🍁
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-brand-bg-soft border border-zinc-200 text-brand-dark flex items-center justify-center text-xl">
                  ✨
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-zinc-900 leading-snug">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-line">{message}</p>
            </div>

            {/* Action */}
            <button
              onClick={hideAlert}
              className="w-full bg-zinc-950 hover:bg-[#6B8E70] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-sm"
            >
              Okay
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
