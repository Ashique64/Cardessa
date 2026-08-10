"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom premium motion section component
function RevealSection({ children, className = "", delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.95, delay, ease: [0.215, 0.61, 0.355, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function FloralArch({ content = {}, mode = "live", onRsvpSubmit, hideBranding = false }) {
  const isLive = mode === "live";
  const isPreOpen = mode === "preview" || mode === "editor";

  // Resolve content fields with sensible elegant fallbacks
  const groomName = content.groom_name || "Aarav";
  const brideName = content.bride_name || "Ananya";
  const venue = content.venue_name || "Heritage Garden Pavilion";
  const venueAddress = content.venue_address || "Ecr Road, Chennai, TN";
  const musicUrl = content.music_url || null;
  const musicEnabled = content.music_enabled !== false;
  const couplePhoto = content.couple_photo || null;

  // Custom Palette variables
  const ivory = "#FBF7EF";       // base background
  const parchment = "#F3E9D4";   // card/section backgrounds
  const gold = "#C9A66B";        // accents, dividers, borders
  const goldDeep = "#9C7A3C";    // emphasis
  const sage = "#6E7F5C";        // botanical theme color
  const ink = "#2B2620";         // high contrast near-black text

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
      className="min-h-screen flex flex-col justify-between overflow-x-hidden select-none relative font-sans"
      style={{ backgroundColor: ivory, color: ink }}
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
            className="h-10 w-10 rounded-full border flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ 
              backgroundColor: isMuted ? ivory : sage, 
              borderColor: gold,
              color: isMuted ? ink : ivory
            }}
            aria-label={isMuted ? "Unmute music" : "Mute music"}
          >
            {isMuted ? (
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
              </svg>
            ) : (
              <svg className="h-4.5 w-4.5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
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
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none"
            style={{ backgroundColor: ivory }}
          >
            {/* Elegant Double Arch Frame */}
            <div className="absolute inset-6 sm:inset-10 border border-dashed rounded-t-full pointer-events-none opacity-30" style={{ borderColor: gold }} />
            <div className="absolute inset-8 sm:inset-12 border rounded-t-full pointer-events-none opacity-20" style={{ borderColor: gold }} />

            <div className="max-w-md w-full space-y-12 relative z-10">
              <div className="space-y-6">
                <div className="text-3xl animate-bounce" style={{ color: sage }}>🌿</div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-sans block" style={{ color: goldDeep }}>
                  The Wedding Celebration
                </span>
                <h1 className="font-serif text-5xl font-extralight leading-snug tracking-wide" style={{ color: ink }}>
                  {groomName} <br />
                  <span className="italic font-normal font-serif text-3xl opacity-60" style={{ color: goldDeep }}>&amp;</span> <br />
                  {brideName}
                </h1>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleOpenInvite}
                  className="h-20 w-20 rounded-full border-2 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition duration-300 cursor-pointer"
                  style={{ 
                    borderColor: ivory,
                    background: `radial-gradient(circle, ${sage}ee, ${sage})`
                  }}
                  aria-label="Open invitation"
                >
                  <span className="font-serif text-xl font-medium tracking-widest">{initials}</span>
                </button>
                <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 animate-pulse">
                  Open Invitation
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Scroll Content ── */}
      <div className="flex-1 flex flex-col items-center">
        {/* Arch Hero Section */}
        <section className="min-h-screen w-full max-w-xl bg-[#FBF7EF] border-x border-[#FAF5EC] flex flex-col justify-between p-8 relative overflow-hidden">
          {/* Classical Arch Illustration SVG Overlay */}
          <div className="absolute inset-6 border border-dashed rounded-t-full pointer-events-none opacity-20" style={{ borderColor: gold }} />
          
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[85%] max-w-sm pointer-events-none opacity-25">
            <svg viewBox="0 0 100 150" fill="none" stroke={gold} strokeWidth="0.4" className="w-full">
              <path d="M10,150 L10,50 A40,40 0 0,1 90,50 L90,150" />
              <path d="M15,150 L15,50 A35,35 0 0,1 85,50 L85,150" />
              <path d="M10,50 C25,45 75,45 90,50" />
              <circle cx="50" cy="12" r="2" fill={gold} />
              <path d="M50,14 L50,22 M46,18 L54,18" />
            </svg>
          </div>

          <div className="text-center my-auto space-y-12 pt-28 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-sans block" style={{ color: goldDeep }}>
              SAVE THE DATE
            </span>

            <div className="space-y-4">
              <h1 className="font-serif text-6xl font-light tracking-wide" style={{ color: ink }}>
                {groomName} <br />
                <span className="italic font-normal font-serif text-4xl block my-2" style={{ color: sage }}>&amp;</span>
                {brideName}
              </h1>
              <p className="text-[11px] text-stone-500 uppercase tracking-widest font-medium max-w-xs mx-auto">
                Together with their families
              </p>
            </div>

            <div className="max-w-[240px] mx-auto rounded-t-full overflow-hidden shadow-2xl border-4 border-white transition hover:scale-[1.01] duration-500 bg-[#F3E9D4]/50 flex items-center justify-center h-72 relative">
              {couplePhoto ? (
                <img src={couplePhoto} alt="Couple" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-[#9C7A3C]/50 space-y-2 select-none">
                  <span className="text-3xl">📷</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Couple Photo Frame</span>
                </div>
              )}
            </div>

            <div className="max-w-xs mx-auto pt-6">
              <div
                className="p-6 border border-solid text-center shadow-xs"
                style={{ 
                  backgroundColor: parchment, 
                  borderColor: gold,
                  boxShadow: `0 4px 20px rgba(156, 122, 60, 0.08)`
                }}
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] block" style={{ color: goldDeep }}>The Ceremony</span>
                <p className="font-serif text-3xl font-light my-2.5" style={{ color: ink }}>{displayDate}</p>
                <span className="text-[9px] uppercase tracking-wider text-stone-500 font-sans block">{displayTime}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] text-stone-400 uppercase tracking-[0.25em] pt-6 animate-pulse">
            Scroll to view details
          </div>
        </section>

        {/* Countdown */}
        <RevealSection className="w-full max-w-xl bg-[#FBF7EF] border-x border-t border-stone-200/30 px-12 py-20 text-center">
          <h2 className="font-serif text-3xl font-light mb-8 tracking-wide" style={{ color: ink }}>
            The Botanical <span className="italic font-normal">Countdown</span>
          </h2>
          <div className="grid grid-cols-4 gap-3.5 max-w-xs mx-auto">
            {[
              { val: countdown.days, lbl: "Days" },
              { val: countdown.hours, lbl: "Hours" },
              { val: countdown.mins, lbl: "Mins" },
              { val: countdown.secs, lbl: "Secs" },
            ].map(({ val, lbl }) => (
              <div 
                key={lbl} 
                className="border p-3.5 flex flex-col items-center shadow-sm"
                style={{ 
                  backgroundColor: parchment, 
                  borderColor: `${gold}40`,
                  boxShadow: `0 4px 16px rgba(156, 122, 60, 0.06)`
                }}
              >
                <span className="font-serif text-3xl font-light" style={{ color: goldDeep }}>{val}</span>
                <span className="text-[9px] uppercase tracking-widest font-semibold mt-1" style={{ color: sage }}>{lbl}</span>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* Event Schedule */}
        <RevealSection className="w-full max-w-xl bg-[#FBF7EF] border-x border-t border-stone-200/30 px-8 py-20 space-y-12">
          <h2 className="font-serif text-3xl font-light text-center tracking-wide" style={{ color: ink }}>
            Ceremony &amp; <span className="italic font-normal">Celebrations</span>
          </h2>
          <div className="space-y-6">
            {[
              { title: "Main Wedding Ceremony", time: displayTime, dress: "Ethnic traditional attire" },
              { title: "Gala Feast", time: "12:30 PM onwards", dress: "Ethnic / Formal" },
            ].map((evt) => (
              <div 
                key={evt.title} 
                className="border p-8 shadow-xs relative overflow-hidden"
                style={{ 
                  backgroundColor: parchment, 
                  borderColor: gold,
                  boxShadow: `0 6px 24px rgba(156, 122, 60, 0.1)`
                }}
              >
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: sage }} />
                <h3 className="font-serif text-xl font-medium" style={{ color: ink }}>{evt.title}</h3>
                <div className="h-px bg-stone-200/60 my-4" />
                <div className="space-y-2.5 text-xs text-stone-600">
                  <p>⏰ <strong className="text-stone-850 font-medium ml-1">Time:</strong> {evt.time}</p>
                  <p>📍 <strong className="text-stone-850 font-medium ml-1">Venue:</strong> {venue}</p>
                  <p>👔 <strong className="text-stone-850 font-medium ml-1">Dress Code:</strong> {evt.dress}</p>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* Location Map */}
        <RevealSection className="w-full max-w-xl bg-[#FBF7EF] border-x border-t border-stone-200/30 px-12 py-20 space-y-8">
          <h2 className="font-serif text-3xl font-light text-center tracking-wide" style={{ color: ink }}>
            Find <span className="italic font-normal">The Arch</span>
          </h2>
          <div 
            className="h-64 rounded-sm overflow-hidden border relative"
            style={{ borderColor: gold }}
          >
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(venueAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="text-center space-y-6">
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">{venueAddress}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-bold py-3.5 px-8 rounded-none text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
              style={{ backgroundColor: sage }}
            >
              Get Directions
            </a>
          </div>
        </RevealSection>

        {/* RSVP Form */}
        {isLive && (
          <RevealSection className="w-full max-w-xl bg-[#FBF7EF] border-x border-t border-stone-200/30 px-12 py-20 space-y-8 pb-28">
            <h2 className="font-serif text-3xl font-light text-center tracking-wide" style={{ color: ink }}>
              Confirm <span className="italic font-normal">Attendance</span>
            </h2>

            {rsvpSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 border max-w-sm mx-auto space-y-4"
                style={{ backgroundColor: parchment, borderColor: gold }}
              >
                <div className="h-10 w-10 bg-emerald-55/15 border border-emerald-250 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
                <h3 className="font-serif text-xl font-medium" style={{ color: ink }}>You are Registered</h3>
                <p className="text-xs text-stone-500 leading-relaxed">Your response has been sent to the wedding organizer.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-sm mx-auto font-sans">
                {rsvpError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-none">{rsvpError}</div>
                )}
                <input
                  type="text" required placeholder="Guest Name"
                  value={rsvpData.guest_name}
                  onChange={(e) => setRsvpData({ ...rsvpData, guest_name: e.target.value })}
                  className="w-full bg-white border rounded-none px-4 py-3.5 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition"
                  style={{ borderColor: `${gold}60` }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input type="email" placeholder="Email" value={rsvpData.email} onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })} className="w-full bg-white border rounded-none px-4 py-3.5 text-sm placeholder-stone-400 focus:outline-none transition" style={{ borderColor: `${gold}60` }} />
                  <input type="tel" placeholder="Phone" value={rsvpData.phone} onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })} className="w-full bg-white border rounded-none px-4 py-3.5 text-sm placeholder-stone-400 focus:outline-none transition" style={{ borderColor: `${gold}60` }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={rsvpData.status} onChange={(e) => setRsvpData({ ...rsvpData, status: e.target.value })} className="w-full bg-white border rounded-none px-4 py-3.5 text-sm focus:outline-none transition" style={{ borderColor: `${gold}60` }}>
                    <option value="attending">Will Attend</option>
                    <option value="declined">Will Decline</option>
                  </select>
                  <select value={rsvpData.guest_count} onChange={(e) => setRsvpData({ ...rsvpData, guest_count: parseInt(e.target.value) || 1 })} className="w-full bg-white border rounded-none px-4 py-3.5 text-sm focus:outline-none transition" style={{ borderColor: `${gold}60` }}>
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
                  className="w-full bg-white border rounded-none px-4 py-3.5 text-sm placeholder-stone-400 focus:outline-none transition"
                  style={{ borderColor: `${gold}60` }}
                />
                <button
                  type="submit" disabled={rsvpLoading}
                  className="w-full text-white font-bold py-4 rounded-none text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: sage }}
                >
                  {rsvpLoading ? "Confirming…" : "Send Attendance"}
                </button>
              </form>
            )}
          </RevealSection>
        )}
      </div>

      {!hideBranding && (
        <footer className="text-center text-[10px] uppercase tracking-widest py-8 border-t max-w-xl mx-auto w-full" style={{ borderColor: `${gold}20`, color: goldDeep }}>
          Made with Cardessa Floral Arch Theme
        </footer>
      )}
    </div>
  );
}
