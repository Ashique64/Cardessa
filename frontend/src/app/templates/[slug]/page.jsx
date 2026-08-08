"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";

// ─── Scratch Card Sub-component ───
function ScratchCard({ onReveal }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set high-DPI scaling
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with matte gold texture gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#D4AF37");
    grad.addColorStop(0.5, "#F3E5AB");
    grad.addColorStop(1, "#AA7C11");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add luxury overlay pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 40, canvas.height);
      ctx.stroke();
    }

    // Text instructions
    ctx.fillStyle = "#4a3c10";
    ctx.font = "italic bold 13px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to Reveal Date", canvas.width / 2, canvas.height / 2);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check if scratched enough to reveal
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    const percent = (transparent / (canvas.width * canvas.height)) * 100;
    if (percent > 45 && !isRevealed) {
      setIsRevealed(true);
      if (onReveal) onReveal();
    }
  };

  const handleMouseMove = (e) => {
    if (e.buttons !== 1 && !e.touches) return;
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  return (
    <div ref={containerRef} className="relative w-full h-36 bg-amber-50/20 border border-brand-accent/20 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
      {/* Target Content underneath */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/90 p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-1">Save The Date</span>
        <p className="font-serif text-2xl font-light text-brand-dark tracking-wide">NOVEMBER 15, 2026</p>
        <p className="text-[10px] text-brand-text-muted/70 uppercase tracking-widest mt-1">Mumbai, Maharashtra</p>
      </div>

      {/* Gold Scratchable Canvas */}
      <motion.canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        animate={isRevealed ? { opacity: 0, pointerEvents: "none" } : {}}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 cursor-crosshair touch-none"
      />
    </div>
  );
}

// ─── Main Template Demo Component ───
export default function TemplateDemoPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Invitation interaction states
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  const audioRef = useRef(null);

  // Initialize Countdown target date (15 Nov 2026)
  useEffect(() => {
    const target = new Date("2026-11-15T18:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff < 0) {
        clearInterval(interval);
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Play/Mute toggle
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  const handleOpenInvite = () => {
    setIsOpen(true);
    // Auto play music on open cover
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    }
  };

  const handleUseDesign = async () => {
    if (!user) {
      router.push(`/login`);
      return;
    }
    if (user.is_superuser || user.is_staff) {
      router.push(`/editor/${slug}`);
      return;
    }
    setLoading(true);
    try {
      const res = await ordersApi.checkPlan();
      if (res.data.has_plan) {
        router.push(`/editor/${slug}`);
      } else {
        router.push("/pricing");
      }
    } catch {
      router.push("/pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4F0] text-brand-dark flex flex-col justify-between overflow-x-hidden font-sans select-none relative">
      
      {/* Background ambient music track */}
      <audio
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        loop
      />

      {/* Floating Header Actions */}
      <div className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        <Link
          href="/templates"
          className="pointer-events-auto bg-white/90 backdrop-blur-xs border border-brand-border/60 text-brand-dark hover:text-brand-accent px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition shadow-xs"
        >
          ← Back
        </Link>

        <div className="flex items-center gap-3 pointer-events-auto">
          {isOpen && (
            <button
              onClick={toggleAudio}
              className="h-9 w-9 rounded-full bg-white/90 border border-brand-border flex items-center justify-center text-brand-dark hover:bg-brand-accent hover:text-white transition duration-300 shadow-xs"
              aria-label={isMuted ? "Unmute music" : "Mute music"}
            >
              {isMuted ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              )}
            </button>
          )}

          <button
            onClick={handleUseDesign}
            disabled={loading}
            className="bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-widest transition duration-300 shadow-sm disabled:opacity-50"
          >
            {loading ? "Checking..." : "Use Design"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {/* ── Cover Envelope Screen ── */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: [0.85, 0, 0.15, 1] }}
            className="fixed inset-0 bg-[#F6F4F0] z-50 flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Elegant double border frame */}
            <div className="absolute inset-4 border border-brand-accent/10 rounded-3xl pointer-events-none" />
            <div className="absolute inset-5 border border-brand-accent/25 rounded-3xl pointer-events-none" />

            <div className="max-w-md w-full space-y-12">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-accent">Wedding Announcement</span>
                <h1 className="font-serif text-5xl font-light text-brand-dark leading-snug tracking-wide">
                  Rahul <br />
                  <span className="italic font-normal text-brand-accent font-serif">&amp;</span> <br />
                  Priya
                </h1>
              </div>

              {/* Pulsing Monogram Seal */}
              <div className="flex flex-col items-center justify-center gap-4">
                <button
                  onClick={handleOpenInvite}
                  className="h-20 w-20 rounded-full bg-radial from-[#dfca8d] to-[#b39546] border-2 border-white/60 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition duration-300 cursor-pointer relative"
                  aria-label="Open invitation"
                >
                  <span className="absolute inset-0 rounded-full border border-brand-accent/40 animate-ping opacity-60 pointer-events-none" />
                  <span className="font-serif text-2xl font-bold tracking-widest">RP</span>
                </button>
                <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text-muted animate-pulse">Open Invitation</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Invitation Scroll Content ── */}
      <div className="flex-1 flex flex-col items-center">
        {/* Parallax Hero Card */}
        <section className="min-h-screen w-full max-w-xl bg-white border-x border-brand-border/40 shadow-xs flex flex-col justify-between p-12 relative overflow-hidden">
          {/* Botanical corners */}
          <div className="absolute top-8 left-8 text-2xl text-brand-accent/20">⚜</div>
          <div className="absolute top-8 right-8 text-2xl text-brand-accent/20">⚜</div>
          <div className="absolute bottom-8 left-8 text-2xl text-brand-accent/20">⚜</div>
          <div className="absolute bottom-8 right-8 text-2xl text-brand-accent/20">⚜</div>

          <div className="text-center my-auto space-y-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">Save The Date</span>
            
            <div className="space-y-4">
              <h1 className="font-serif text-6xl font-light text-brand-dark tracking-wide">
                Rahul <br />
                <span className="italic font-normal font-serif text-brand-accent">&amp;</span> <br />
                Priya
              </h1>
              <p className="text-sm text-brand-text-muted italic max-w-xs mx-auto">
                Together with their families, invite you to celebrate their wedding.
              </p>
            </div>

            {/* Interactive Scratch-to-reveal Date */}
            <div className="max-w-xs mx-auto pt-6">
              <ScratchCard />
            </div>
          </div>

          <div className="text-center text-[10px] text-brand-text-muted uppercase tracking-widest">
            Scroll down to view details
          </div>
        </section>

        {/* Countdown Section */}
        <section className="w-full max-w-xl bg-white border-x border-brand-border/40 px-12 py-20 text-center border-t border-brand-border/20">
          <h2 className="font-serif text-3xl font-light text-brand-dark mb-10 tracking-wide">
            The <span className="italic font-normal">Countdown</span>
          </h2>
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {[
              { val: countdown.days, lbl: "Days" },
              { val: countdown.hours, lbl: "Hours" },
              { val: countdown.mins, lbl: "Mins" },
              { val: countdown.secs, lbl: "Secs" },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="bg-brand-bg border border-brand-border/60 rounded-xl p-3 flex flex-col items-center shadow-2xs">
                <span className="font-serif text-2xl font-semibold text-brand-accent">{val}</span>
                <span className="text-[9px] uppercase tracking-wider text-brand-text-muted mt-1">{lbl}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Schedule of Events */}
        <section className="w-full max-w-xl bg-white border-x border-brand-border/40 px-12 py-20 border-t border-brand-border/20 space-y-12">
          <h2 className="font-serif text-3xl font-light text-brand-dark text-center tracking-wide">
            Event <span className="italic font-normal">Schedule</span>
          </h2>

          <div className="space-y-6">
            {[
              {
                title: "Wedding Ceremony",
                time: "06:00 PM onwards",
                venue: "Royal Grand Ballroom",
                dress: "Traditional Indian / Ethic Wear",
              },
              {
                title: "Reception Dinner",
                time: "08:30 PM onwards",
                venue: "Grand Lawn & Pavilions",
                dress: "Black Tie / Formal Suit",
              },
            ].map((evt) => (
              <div key={evt.title} className="bg-brand-bg-soft/20 border border-brand-border/40 p-6 rounded-2xl hover:border-brand-accent/30 transition duration-300">
                <h3 className="font-serif text-xl font-medium text-brand-dark">{evt.title}</h3>
                <div className="h-px bg-brand-border/40 my-3" />
                <div className="space-y-2 text-xs text-brand-text-muted">
                  <p>⏰ <strong className="text-brand-dark font-medium ml-1">Time:</strong> {evt.time}</p>
                  <p>📍 <strong className="text-brand-dark font-medium ml-1">Venue:</strong> {evt.venue}</p>
                  <p>👔 <strong className="text-brand-dark font-medium ml-1">Dress Code:</strong> {evt.dress}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Location */}
        <section className="w-full max-w-xl bg-white border-x border-brand-border/40 px-12 py-20 border-t border-brand-border/20 space-y-8">
          <h2 className="font-serif text-3xl font-light text-brand-dark text-center tracking-wide">
            The <span className="italic font-normal">Location</span>
          </h2>
          
          <div className="h-60 bg-zinc-100 rounded-2xl overflow-hidden border border-brand-border shadow-2xs relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.797223707784!2d72.8997232!3d19.0726487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c627a20b1243%3A0x64e03d36b801a610!2sGrand%20Hyatt%20Mumbai%20Hotel%20%26%20Residences!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="text-center">
            <p className="text-xs text-brand-text-muted max-w-xs mx-auto mb-6">
              Grand Hyatt Mumbai Hotel & Residences, Bandra Kurla Complex Vicinity, Santacruz East, Mumbai.
            </p>
            <a
              href="https://maps.app.goo.gl/3be7c627a20b1243"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-widest transition duration-300 shadow-sm"
            >
              Navigate in Maps
            </a>
          </div>
        </section>

        {/* RSVP Form */}
        <section className="w-full max-w-xl bg-white border-x border-brand-border/40 px-12 py-20 border-t border-brand-border/20 space-y-8 pb-28">
          <h2 className="font-serif text-3xl font-light text-brand-dark text-center tracking-wide">
            Confirm <span className="italic font-normal">Attendance</span>
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); alert("RSVP submitted successfully!"); }} className="space-y-4 max-w-sm mx-auto">
            <input
              type="text"
              required
              placeholder="Your Full Name"
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
            />
            <select
              required
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
            >
              <option value="">Will you attend?</option>
              <option value="yes">Accept with pleasure</option>
              <option value="no">Decline with regret</option>
            </select>
            <button
              type="submit"
              className="w-full bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition duration-300 shadow-sm cursor-pointer"
            >
              Send RSVP
            </button>
          </form>
        </section>
      </div>

      <footer className="text-center text-[10px] text-brand-text-muted/60 py-8 border-t border-brand-border/20 max-w-xl mx-auto w-full">
        Made with Cardessa Premium Digital Invitations
      </footer>
    </div>
  );
}
