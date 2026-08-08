"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ─── Inline Scratch Card component for Editor preview ───
function PreviewScratchCard({ date, primaryColor }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with gold gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#D4AF37");
    grad.addColorStop(0.5, "#F3E5AB");
    grad.addColorStop(1, "#AA7C11");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#4a3c10";
    ctx.font = "italic bold 11px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to Reveal Date", canvas.width / 2, canvas.height / 2);
  }, [date]);

  const scratch = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    const percent = (transparent / (canvas.width * canvas.height)) * 100;
    if (percent > 45 && !isRevealed) {
      setIsRevealed(true);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-24 bg-amber-50/10 border border-amber-200/20 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/90 p-2">
        <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Save The Date</span>
        <p className="font-serif text-base font-light text-zinc-900 tracking-wide">{date || "NOVEMBER 15, 2026"}</p>
      </div>

      <motion.canvas
        ref={canvasRef}
        onMouseMove={(e) => e.buttons === 1 && scratch(e.clientX, e.clientY)}
        onTouchMove={(e) => scratch(e.touches[0].clientX, e.touches[0].clientY)}
        animate={isRevealed ? { opacity: 0, pointerEvents: "none" } : {}}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 cursor-crosshair touch-none"
      />
    </div>
  );
}

export default function EditorPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [checkingPlan, setCheckingPlan] = useState(true);

  // Gated access check
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const check = async () => {
      try {
        const res = await ordersApi.checkPlan();
        if (!res.data.has_plan) {
          router.push("/pricing");
        } else {
          setCheckingPlan(false);
        }
      } catch {
        router.push("/pricing");
      }
    };
    check();
  }, [user, authLoading, router]);

  const [activeTab, setActiveTab] = useState("content");
  const [invitationData, setInvitationData] = useState({
    groom: "Rahul",
    bride: "Priya",
    date: "2026-11-15",
    time: "18:00",
    venueName: "Grand Palace Resort",
    venueAddress: "Bypass road, Mumbai, MH",
    bgColor: "#F6F4F0",
    primaryColor: "#6B8E70",
    musicEnabled: true
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInvitationData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  if (authLoading || checkingPlan) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-6 w-6 text-brand-accent" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs text-brand-text-muted font-medium tracking-wide">Verifying Access...</span>
      </div>
    );
  }

  // Format date display helper
  const formattedDate = invitationData.date
    ? new Date(invitationData.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Nov 15, 2026";

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-zinc-200 py-4 px-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-550 hover:text-zinc-950 transition">
            ← Dashboard
          </Link>
          <span className="h-5 w-px bg-zinc-200"></span>
          <span className="text-zinc-500 text-sm">Editing Invitation</span>
        </div>
        <button
          onClick={() => alert("Changes saved successfully!")}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-sm"
        >
          Save & Publish
        </button>
      </header>

      {/* Editor & Preview Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side — Settings Panel */}
        <aside className="w-full md:w-105 bg-white border-r border-zinc-200 flex flex-col shrink-0">
          <nav className="flex border-b border-zinc-100 text-sm">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-4 text-center font-semibold border-b-2 ${
                activeTab === "content" ? "border-zinc-900 text-zinc-950" : "border-transparent text-zinc-500"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`flex-1 py-4 text-center font-semibold border-b-2 ${
                activeTab === "design" ? "border-zinc-900 text-zinc-950" : "border-transparent text-zinc-500"
              }`}
            >
              Design
            </button>
          </nav>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === "content" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Groom's Name</label>
                  <input
                    type="text"
                    name="groom"
                    value={invitationData.groom}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Bride's Name</label>
                  <input
                    type="text"
                    name="bride"
                    value={invitationData.bride}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Event Date</label>
                    <input
                      type="date"
                      name="date"
                      value={invitationData.date}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Start Time</label>
                    <input
                      type="time"
                      name="time"
                      value={invitationData.time}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Venue Name</label>
                  <input
                    type="text"
                    name="venueName"
                    value={invitationData.venueName}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Venue Address</label>
                  <textarea
                    name="venueAddress"
                    value={invitationData.venueAddress}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === "design" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Theme Background Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      name="bgColor"
                      value={invitationData.bgColor}
                      onChange={handleInputChange}
                      className="w-10 h-10 border border-zinc-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-zinc-600 text-sm font-medium">{invitationData.bgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Accent Brand Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      name="primaryColor"
                      value={invitationData.primaryColor}
                      onChange={handleInputChange}
                      className="w-10 h-10 border border-zinc-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-zinc-600 text-sm font-medium">{invitationData.primaryColor}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-6">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Background Music</h4>
                    <p className="text-xs text-zinc-500">Enable default audio track auto-play.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="musicEnabled"
                    checked={invitationData.musicEnabled}
                    onChange={handleInputChange}
                    className="h-5 w-5 border-zinc-300 rounded text-zinc-900 focus:ring-zinc-900"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Side — High-End Real-Time Phone Preview Frame (Ivory Bloom Matcher) */}
        <main className="flex-1 p-8 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-86 h-150 rounded-[44px] shadow-2xl border-12 border-zinc-900 bg-white overflow-hidden relative flex flex-col select-none">
            
            {/* Phone Screen Scroll Container */}
            <div className="flex-1 overflow-y-auto relative flex flex-col" style={{ backgroundColor: invitationData.bgColor }}>
              
              {/* Monogram Cover screen (simulated live w/ exit animation) */}
              <AnimatePresence>
                {!isPreviewOpen && (
                  <motion.div
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.7, ease: [0.85, 0, 0.15, 1] }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center cursor-pointer"
                    style={{ backgroundColor: invitationData.bgColor }}
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    {/* Borders */}
                    <div className="absolute inset-3 border border-zinc-350/20 rounded-2xl pointer-events-none" />
                    <div className="absolute inset-4 border border-zinc-350/40 rounded-2xl pointer-events-none" />

                    <div className="space-y-6">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Wedding Invitation</span>
                      <h2 className="font-serif text-3xl font-light text-zinc-800 leading-snug">
                        {invitationData.groom} <br />
                        <span className="italic font-normal text-zinc-400">&amp;</span> <br />
                        {invitationData.bride}
                      </h2>
                      <div className="flex flex-col items-center gap-2 pt-4">
                        <div
                          className="h-14 w-14 rounded-full border border-white/60 flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition"
                          style={{ backgroundColor: invitationData.primaryColor }}
                        >
                          <span className="font-serif text-base font-bold tracking-widest">
                            {(invitationData.groom?.[0] || "") + (invitationData.bride?.[0] || "")}
                          </span>
                        </div>
                        <span className="text-[7px] uppercase tracking-widest font-bold text-zinc-400 animate-pulse">Tap to Open</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset Cover Button */}
              {isPreviewOpen && (
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-4 right-4 z-20 bg-white/80 border border-zinc-200 text-zinc-500 hover:text-zinc-800 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition"
                >
                  Reset Cover
                </button>
              )}

              {/* Main invitation scroll body */}
              <div className="p-6 space-y-12 my-auto flex-1 flex flex-col justify-center text-center">
                
                {/* Hero Section */}
                <div className="space-y-6 py-6 border-b border-zinc-200/50">
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: invitationData.primaryColor }}>Save The Date</span>
                  <h3 className="font-serif text-4xl font-light text-zinc-800 leading-tight">
                    {invitationData.groom} <br />
                    <span className="italic font-normal text-zinc-400">&amp;</span> <br />
                    {invitationData.bride}
                  </h3>
                  <p className="text-zinc-400 text-[10px] italic max-w-44 mx-auto leading-relaxed">
                    invite you to celebrate their wedding ceremony
                  </p>
                </div>

                {/* Scratch date card */}
                <div className="max-w-56 mx-auto w-full">
                  <PreviewScratchCard date={formattedDate} primaryColor={invitationData.primaryColor} />
                </div>

                {/* Countdown */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">The Celebration</h4>
                  <div className="grid grid-cols-4 gap-1.5 max-w-52 mx-auto">
                    {[
                      { v: "99", l: "Days" },
                      { v: "18", l: "Hrs" },
                      { v: "32", l: "Mins" },
                      { v: "10", l: "Secs" }
                    ].map(({ v, l }) => (
                      <div key={l} className="bg-white border border-zinc-200/60 rounded-lg p-1.5 flex flex-col items-center">
                        <span className="font-serif text-sm font-semibold" style={{ color: invitationData.primaryColor }}>{v}</span>
                        <span className="text-[7px] uppercase tracking-widest text-zinc-400">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Schedule details */}
                <div className="space-y-3.5 border-t border-zinc-200/50 pt-8 text-left">
                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold text-center mb-2">Schedule</h4>
                  <div className="bg-white/80 border border-zinc-200/50 p-4 rounded-xl space-y-1.5">
                    <h5 className="font-serif text-xs font-semibold text-zinc-800">Wedding Ceremony</h5>
                    <p className="text-[10px] text-zinc-500">⏰ Time: {invitationData.time || "18:00 PM"}</p>
                    <p className="text-[10px] text-zinc-500">📍 Venue: {invitationData.venueName || "Grand Palace"}</p>
                    <p className="text-[10px] text-zinc-500 max-w-44 truncate">🏢 Addr: {invitationData.venueAddress || "Mumbai, MH"}</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
