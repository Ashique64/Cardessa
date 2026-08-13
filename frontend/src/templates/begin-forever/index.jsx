"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom dynamic calendar component for Begin Forever
function WeddingCalendar({ date, accentColor }) {
  const dateObj = date ? new Date(date) : new Date("2026-08-12");
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = monthNames[month];

  // Calculate first day of the month and total days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Adjust grid to start on Monday (0=Mon, 1=Tue, ..., 6=Sun)
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysGrid = [];
  for (let i = 0; i < startDay; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push(i);
  }

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="w-full text-zinc-800 font-sans mt-4 max-w-[280px] mx-auto bg-white/60 backdrop-blur-xs p-5 rounded-[2rem] border border-zinc-200/50 shadow-xs">
      <h4 className="font-serif-luxury text-xl text-[#7E8268] text-center italic mb-4">{monthName}</h4>
      <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
        {weekDays.map((d) => (
          <span key={d} className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2">{d}</span>
        ))}
        {daysGrid.map((d, idx) => {
          if (d === null) return <span key={`empty-${idx}`} />;
          const isEventDay = d === day;
          return (
            <div key={`day-${d}`} className="relative flex items-center justify-center h-8 w-8 mx-auto">
              {isEventDay && (
                <span className="absolute inset-0 flex items-center justify-center text-rose-500 scale-[1.5]">
                  <svg className="w-9 h-9 fill-none stroke-rose-400 stroke-[1.5]" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </span>
              )}
              <span className={`relative text-xs ${isEventDay ? "font-bold text-rose-600" : "text-zinc-700"}`}>
                {d}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Ornate vintage mirror frame SVG background component
function OrnateFrame({ children, title }) {
  return (
    <div className="relative px-8 py-12 my-8 mx-auto w-full max-w-[280px] text-zinc-800 text-center">
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full text-[#8D8675]/60" viewBox="0 0 200 240" preserveAspectRatio="none">
          {/* Main frame border */}
          <rect x="8" y="8" width="184" height="224" rx="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="12" y="12" width="176" height="216" rx="20" fill="rgba(255, 255, 255, 0.75)" stroke="currentColor" strokeWidth="0.5" />
          
          {/* Ornate corner curves */}
          <path d="M 8 28 Q 28 28 28 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 192 28 Q 172 28 172 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 8 212 Q 28 212 28 232" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 192 212 Q 172 212 172 232" fill="none" stroke="currentColor" strokeWidth="1.5" />

          {/* Decorative loops on the sides */}
          <circle cx="100" cy="8" r="6" fill="#F4F2EB" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="100" cy="232" r="6" fill="#F4F2EB" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
      
      {title && (
        <h3 className="font-script text-3xl text-[#7E8268] mb-4">{title}</h3>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default function BeginForever({ content = {}, mode = "live", onRsvpSubmit, hideBranding = false }) {
  const isLive = mode === "live";
  const isPreOpen = mode === "preview" || mode === "editor";

  // Content field properties
  const groomName = content.groom_name || "Farhan";
  const brideName = content.bride_name || "Zoya";
  const venue = content.venue_name || "Grand Regency Banquets";
  const venueAddress = content.venue_address || "MG Road, Bangalore, KA";
  const accentColor = content.accent_color || "#7E8268"; // Olive Green accent
  const bgColor = content.bg_color || "#F4F2EB"; // Light Cream base
  const musicUrl = content.music_url || null;
  const musicEnabled = content.music_enabled !== false;

  const rawDate = content.event_date || null;
  const displayDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : "August 12, 2026";
  const displayTime = content.event_time ? `${content.event_time}` : "07:00 PM";
  const displayOrder = content.name_display_order || "bride_first";
  const partner1 = displayOrder === "bride_first" ? brideName : groomName;
  const partner2 = displayOrder === "bride_first" ? groomName : brideName;
  const initials = (partner1[0] || "") + (partner2[0] || "");

  const ceremonyType = content.ceremony_type || "Wedding";
  const brideParents = content.bride_parents || "";
  const groomParents = content.groom_parents || "";
  let parentsGreeting = "Together with their families";
  if (brideParents && groomParents) {
    parentsGreeting = `Together with their parents\n${brideParents} & ${groomParents}`;
  } else if (brideParents) {
    parentsGreeting = `Together with their parents, ${brideParents}`;
  } else if (groomParents) {
    parentsGreeting = `Together with their parents, ${groomParents}`;
  }

  // Cover and music toggle states
  const [isOpen, setIsOpen] = useState(isPreOpen);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  // Countdown timer calculation
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!rawDate) return;
    const target = new Date(`${rawDate}T${content.event_time || "19:00"}`).getTime();
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
  }, [rawDate, content.event_time]);

  // RSVP Form submission states
  const [rsvpData, setRsvpData] = useState({
    guest_name: "",
    status: "attending",
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
    if (isMuted) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!onRsvpSubmit) {
      setRsvpSubmitted(true);
      return;
    }
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
      className="min-h-screen text-zinc-800 flex flex-col justify-between overflow-x-hidden font-sans select-none relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Self-contained styling to load Google Fonts dynamically */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:wght@300;400;600&display=swap');
        
        .font-script {
          font-family: 'Alex Brush', cursive, Georgia, serif;
        }
        .font-serif-luxury {
          font-family: 'Playfair Display', serif;
        }
        .bg-linen-pattern {
          background-color: ${bgColor};
          background-image: radial-gradient(circle at 50% 50%, #FAF9F6 0%, ${bgColor} 100%);
        }
      `}} />

      {/* Audio support */}
      {musicEnabled && musicUrl && (
        <audio ref={audioRef} src={musicUrl} loop />
      )}

      {/* Floating sound toggle */}
      {isOpen && musicEnabled && musicUrl && (
        <div className="fixed top-6 right-6 z-45">
          <button
            onClick={toggleAudio}
            className="h-9 w-9 rounded-full bg-white/80 border border-[#8D8675]/30 flex items-center justify-center text-[#7E8268] shadow-xs cursor-pointer hover:bg-white transition"
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
        {/* ── Monogram Envelope Cover Screen ── */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1.2, ease: [0.85, 0, 0.15, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none bg-linen-pattern"
          >
            {/* Elegant double-line botanical border */}
            <div className="absolute inset-5 rounded-[2.5rem] pointer-events-none" style={{ border: `1.5px solid ${accentColor}30` }} />
            <div className="absolute inset-7 rounded-[2.25rem] pointer-events-none" style={{ border: `0.5px solid ${accentColor}15` }} />

            <div className="max-w-md w-full space-y-12 relative z-10">
              <div className="space-y-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400" style={{ color: accentColor }}>
                  INVITATION TO THE WEDDING
                </span>
                
                {/* Heart Monogram frame */}
                <div className="relative mx-auto w-48 h-48 flex items-center justify-center my-6">
                  <svg className="absolute inset-0 w-full h-full text-[#8D8675]/40" viewBox="0 0 100 100">
                    <path d="M 50 20 C 35 0, 5 5, 5 40 C 5 70, 50 95, 50 95 C 50 95, 95 70, 95 40 C 95 5, 65 0, 50 20 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                    <path d="M 50 24 C 38 4, 10 9, 10 42 C 10 68, 50 90, 50 90 C 50 90, 90 68, 90 42 C 90 9, 62 4, 50 24 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                  <div className="text-center relative z-10 px-6 space-y-1">
                    <span className="font-script text-4xl text-zinc-800 leading-tight block">
                      {initials}
                    </span>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">
                      {displayDate}
                    </span>
                  </div>
                </div>

                <h1 className="font-serif-luxury text-4xl font-light text-zinc-850 leading-relaxed tracking-wide mt-2">
                  {partner1} <br />
                  <span className="font-script text-4xl text-[#7E8268]">&amp;</span> <br />
                  {partner2}
                </h1>
              </div>

              {/* Monogram Seal */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleOpenInvite}
                  className="h-16 w-16 rounded-full border border-zinc-200 bg-[#7E8268] hover:bg-[#6b6f58] flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition duration-300 cursor-pointer relative"
                  aria-label="Open invitation"
                >
                  <span className="absolute inset-0 rounded-full animate-ping opacity-35 pointer-events-none" style={{ border: `1px solid ${accentColor}` }} />
                  <span className="font-serif text-sm font-semibold tracking-wider text-white">OPEN</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Scroll Content ── */}
      <div className="flex-1 flex flex-col items-center bg-linen-pattern">
        
        {/* Header Hero Section */}
        <section className="min-h-screen w-full max-w-md bg-white/20 border-x border-zinc-200/50 shadow-2xl flex flex-col justify-between p-8 relative overflow-hidden">
          
          <div className="text-center my-auto space-y-10 pt-16">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7E8268] block">
              WEDDING DAY
            </span>

            {/* Heart Lace Crest */}
            <div className="relative mx-auto w-52 h-52 flex items-center justify-center my-4">
              <svg className="absolute inset-0 w-full h-full text-[#8D8675]/30" viewBox="0 0 100 100">
                <path d="M 50 20 C 35 0, 5 5, 5 40 C 5 70, 50 95, 50 95 C 50 95, 95 70, 95 40 C 95 5, 65 0, 50 20 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                <path d="M 50 24 C 38 4, 10 9, 10 42 C 10 68, 50 90, 50 90 C 50 90, 90 68, 90 42 C 90 9, 62 4, 50 24 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
              <div className="text-center relative z-10 px-6 space-y-2">
                <span className="font-script text-4xl text-zinc-800 leading-tight block">
                  {partner1} <br />
                  <span className="text-[#7E8268] text-3xl font-light">&amp;</span> <br />
                  {partner2}
                </span>
                <span className="text-[9px] text-[#8D8675] font-bold uppercase tracking-widest block">
                  {displayDate}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Cursive Russian mockup matching greeting: "Dear Family & Friends!" */}
              <h2 className="font-script text-4xl text-[#7E8268] font-normal leading-relaxed">
                Dear family and friends!
              </h2>
              
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-sans max-w-[280px] mx-auto whitespace-pre-line leading-relaxed">
                {parentsGreeting}
              </p>
              
              <p className="text-xs text-zinc-500 max-w-[280px] mx-auto leading-relaxed italic">
                We are happy to share the joy of our wedding day with you. We look forward to seeing you at our celebration!
              </p>
            </div>

            {/* Custom Dynamic Calendar Block */}
            <div className="max-w-[290px] mx-auto pt-4">
              <WeddingCalendar date={rawDate} accentColor={accentColor} />
            </div>
          </div>

          <div className="text-center text-[9px] text-[#8D8675] uppercase tracking-widest pt-8">
            Scroll down to view details
          </div>
        </section>

        {/* Welcome Note (Optional) */}
        {content.welcome_note && (
          <section className="w-full max-w-md bg-white/20 border-x border-t border-zinc-200/50 px-8 py-16 text-center space-y-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] block text-[#7E8268]">Welcome</span>
            <p className="font-script text-3xl text-zinc-800 leading-relaxed max-w-xs mx-auto font-light">
              "{content.welcome_note}"
            </p>
          </section>
        )}

        {/* Ornate Frame Schedule (Program) */}
        <section className="w-full max-w-md bg-white/20 border-x border-t border-zinc-200/50 px-6 py-12 space-y-4">
          <OrnateFrame title="Program">
            <div className="space-y-8 py-2">
              {[
                { title: `${ceremonyType} Ceremony`, time: displayTime, desc: "Ceremony & Union" },
                { title: "Grand Banquet", time: "08:30 PM", desc: "Banquet dinner & reception" }
              ].map((evt, idx) => (
                <div key={idx} className="space-y-1.5 text-center">
                  <h4 className="font-serif-luxury text-sm font-semibold text-[#7E8268] uppercase tracking-wider">{evt.title}</h4>
                  <p className="text-xs font-semibold text-zinc-900 tracking-wide">{evt.time}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{evt.desc}</p>
                  {idx === 0 && <div className="w-1.5 h-6 border-l border-[#8D8675]/30 mx-auto my-3" />}
                </div>
              ))}
            </div>
          </OrnateFrame>
        </section>

        {/* Photo Album (Optional) */}
        {content.photo_album_enabled && content.photo_album && content.photo_album.filter(Boolean).length > 0 && (
          <section className="w-full max-w-md bg-white/20 border-x border-t border-zinc-200/50 px-6 py-16 text-center space-y-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7E8268]">Gallery</span>
            <h2 className="font-serif-luxury text-2xl font-light text-zinc-800 tracking-wide italic">
              Our Photo Album
            </h2>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              {content.photo_album.filter(Boolean).map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  className="aspect-square rounded-[1.5rem] overflow-hidden border border-zinc-200/50 shadow-2xs hover:scale-[1.02] transition duration-300 relative group cursor-pointer"
                >
                  <img src={imgUrl} alt={`Album memory ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition duration-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ornate Frame Address & Location Map */}
        <section className="w-full max-w-md bg-white/20 border-x border-t border-zinc-200/50 px-6 py-12 text-center space-y-4">
          <OrnateFrame title="Address">
            <div className="space-y-4 py-2">
              <h4 className="font-serif-luxury text-sm font-semibold text-[#7E8268] uppercase tracking-wider">{venue}</h4>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                {venueAddress}
              </p>
              
              <div className="h-44 bg-zinc-150 rounded-2xl overflow-hidden border border-zinc-200/40 relative mt-4">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${venue}, ${venueAddress}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="pt-4">
                <a
                  href={content.google_map_link || `https://maps.google.com/?q=${encodeURIComponent(`${venue}, ${venueAddress}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-white font-bold py-3 px-6 rounded-full text-[10px] uppercase tracking-widest shadow-xs transition hover:bg-[#6b6f58]"
                  style={{ backgroundColor: "#7E8268" }}
                >
                  Open on Map
                </a>
              </div>
            </div>
          </OrnateFrame>
        </section>

        {/* RSVP Form */}
        {content.rsvp_enabled && (
          <section className="w-full max-w-md bg-white/20 border-x border-t border-zinc-200/50 px-8 py-16 space-y-6 pb-16 text-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7E8268]">RSVP</span>
            <h2 className="font-script text-4xl text-zinc-800 leading-relaxed font-normal">
              Attendance
            </h2>

            {rsvpSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-6 bg-white/70 border border-zinc-200/40 rounded-[2rem] max-w-xs mx-auto space-y-3 shadow-xs"
              >
                <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
                <h3 className="font-serif-luxury text-base font-semibold text-zinc-800">Attendance Confirmed</h3>
                <p className="text-[11px] text-zinc-400">Thank you for letting us know!</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-xs mx-auto">
                {rsvpError && (
                  <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-2.5 rounded-xl">{rsvpError}</div>
                )}
                
                <div className="space-y-1 text-left">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider ml-1">Name</label>
                  <input
                    type="text" required placeholder="Your full name"
                    value={rsvpData.guest_name}
                    onChange={(e) => setRsvpData({ ...rsvpData, guest_name: e.target.value })}
                    className="w-full bg-white/70 border border-zinc-250/70 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#7E8268]/50 text-zinc-800 placeholder:text-zinc-400 transition"
                  />
                </div>

                {/* Custom radio-style options matching screenshot */}
                <div className="space-y-2.5 text-left pt-2">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider ml-1">Will you attend?</label>
                  {[
                    { value: "attending", label: "Will Attend" },
                    { value: "declined", label: "Will Decline" }
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200/60 bg-white/50 cursor-pointer hover:bg-white/80 transition">
                      <input
                        type="radio"
                        name="rsvp_status"
                        value={opt.value}
                        checked={rsvpData.status === opt.value}
                        onChange={() => setRsvpData({ ...rsvpData, status: opt.value })}
                        className="h-3.5 w-3.5 text-[#7E8268] border-zinc-300 focus:ring-[#7E8268]"
                      />
                      <span className="text-xs font-medium text-zinc-700">{opt.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit" disabled={rsvpLoading}
                  className="w-full text-white font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 mt-4 hover:bg-[#6b6f58] shadow-xs"
                  style={{ backgroundColor: "#7E8268" }}
                >
                  {rsvpLoading ? "Sending…" : "Send RSVP"}
                </button>
              </form>
            )}
          </section>
        )}

        {/* Attributions Section (Optional) */}
        {(content.attribution_heading || content.attribution_names) && (
          <section className="w-full max-w-md bg-white/20 border-x border-t border-zinc-200/50 px-8 py-16 text-center space-y-2">
            {content.attribution_heading && (
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] block text-[#7E8268]">
                {content.attribution_heading}
              </span>
            )}
            {content.attribution_names && (
              <p className="font-script text-3xl text-zinc-800 leading-relaxed max-w-xs mx-auto">
                {content.attribution_names}
              </p>
            )}
          </section>
        )}

        {/* Clean minimal Countdown Timer section */}
        <section className="w-full max-w-md bg-white/20 border-x border-t border-zinc-200/50 px-8 py-16 text-center">
          <span className="text-[9px] font-script text-3xl text-[#7E8268] block mb-6">
            With love,
          </span>
          <h3 className="font-script text-4xl text-zinc-800 leading-relaxed font-normal mb-8">
            {partner1} &amp; {partner2}
          </h3>
          
          <div className="inline-flex items-center justify-center border border-zinc-250/70 rounded-full px-8 py-3.5 bg-white/40 backdrop-blur-xs shadow-2xs gap-3">
            {[
              { val: countdown.days, lbl: "days" },
              { val: countdown.hours, lbl: "hours" },
              { val: countdown.mins, lbl: "mins" },
              { val: countdown.secs, lbl: "secs" }
            ].map((col, idx) => (
              <React.Fragment key={col.lbl}>
                <div className="text-center flex flex-col items-center">
                  <span className="font-serif-luxury text-base font-semibold text-zinc-800 leading-none">{String(col.val).padStart(2, "0")}</span>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{col.lbl}</span>
                </div>
                {idx < 3 && <span className="text-[#8D8675]/50 font-serif-luxury text-sm leading-none mt-[-6px]">:</span>}
              </React.Fragment>
            ))}
          </div>
        </section>

      </div>

      {/* Footer / Branding */}
      {!hideBranding && (
        <footer className="text-center text-[9px] text-zinc-400 py-8 border-t border-zinc-200/40 max-w-md mx-auto w-full bg-white/10">
          Made with Cardessa Begin Forever Theme
        </footer>
      )}
    </div>
  );
}
