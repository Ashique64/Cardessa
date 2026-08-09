"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simple scratch card helper for Floral Arch if needed, or simple direct date presentation
function DateBadge({ date, accentColor }) {
  return (
    <div
      className="p-6 rounded-2xl border-2 border-dashed text-center bg-stone-50/50 backdrop-blur-xs max-w-xs mx-auto"
      style={{ borderColor: `${accentColor}40` }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Save The Date</span>
      <p className="font-serif text-3xl font-light text-stone-800 my-2">{date}</p>
      <span className="text-[9px] uppercase tracking-wider text-stone-500">For The Wedding Ceremony</span>
    </div>
  );
}

export default function FloralArch({ content = {}, mode = "live", onRsvpSubmit, hideBranding = false }) {
  const isLive = mode === "live";
  const isPreOpen = mode === "preview" || mode === "editor";

  // Resolve content fields with sensible fallbacks
  const groomName = content.groom_name || "Aarav";
  const brideName = content.bride_name || "Ananya";
  const venue = content.venue_name || "Heritage Garden Pavilion";
  const venueAddress = content.venue_address || "Ecr Road, Chennai, TN";
  const accentColor = content.accent_color || "#7A8B6F"; // Soft botanical green
  const bgColor = content.bg_color || "#FAF8F5"; // Warm linen
  const musicUrl = content.music_url || null;
  const musicEnabled = content.music_enabled !== false;
  const couplePhoto = content.couple_photo || null;

  const rawDate = content.event_date || null;
  const displayDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : "December 18, 2026";
  const displayTime = content.event_time ? `${content.event_time}` : "10:30 AM";
  const initials = (groomName[0] || "") + (brideName[0] || "");

  // Cover / audio state
  const [isOpen, setIsOpen] = useState(isPreOpen);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  // Countdown
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!rawDate) return;
    const target = new Date(`${rawDate}T10:30:00`).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff < 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rawDate]);

  // RSVP Form state
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
      className="min-h-screen text-stone-900 flex flex-col justify-between overflow-x-hidden font-sans select-none relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background music */}
      {musicEnabled && musicUrl && (
        <audio ref={audioRef} src={musicUrl} loop />
      )}

      {/* Floating sound toggle */}
      {isOpen && musicEnabled && musicUrl && (
        <div className="fixed top-6 right-6 z-45">
          <button
            onClick={toggleAudio}
            className="h-9 w-9 rounded-full bg-white/95 border border-stone-200 flex items-center justify-center text-stone-900 shadow-sm cursor-pointer"
            style={{ backgroundColor: isMuted ? "#ffffff" : accentColor, color: isMuted ? "#1c1917" : "#ffffff" }}
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
        {/* ── Cover Screen ── */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none"
            style={{ backgroundColor: bgColor }}
          >
            {/* Elegant botanical Arch illustration/SVG */}
            <div className="absolute inset-8 rounded-full border border-dashed pointer-events-none opacity-40" style={{ borderColor: accentColor }} />

            <div className="max-w-md w-full space-y-12 relative z-10">
              <div className="space-y-6">
                <div className="text-3xl" style={{ color: accentColor }}>🌿</div>
                <span className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                  The Wedding Celebration
                </span>
                <h1 className="font-serif text-5xl font-light text-stone-800 leading-snug tracking-wide">
                  {groomName} <br />
                  <span className="italic font-normal font-serif text-stone-400">&amp;</span> <br />
                  {brideName}
                </h1>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleOpenInvite}
                  className="h-20 w-20 rounded-full border-2 border-white/80 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition duration-300 cursor-pointer"
                  style={{ background: `radial-gradient(circle, ${accentColor}cc, ${accentColor})` }}
                  aria-label="Open invitation"
                >
                  <span className="font-serif text-2xl font-bold tracking-widest">{initials}</span>
                </button>
                <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 animate-pulse">
                  Enter Celebration
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Scroll Content ── */}
      <div className="flex-1 flex flex-col items-center">
        {/* Arch Hero Section */}
        <section className="min-h-screen w-full max-w-xl bg-white border-x border-stone-200/60 shadow-xs flex flex-col justify-between p-12 relative overflow-hidden">
          
          {/* Animated growing Arch border */}
          <div className="absolute inset-8 border-t-4 border-x-4 rounded-t-full pointer-events-none opacity-20" style={{ borderColor: accentColor }} />
          <div className="absolute inset-10 border-t-2 border-x-2 rounded-t-full pointer-events-none opacity-40" style={{ borderColor: accentColor }} />

          <div className="text-center my-auto space-y-10 pt-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
              Join Us For The Wedding Of
            </span>

            <div className="space-y-4">
              <h1 className="font-serif text-5xl font-light text-stone-850 tracking-wide">
                {groomName} <br />
                <span className="italic font-normal font-serif" style={{ color: accentColor }}>&amp;</span> <br />
                {brideName}
              </h1>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold max-w-xs mx-auto">
                Together with their beloved families
              </p>
            </div>

            {couplePhoto && (
              <div className="max-w-xs mx-auto rounded-t-full overflow-hidden shadow-md border-4 border-white">
                <img src={couplePhoto} alt="Couple" className="w-full h-64 object-cover" />
              </div>
            )}

            <div className="max-w-xs mx-auto pt-4">
              <DateBadge date={displayDate} accentColor={accentColor} />
            </div>
          </div>

          <div className="text-center text-[10px] text-stone-400 uppercase tracking-widest pt-6">
            Scroll to see celebration schedule
          </div>
        </section>

        {/* Countdown */}
        <section className="w-full max-w-xl bg-white border-x border-t border-stone-200/40 px-12 py-16 text-center">
          <h2 className="font-serif text-2xl font-light text-stone-800 mb-8 tracking-wide">
            The Botanical <span className="italic font-normal">Countdown</span>
          </h2>
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {[
              { val: countdown.days, lbl: "Days" },
              { val: countdown.hours, lbl: "Hours" },
              { val: countdown.mins, lbl: "Mins" },
              { val: countdown.secs, lbl: "Secs" },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="bg-stone-50 border border-stone-150 rounded-xl p-3 flex flex-col items-center shadow-2xs">
                <span className="font-serif text-2xl font-semibold" style={{ color: accentColor }}>{val}</span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 mt-1">{lbl}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Event Schedule */}
        <section className="w-full max-w-xl bg-white border-x border-t border-stone-200/40 px-12 py-16 space-y-10">
          <h2 className="font-serif text-2xl font-light text-stone-800 text-center tracking-wide">
            Ceremony &amp; <span className="italic font-normal">Celebrations</span>
          </h2>
          <div className="space-y-6">
            {[
              { title: "Main Wedding Ceremony", time: displayTime, dress: "Ethnic traditional attire" },
              { title: "Gala Feast", time: "12:30 PM onwards", dress: "Ethnic / Formal" },
            ].map((evt) => (
              <div key={evt.title} className="bg-stone-50/40 border border-stone-200/60 p-6 rounded-2xl">
                <h3 className="font-serif text-lg font-medium text-stone-800">{evt.title}</h3>
                <div className="h-px bg-stone-200/60 my-3" />
                <div className="space-y-2 text-xs text-stone-500">
                  <p>⏰ <strong>Time:</strong> {evt.time}</p>
                  <p>📍 <strong>Venue:</strong> {venue}</p>
                  <p>👔 <strong>Dress Code:</strong> {evt.dress}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location Map */}
        <section className="w-full max-w-xl bg-white border-x border-t border-stone-200/40 px-12 py-16 space-y-8">
          <h2 className="font-serif text-2xl font-light text-stone-800 text-center tracking-wide">
            Find <span className="italic font-normal">The Arch</span>
          </h2>
          <div className="h-60 bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 relative">
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
            <p className="text-xs text-stone-400 max-w-xs mx-auto mb-6">{venueAddress}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest shadow-sm transition"
              style={{ backgroundColor: accentColor }}
            >
              Get Directions
            </a>
          </div>
        </section>

        {/* RSVP Form */}
        {isLive && (
          <section className="w-full max-w-xl bg-white border-x border-t border-stone-200/40 px-12 py-16 space-y-8 pb-24">
            <h2 className="font-serif text-2xl font-light text-stone-850 text-center tracking-wide">
              Confirm <span className="italic font-normal">Attendance</span>
            </h2>

            {rsvpSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-stone-50 border border-stone-200 rounded-2xl max-w-sm mx-auto space-y-3"
              >
                <div className="h-10 w-10 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
                <h3 className="font-serif text-lg font-medium text-stone-800">You are Registered</h3>
                <p className="text-xs text-stone-550 leading-relaxed">Your response has been sent to Aarav and Ananya.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-sm mx-auto">
                {rsvpError && (
                  <div className="bg-red-50 border border-red-200 text-red-650 text-xs font-medium px-4 py-3 rounded-xl">{rsvpError}</div>
                )}
                <input
                  type="text" required placeholder="Guest Name"
                  value={rsvpData.guest_name}
                  onChange={(e) => setRsvpData({ ...rsvpData, guest_name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input type="email" placeholder="Email" value={rsvpData.email} onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                  <input type="tel" placeholder="Phone" value={rsvpData.phone} onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={rsvpData.status} onChange={(e) => setRsvpData({ ...rsvpData, status: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none">
                    <option value="attending">Will Attend</option>
                    <option value="declined">Will Decline</option>
                  </select>
                  <select value={rsvpData.guest_count} onChange={(e) => setRsvpData({ ...rsvpData, guest_count: parseInt(e.target.value) || 1 })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Blessings or comments…"
                  value={rsvpData.message}
                  onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                  rows="3"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
                <button
                  type="submit" disabled={rsvpLoading}
                  className="w-full text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: accentColor }}
                >
                  {rsvpLoading ? "Confirming…" : "Send Attendance"}
                </button>
              </form>
            )}
          </section>
        )}
      </div>

      {!hideBranding && (
        <footer className="text-center text-[10px] text-stone-400/60 py-8 border-t border-stone-100 max-w-xl mx-auto w-full">
          Made with Cardessa Floral Arch Theme
        </footer>
      )}
    </div>
  );
}
