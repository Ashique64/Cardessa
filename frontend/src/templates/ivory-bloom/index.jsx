"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Scratch Card ───────────────────────────────────────────────────────────
function ScratchCard({ date, accentColor }) {
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

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#D4AF37");
    grad.addColorStop(0.5, "#F3E5AB");
    grad.addColorStop(1, "#AA7C11");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 40, canvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = "#4a3c10";
    ctx.font = "italic bold 13px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to Reveal Date", canvas.width / 2, canvas.height / 2);
  }, [date]);

  const scratch = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 22, 0, Math.PI * 2);
    ctx.fill();

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    if ((transparent / (canvas.width * canvas.height)) * 100 > 45) {
      setIsRevealed(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-36 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${accentColor}33` }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/90 p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Save The Date</span>
        <p className="font-serif text-2xl font-light text-zinc-900 tracking-wide">{date}</p>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Wedding Day</p>
      </div>
      <motion.canvas
        ref={canvasRef}
        onMouseMove={(e) => e.buttons === 1 && scratch(e.clientX, e.clientY)}
        onTouchMove={(e) => scratch(e.touches[0].clientX, e.touches[0].clientY)}
        animate={isRevealed ? { opacity: 0, pointerEvents: "none" } : {}}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 cursor-crosshair touch-none"
      />
    </div>
  );
}

// ─── Ivory Bloom Template ────────────────────────────────────────────────────
/**
 * Ivory Bloom — the flagship Cardessa wedding invitation design.
 *
 * Props:
 *   content         {object}  — user content keyed by field_schema keys
 *   mode            {string}  — "preview" | "editor" | "live"
 *                               "preview"  → cover is pre-opened (no interaction needed for demos)
 *                               "editor"   → cover is pre-opened; RSVP form hidden
 *                               "live"     → full interactive experience (default)
 *   onRsvpSubmit    {fn}      — async (rsvpData) => void — only used in "live" mode
 */
export default function IvoryBloom({ content = {}, mode = "live", onRsvpSubmit, hideBranding = false }) {
  const isLive = mode === "live";
  const isPreOpen = mode === "preview" || mode === "editor";

  // Resolve content fields with sensible fallbacks
  const groomName    = content.groom_name    || "Rahul";
  const brideName    = content.bride_name    || "Priya";
  const venue        = content.venue_name    || "Grand Palace Resort";
  const venueAddress = content.venue_address || "Bypass Road, Mumbai, MH";
  const accentColor  = content.accent_color  || "#6B8E70";
  const bgColor      = content.bg_color      || "#F6F4F0";
  const musicUrl     = content.music_url     || null;
  const musicEnabled = content.music_enabled !== false;

  const rawDate     = content.event_date || null;
  const displayDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "November 15, 2026";
  const displayTime = content.event_time ? `${content.event_time}` : "06:00 PM";
  const initials    = (groomName[0] || "") + (brideName[0] || "");

  // Cover / audio state
  const [isOpen, setIsOpen] = useState(isPreOpen);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  // Countdown
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!rawDate) return;
    const target = new Date(`${rawDate}T18:00:00`).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff < 0) return;
      setCountdown({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rawDate]);

  // RSVP form state
  const [rsvpData, setRsvpData] = useState({
    guest_name: "", email: "", phone: "",
    status: "attending", guest_count: 1, message: "",
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  const handleOpenInvite = () => {
    setIsOpen(true);
    if (audioRef.current && musicEnabled) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isMuted) { audioRef.current.play().catch(() => {}); setIsMuted(false); }
    else { audioRef.current.pause(); setIsMuted(true); }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!onRsvpSubmit) return;
    setRsvpLoading(true);
    setRsvpError("");
    try {
      await onRsvpSubmit(rsvpData);
      setRsvpSubmitted(true);
    } catch (err) {
      setRsvpError(err?.message || "Failed to submit RSVP.");
    } finally {
      setRsvpLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-zinc-900 flex flex-col justify-between overflow-x-hidden font-sans select-none relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background music */}
      {musicEnabled && musicUrl && (
        <audio ref={audioRef} src={musicUrl} loop />
      )}

      {/* Floating sound toggle */}
      {isOpen && musicEnabled && musicUrl && (
        <div className="fixed top-6 right-6 z-40">
          <button
            onClick={toggleAudio}
            className="h-9 w-9 rounded-full bg-white/90 border border-zinc-200 flex items-center justify-center text-zinc-900 hover:text-white transition duration-300 shadow-sm cursor-pointer"
            style={{ ["--hover-bg"]: accentColor }}
            onMouseEnter={(e) => { e.currentTarget.style.background = accentColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#18181b"; }}
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
        </div>
      )}

      <AnimatePresence>
        {/* ── Cover Envelope ── */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: [0.85, 0, 0.15, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none"
            style={{ backgroundColor: bgColor }}
          >
            {/* Double border frame */}
            <div className="absolute inset-4 rounded-3xl pointer-events-none" style={{ border: `1px solid ${accentColor}1A` }} />
            <div className="absolute inset-5 rounded-3xl pointer-events-none" style={{ border: `1px solid ${accentColor}40` }} />

            <div className="max-w-md w-full space-y-12">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accentColor }}>
                  Wedding Announcement
                </span>
                <h1 className="font-serif text-5xl font-light text-zinc-900 leading-snug tracking-wide">
                  {groomName} <br />
                  <span className="italic font-normal font-serif" style={{ color: accentColor }}>&</span> <br />
                  {brideName}
                </h1>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleOpenInvite}
                  className="h-20 w-20 rounded-full border-2 border-white/60 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition duration-300 cursor-pointer relative"
                  style={{ background: `radial-gradient(circle, ${accentColor}dd, ${accentColor})` }}
                  aria-label="Open invitation"
                >
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-50 pointer-events-none"
                    style={{ border: `1px solid ${accentColor}` }}
                  />
                  <span className="font-serif text-2xl font-bold tracking-widest">{initials}</span>
                </button>
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 animate-pulse">
                  Open Invitation
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Scroll Content ── */}
      <div className="flex-1 flex flex-col items-center">

        {/* Hero Card */}
        <section className="min-h-screen w-full max-w-xl bg-white border-x border-zinc-200/60 shadow-sm flex flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute top-8 left-8 text-2xl opacity-20" style={{ color: accentColor }}>⚜</div>
          <div className="absolute top-8 right-8 text-2xl opacity-20" style={{ color: accentColor }}>⚜</div>
          <div className="absolute bottom-8 left-8 text-2xl opacity-20" style={{ color: accentColor }}>⚜</div>
          <div className="absolute bottom-8 right-8 text-2xl opacity-20" style={{ color: accentColor }}>⚜</div>

          <div className="text-center my-auto space-y-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>Save The Date</span>

            <div className="space-y-4">
              <h1 className="font-serif text-6xl font-light text-zinc-900 tracking-wide">
                {groomName} <br />
                <span className="italic font-normal font-serif" style={{ color: accentColor }}>&</span> <br />
                {brideName}
              </h1>
              <p className="text-sm text-zinc-500 italic max-w-xs mx-auto">
                Together with their families, invite you to celebrate their wedding.
              </p>
            </div>

            <div className="max-w-xs mx-auto pt-6">
              <ScratchCard date={displayDate} accentColor={accentColor} />
            </div>
          </div>

          <div className="text-center text-[10px] text-zinc-400 uppercase tracking-widest">
            Scroll down to view details
          </div>
        </section>

        {/* Countdown */}
        <section className="w-full max-w-xl bg-white border-x border-t border-zinc-200/40 px-12 py-20 text-center">
          <h2 className="font-serif text-3xl font-light text-zinc-900 mb-10 tracking-wide">
            The <span className="italic font-normal">Countdown</span>
          </h2>
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {[
              { val: countdown.days, lbl: "Days" },
              { val: countdown.hours, lbl: "Hours" },
              { val: countdown.mins, lbl: "Mins" },
              { val: countdown.secs, lbl: "Secs" },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex flex-col items-center shadow-xs">
                <span className="font-serif text-2xl font-semibold" style={{ color: accentColor }}>{val}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 mt-1">{lbl}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Event Schedule */}
        <section className="w-full max-w-xl bg-white border-x border-t border-zinc-200/40 px-12 py-20 space-y-12">
          <h2 className="font-serif text-3xl font-light text-zinc-900 text-center tracking-wide">
            Event <span className="italic font-normal">Schedule</span>
          </h2>
          <div className="space-y-6">
            {[
              { title: "Wedding Ceremony", time: displayTime, dress: "Traditional Indian / Ethnic Wear" },
              { title: "Reception Dinner",  time: "08:30 PM onwards", dress: "Black Tie / Formal" },
            ].map((evt) => (
              <div key={evt.title} className="bg-zinc-50/50 border border-zinc-200/60 p-6 rounded-2xl transition duration-300" style={{ ["--hover-border"]: accentColor }}>
                <h3 className="font-serif text-xl font-medium text-zinc-900">{evt.title}</h3>
                <div className="h-px bg-zinc-200/60 my-3" />
                <div className="space-y-2 text-xs text-zinc-500">
                  <p>⏰ <strong className="text-zinc-700 font-medium ml-1">Time:</strong> {evt.time}</p>
                  <p>📍 <strong className="text-zinc-700 font-medium ml-1">Venue:</strong> {venue}</p>
                  <p>👔 <strong className="text-zinc-700 font-medium ml-1">Dress Code:</strong> {evt.dress}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Location */}
        <section className="w-full max-w-xl bg-white border-x border-t border-zinc-200/40 px-12 py-20 space-y-8">
          <h2 className="font-serif text-3xl font-light text-zinc-900 text-center tracking-wide">
            The <span className="italic font-normal">Location</span>
          </h2>
          <div className="h-60 bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 shadow-xs relative">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(venueAddress)}`}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6">{venueAddress}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-widest transition duration-300 shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              Navigate in Maps
            </a>
          </div>
        </section>

        {/* RSVP Form — hidden in editor/preview mode */}
        {isLive && (
          <section className="w-full max-w-xl bg-white border-x border-t border-zinc-200/40 px-12 py-20 space-y-8 pb-28">
            <h2 className="font-serif text-3xl font-light text-zinc-900 text-center tracking-wide">
              Confirm <span className="italic font-normal">Attendance</span>
            </h2>

            {rsvpSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-zinc-50 border border-zinc-200 rounded-2xl max-w-sm mx-auto space-y-3"
              >
                <div className="h-10 w-10 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
                <h3 className="font-serif text-xl font-medium text-zinc-900">Thank You!</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">Your RSVP has been sent to the couple.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-sm mx-auto">
                {rsvpError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-3 rounded-xl">{rsvpError}</div>
                )}
                <input
                  type="text" required placeholder="Your Full Name"
                  value={rsvpData.guest_name}
                  onChange={(e) => setRsvpData({ ...rsvpData, guest_name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1"
                  style={{ ["--tw-ring-color"]: accentColor }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input type="email" placeholder="Email (Optional)" value={rsvpData.email} onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                  <input type="tel" placeholder="Phone (Optional)" value={rsvpData.phone} onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={rsvpData.status} onChange={(e) => setRsvpData({ ...rsvpData, status: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none">
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                  <select value={rsvpData.guest_count} onChange={(e) => setRsvpData({ ...rsvpData, guest_count: parseInt(e.target.value) || 1 })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Short blessing or message for the couple…"
                  value={rsvpData.message}
                  onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                  rows="3"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
                <button
                  type="submit" disabled={rsvpLoading}
                  className="w-full text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: accentColor }}
                >
                  {rsvpLoading ? "Sending RSVP…" : "Send RSVP"}
                </button>
              </form>
            )}
          </section>
        )}
      </div>

      {!hideBranding && (
        <footer className="text-center text-[10px] text-zinc-400/60 py-8 border-t border-zinc-200/20 max-w-xl mx-auto w-full">
          Made with <span style={{ color: accentColor }}>Cardessa</span> Premium Digital Invitations
        </footer>
      )}
    </div>
  );
}
