"use client";

import React, { useRef, useState, useEffect } from "react";

export default function CustomSelect({ value, onChange, options = [], placeholder = "Select...", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object") return opt;
    return { value: opt, label: opt };
  });

  const selectedOpt = normalizedOptions.find((opt) => String(opt.value) === String(value));
  const selectedLabel = selectedOpt ? selectedOpt.label : placeholder;

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-850 font-medium flex items-center justify-between text-left cursor-pointer transition-all hover:bg-zinc-100/50 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#6B8E70]/20 focus:border-[#6B8E70]"
      >
        <span className={selectedOpt ? "text-zinc-900 font-semibold" : "text-zinc-455"}>
          {selectedLabel}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#6B8E70]" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-zinc-200/80 bg-white py-1.5 shadow-xl max-h-60 overflow-y-auto">
          {normalizedOptions.length === 0 ? (
            <div className="px-4 py-2.5 text-xs text-zinc-400 italic">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#6B8E70]/10 text-[#6B8E70] font-semibold"
                      : "text-zinc-650 hover:bg-zinc-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="h-3.5 w-3.5 text-[#6B8E70] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
