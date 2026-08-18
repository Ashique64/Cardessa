"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Playfair_Display, Alex_Brush, Montserrat } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/* ═══════════════════════════════════════════════════
   PALETTE CONSTANTS
   ═══════════════════════════════════════════════════ */
const PALETTE = {
  cream:   "#FAF9F5", // Elegant warm cream/off-white background
  gold:    "#C5A880", // Premium soft gold accent
  charcoal: "#2C2C2A", // Soft dark slate/charcoal for text contrast
  olive:   "#5F634F", // Subtle olive-green accent
};

/* ═══════════════════════════════════════════════════
   GOLD HEART ICON
   ═══════════════════════════════════════════════════ */
const GoldHeart = ({ size = 10, gold = PALETTE.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block mx-auto">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={gold}
    />
  </svg>
);

/* ═══════════════════════════════════════════════════
   STEPPED ARCH FRAME (SVG Border)
   ═══════════════════════════════════════════════════ */
const SteppedArchFrame = ({ gold = PALETTE.gold, isOpen, isLive = true }) => {
  if (!isLive) {
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <svg
          viewBox="0 0 320 540"
          preserveAspectRatio="none"
          className="w-full h-full p-4"
          aria-hidden="true"
        >
          {/* Outer Stepped Arch */}
          <path
            d="M 12 528 L 12 140 L 32 140 L 32 100 Q 32 30 160 30 Q 288 30 288 100 L 288 140 L 308 140 L 308 528 Z"
            fill="none"
            stroke={gold}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Dashed Echo */}
          <path
            d="M 18 522 L 18 144 L 38 144 L 38 104 Q 38 36 160 36 Q 282 36 282 104 L 282 144 L 302 144 L 302 522 Z"
            fill="none"
            stroke={gold}
            strokeWidth="0.6"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Top Ornament */}
          <circle
            cx="160"
            cy="20"
            r="2.5"
            fill={gold}
            opacity="0.8"
          />
          <circle
            cx="160"
            cy="20"
            r="5"
            fill="none"
            stroke={gold}
            strokeWidth="0.5"
            opacity="0.6"
          />
        </svg>
      </div>
    );
  }

  const drawLine = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 2.2, ease: "easeInOut", delay: 0.6 }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
      <svg
        viewBox="0 0 320 540"
        preserveAspectRatio="none"
        className="w-full h-full p-4"
        aria-hidden="true"
      >
        {/* Outer Stepped Arch */}
        <motion.path
          d="M 12 528 L 12 140 L 32 140 L 32 100 Q 32 30 160 30 Q 288 30 288 100 L 288 140 L 308 140 L 308 528 Z"
          fill="none"
          stroke={gold}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={drawLine}
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
        />

        {/* Inner Dashed Echo */}
        <motion.path
          d="M 18 522 L 18 144 L 38 144 L 38 104 Q 38 36 160 36 Q 282 36 282 104 L 282 144 L 302 144 L 302 522 Z"
          fill="none"
          stroke={gold}
          strokeWidth="0.6"
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={drawLine}
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
        />

        {/* Top Ornament */}
        <motion.circle
          cx="160"
          cy="20"
          r="2.5"
          fill={gold}
          initial={{ opacity: 0, scale: 0 }}
          animate={isOpen ? { opacity: 0.8, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        />
        <motion.circle
          cx="160"
          cy="20"
          r="5"
          fill="none"
          stroke={gold}
          strokeWidth="0.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={isOpen ? { opacity: 0.6, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ delay: 2.7, duration: 0.5 }}
        />
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   FLOATING LEAVES / PETALS HELPERS
   ═══════════════════════════════════════════════════ */
const LeafSVG = ({ type, color }) => {
  if (type === "petal") {
    return (
      <svg viewBox="0 0 24 24" className="w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.06))" }}>
        {/* Organic rose petal body */}
        <path
          d="M12 2 C16 3, 21 7, 20 13 C19 18, 14 21, 10 21 C6 21, 3 17, 4 12 C5 6, 8 2, 12 2 Z"
          fill={color}
        />
        {/* Soft highlight/vein line */}
        <path
          d="M12 2 C11 7, 10 12, 10 21"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.06))" }}>
      {/* Detailed leaf body */}
      <path
        d="M2 12 C4 7, 9 4, 15 3 C18 3, 22 6, 22 9 C20 13, 15 17, 9 19 C5 19, 2 16, 2 12 Z"
        fill={color}
      />
      {/* Main leaf stem vein */}
      <path
        d="M2 12 Q12 10 22 9"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.6"
      />
      {/* Secondary veins */}
      <path
        d="M6 13 Q8 10 11 9 M10 14 Q13 11 16 10 M14 14 Q17 12 20 11"
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.4"
      />
    </svg>
  );
};


/* ═══════════════════════════════════════════════════
   MAIN TEMPLATE COMPONENT
   ═══════════════════════════════════════════════════ */
export default function GoldenVow({ content = {}, mode = "live", onRsvpSubmit, hideBranding = false }) {
  const isLive = mode === "live";
  const isPreOpen = mode === "preview" || mode === "editor";

  /* ── Content Fields ── */
  const groomName    = content.groom_name    || "Omar";
  const brideName    = content.bride_name    || "Tia";
  const tagline      = content.tagline       || "together with their families";
  const inviteMsg    = content.invite_message || "joyfully invite you to celebrate their wedding";
  const ceremonyType = content.ceremony_type || "wedding";
  
  const rawDate      = content.event_date    || "2025-05-24";
  const eventTime    = content.event_time    || "04:00 PM";
  const venue        = content.venue_name    || "The Garden Pavilion";
  const venueAddress = content.venue_address || "123 Blossom Way, Loveville, CA 92345";
  const googleMapLink = content.google_map_link || "";
  const parentsEnabled = content.parents_enabled || false;
  const brideParents   = content.bride_parents || "";
  const groomParents   = content.groom_parents || "";
  const endTimeEnabled = content.end_time_enabled || false;
  const endDateTime    = content.end_date_time || "";
  const welcomeNote    = content.welcome_note || "We are so excited to celebrate our special day with you. Your presence, love, and support mean the world to us!";
  const attributionsEnabled = content.attributions_enabled || false;
  const attributionHeading  = content.attribution_heading  || "";
  const attributionNames    = content.attribution_names    || "";
  const couplePhoto        = content.couple_photo || null;
  const photoAlbumEnabled  = content.photo_album_enabled || false;
  const photoAlbum         = content.photo_album || [];
  const rsvpEnabled        = content.rsvp_enabled || false;
  const musicUrl     = content.music_url     || null;
  const musicEnabled = content.music_enabled !== false;
  const accentColor  = content.accent_color  || PALETTE.gold;
  const bgColor      = content.bg_color      || PALETTE.cream;

  const displayOrder = content.name_display_order || "bride_first";
  const partner1     = displayOrder === "bride_first" ? brideName : groomName;
  const partner2     = displayOrder === "bride_first" ? groomName : brideName;
  const initials     = ((partner1[0] || "") + (partner2[0] || "")).toUpperCase();

  /* ── Date formatting ── */
  const dateObj = rawDate ? new Date(rawDate) : new Date("2025-05-24");
  const weekdays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const dayOfWeek = weekdays[dateObj.getDay()];
  const eventDay = dateObj.getDate();
  const eventMonth = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const eventYear = dateObj.getFullYear();

  /* ── Add to Calendar Helpers ── */
  const getCalendarLinks = () => {
    try {
      const [year, month, day] = rawDate.split("-");
      let hours = 12;
      let minutes = 0;
      const timeParts = eventTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeParts) {
        hours = parseInt(timeParts[1], 10);
        minutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
      const pad = (num) => String(num).padStart(2, "0");
      const startStr = `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;
      const endStr = `${year}${month}${day}T${pad((hours + 4) % 24)}${pad(minutes)}05`;
      const title = encodeURIComponent(`Wedding of ${partner1} & ${partner2}`);
      const details = encodeURIComponent(`We are so excited to celebrate our special day with you!`);
      const loc = encodeURIComponent(venue + ", " + venueAddress);
      
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${loc}`;
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:Wedding of ${partner1} & ${partner2}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `LOCATION:${venue}, ${venueAddress}`,
        "DESCRIPTION:We are so excited to celebrate our special day with you!",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\n");
      const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
      return { googleUrl, icsUrl };
    } catch (e) {
      return { googleUrl: "#", icsUrl: "#" };
    }
  };

  /* ── Cover & Audio State ── */
  const [isOpen, setIsOpen]   = useState(isPreOpen);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  /* ── Floating Leaves State ── */
  const [leaves] = useState(() => {
    const arr = [];
    const colors = [
      "#BAB591", // Sage / Olive green
      "#808156", // Darker leaf green
      "#F2EBDB", // Warm white petal
      "#FEFCF5", // Pure white petal
      "#DCD8B8", // Pale gold/cream leaf
    ];
    for (let i = 0; i < 15; i++) {
      arr.push({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 8,
        scale: 0.3 + Math.random() * 0.7,
        sway: (Math.random() - 0.5) * 80,
        rotate: (Math.random() - 0.5) * 720,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.5 ? "leaf" : "petal",
        opacity: 0.2 + Math.random() * 0.4,
      });
    }
    return arr;
  });

  /* ── Countdown timer ── */
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!rawDate) return;
    const target = new Date(`${rawDate}T${content.event_time ? content.event_time.replace(/[^0-9:]/g, "") : "16:00"}`).getTime();
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
  }, [rawDate, content.event_time]);



  /* ── RSVP State ── */
  const [rsvpData, setRsvpData] = useState({ guest_name: "", status: "attending" });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  /* ── Slideshow State ── */
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);

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

  /* ── Framer Motion Animations ── */
  const fadeUp = (i = 0) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: isLive ? 1.2 : 0, ease: [0.16, 1, 0.3, 1], delay: isLive ? 0.3 + i * 0.15 : 0 }
    }
  });

  const nameAnim = (i = 0) => ({
    hidden: { opacity: 0, y: 25, scale: 0.94, letterSpacing: "-0.02em" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      letterSpacing: "0.03em",
      transition: { duration: isLive ? 1.6 : 0, ease: [0.16, 1, 0.3, 1], delay: isLive ? 0.45 + i * 0.2 : 0 }
    }
  });

  const slideInTL = {
    hidden: { x: -60, y: -60, scale: 0.9, opacity: 0 },
    visible: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: isLive ? 2.2 : 0, ease: [0.16, 1, 0.3, 1], delay: isLive ? 0.15 : 0 }
    }
  };

  const slideInBR = {
    hidden: { x: 60, y: 60, scale: 0.9, opacity: 0 },
    visible: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: isLive ? 2.2 : 0, ease: [0.16, 1, 0.3, 1], delay: isLive ? 0.25 : 0 }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center overflow-x-hidden select-none relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Self-contained styling to declare template font classes */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ff-serif { font-family: ${playfair.style.fontFamily}, serif; }
        .ff-script { font-family: ${alexBrush.style.fontFamily}, cursive; }
        .ff-sans { font-family: ${montserrat.style.fontFamily}, sans-serif; }
      ` }} />

      {musicEnabled && musicUrl && <audio ref={audioRef} src={musicUrl} loop />}

      {/* Floating Sound Toggle */}
      {isOpen && musicEnabled && musicUrl && (
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={toggleAudio}
            className="h-10 w-10 rounded-full border border-zinc-200 bg-white/95 flex items-center justify-center text-zinc-800 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* ── COVER ENVELOPE ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.2, ease: [0.85, 0, 0.15, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none bg-cover bg-center"
            style={{ 
              backgroundImage: couplePhoto ? `url(${couplePhoto})` : 'none',
              backgroundColor: bgColor 
            }}
          >
            {/* Soft overlay to ensure readability */}
            {couplePhoto && (
              <div 
                className="absolute inset-0 z-1 transition-all" 
                style={{ 
                  backgroundColor: `${bgColor}d8`
                }} 
              />
            )}

            {/* Elegant double gold frames for cover screen */}
            <div className="absolute inset-5 rounded-3xl pointer-events-none z-2" style={{ border: `1px solid ${accentColor}45` }} />
            <div className="absolute inset-6 rounded-3xl pointer-events-none z-2" style={{ border: `0.5px solid ${accentColor}25` }} />

            <div className="max-w-md w-full space-y-12 relative z-10">
              <div className="space-y-4">
                <span className="ff-sans text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: accentColor }}>
                  {ceremonyType} Announcement
                </span>
                
                {/* Monogram Seal */}
                <div className="relative mx-auto w-36 h-36 flex items-center justify-center my-6">
                  <svg className="absolute inset-0 w-full h-full text-zinc-300" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.4" />
                  </svg>
                  <div className="text-center relative z-10 px-4 space-y-1">
                    <span className="ff-serif text-3xl font-light text-zinc-800 leading-tight block">
                      {initials}
                    </span>
                  </div>
                </div>

                <h1 className="ff-serif font-light leading-tight text-zinc-800 text-4xl mt-2 tracking-wide">
                  {partner1} <br />
                  <span className="ff-script text-3xl text-zinc-400 block my-1">&amp;</span>
                  {partner2}
                </h1>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleOpenInvite}
                  className="h-16 w-16 rounded-full border border-zinc-200 bg-zinc-800 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer relative"
                  style={{ background: `radial-gradient(circle, ${accentColor}ee, ${accentColor})` }}
                  aria-label="Open invitation"
                >
                  <span className="absolute inset-0 rounded-full animate-ping opacity-35 pointer-events-none" style={{ border: `1px solid ${accentColor}` }} />
                  <span className="ff-sans text-xs font-semibold tracking-wider text-white">OPEN</span>
                </button>
                <span className="ff-sans text-[9px] uppercase tracking-widest font-semibold text-stone-400 animate-pulse">
                  Open Invitation
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="w-full max-w-137.5 flex flex-col min-h-screen bg-white shadow-2xl relative">
        
        {/* ── HERO SECTION ── */}
        <section
          className="relative w-full flex flex-col justify-between overflow-hidden flex-1"
          style={{
            backgroundColor: bgColor,
            minHeight: isLive ? "100svh" : "100%",
          }}
        >
          {/* ── Top-Left Corner Flower SVG ── */}
          {isLive ? (
            <motion.div
              className="absolute pointer-events-none"
              style={{ top: "clamp(6px, 1.5vw, 12px)", left: "clamp(6px, 1.5vw, 12px)", zIndex: 5 }}
              variants={slideInTL}
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
            >
              <img
                src="/Images/Templates/Golden-Vow/top-left-corner-flower.svg"
                alt=""
                aria-hidden="true"
                style={{ width: "clamp(120px, 30vw, 200px)", maxHeight: "clamp(160px, 26vh, 280px)", height: "auto", objectFit: "contain", objectPosition: "top left" }}
              />
            </motion.div>
          ) : (
            <div className="absolute pointer-events-none" style={{ top: "clamp(6px, 1.5vw, 12px)", left: "clamp(6px, 1.5vw, 12px)", zIndex: 5 }}>
              <img
                src="/Images/Templates/Golden-Vow/top-left-corner-flower.svg"
                alt=""
                aria-hidden="true"
                style={{ width: "clamp(120px, 30vw, 200px)", maxHeight: "clamp(160px, 26vh, 280px)", height: "auto", objectFit: "contain", objectPosition: "top left" }}
              />
            </div>
          )}

          {/* ── Top-Right Corner Flower SVG ── */}
          {isLive ? (
            <motion.div
              className="absolute pointer-events-none"
              style={{ top: "clamp(6px, 1.5vw, 12px)", right: "clamp(6px, 1.5vw, 12px)", zIndex: 5 }}
              variants={{
                hidden: { x: 60, y: -60, scale: 0.9, opacity: 0 },
                visible: { x: 0, y: 0, scale: 1, opacity: 1, transition: { duration: isLive ? 2.2 : 0, ease: [0.16, 1, 0.3, 1], delay: isLive ? 0.2 : 0 } }
              }}
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
            >
              <img
                src="/Images/Templates/Golden-Vow/top-right-corner-flower.svg"
                alt=""
                aria-hidden="true"
                style={{ width: "clamp(120px, 30vw, 200px)", maxHeight: "clamp(160px, 26vh, 280px)", height: "auto", objectFit: "contain", objectPosition: "top right" }}
              />
            </motion.div>
          ) : (
            <div className="absolute pointer-events-none" style={{ top: "clamp(6px, 1.5vw, 12px)", right: "clamp(6px, 1.5vw, 12px)", zIndex: 5 }}>
              <img
                src="/Images/Templates/Golden-Vow/top-right-corner-flower.svg"
                alt=""
                aria-hidden="true"
                style={{ width: "clamp(120px, 30vw, 200px)", maxHeight: "clamp(160px, 26vh, 280px)", height: "auto", objectFit: "contain", objectPosition: "top right" }}
              />
            </div>
          )}

          {/* ── Bottom-Left Corner Flower SVG ── */}
          {isLive ? (
            <motion.div
              className="absolute pointer-events-none"
              style={{ bottom: "clamp(6px, 1.5vw, 12px)", left: "clamp(6px, 1.5vw, 12px)", zIndex: 5 }}
              variants={{
                hidden: { x: -60, y: 60, scale: 0.9, opacity: 0 },
                visible: { x: 0, y: 0, scale: 1, opacity: 1, transition: { duration: isLive ? 2.2 : 0, ease: [0.16, 1, 0.3, 1], delay: isLive ? 0.3 : 0 } }
              }}
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
            >
              <img
                src="/Images/Templates/Golden-Vow/bottom-left-corner-flower.svg"
                alt=""
                aria-hidden="true"
                style={{ width: "clamp(140px, 34vw, 220px)", maxHeight: "clamp(140px, 22vh, 240px)", height: "auto", objectFit: "contain", objectPosition: "bottom left" }}
              />
            </motion.div>
          ) : (
            <div className="absolute pointer-events-none" style={{ bottom: "clamp(6px, 1.5vw, 12px)", left: "clamp(6px, 1.5vw, 12px)", zIndex: 5 }}>
              <img
                src="/Images/Templates/Golden-Vow/bottom-left-corner-flower.svg"
                alt=""
                aria-hidden="true"
                style={{ width: "clamp(140px, 34vw, 220px)", maxHeight: "clamp(140px, 22vh, 240px)", height: "auto", objectFit: "contain", objectPosition: "bottom left" }}
              />
            </div>
          )}

          {/* Card Border Frames to eliminate blank spaces */}
          <div className="absolute inset-4 rounded-[20px] pointer-events-none" style={{ border: `1px solid ${accentColor}35`, zIndex: 2 }} />
          <div className="absolute inset-5 rounded-2xl pointer-events-none" style={{ border: `0.5px solid ${accentColor}15`, zIndex: 2 }} />

          {/* ── Floating Leaves / Petals Motion Background ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
            {isOpen && leaves.map((leaf) => (
              <motion.div
                key={leaf.id}
                className="absolute"
                style={{
                  left: leaf.left,
                  top: "-5%",
                  width: `${leaf.scale * 20}px`,
                  height: `${leaf.scale * 20}px`,
                  opacity: leaf.opacity,
                }}
                animate={{
                  y: ["0vh", "105vh"],
                  x: [0, leaf.sway, 0],
                  rotate: [0, leaf.rotate],
                }}
                transition={{
                  duration: leaf.duration,
                  ease: "linear",
                  repeat: Infinity,
                  delay: leaf.delay,
                }}
              >
                <LeafSVG type={leaf.type} color={leaf.color} />
              </motion.div>
            ))}
          </div>

          {/* Core Content Inside Arch */}
          <div
            className="relative flex-1 flex flex-col items-center justify-between text-center select-none"
            style={{
              zIndex: 10,
              paddingTop: isLive ? "clamp(70px, 12vh, 110px)" : "70px",
              paddingBottom: isLive ? "clamp(50px, 9vh, 80px)" : "45px",
              paddingLeft: "clamp(24px, 6vw, 48px)",
              paddingRight: "clamp(24px, 6vw, 48px)",
            }}
          >
            {/* Top Monogram Seal & Ceremony Type */}
            <div className="space-y-4">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full text-zinc-300" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <circle cx="50" cy="50" r="41" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.4" />
                </svg>
                <span className="ff-serif text-lg font-light tracking-widest text-stone-700 relative z-10" style={{ color: PALETTE.charcoal }}>
                  {initials}
                </span>
              </div>
              
              {isLive ? (
                <motion.p
                  variants={fadeUp(1)}
                  initial="hidden"
                  animate={isOpen ? "visible" : "hidden"}
                  className="ff-sans uppercase font-medium tracking-[0.24em] text-[10px]"
                  style={{ color: accentColor }}
                >
                  {ceremonyType}
                </motion.p>
              ) : (
                <p
                  className="ff-sans uppercase font-medium tracking-[0.24em] text-[10px]"
                  style={{ color: accentColor }}
                >
                  {ceremonyType}
                </p>
              )}
            </div>

            {/* Middle: Names & Tag */}
            <div className="space-y-6 my-auto">
              {/* Partner 1 */}
              {isLive ? (
                <motion.h1
                  variants={nameAnim(0)}
                  initial="hidden"
                  animate={isOpen ? "visible" : "hidden"}
                  className="ff-script font-light leading-none tracking-wide text-stone-850"
                  style={{ fontSize: "clamp(38px, 10vw, 56px)", color: PALETTE.charcoal }}
                >
                  {partner1}
                </motion.h1>
              ) : (
                <h1
                  className="ff-script font-light leading-none tracking-wide text-stone-850"
                  style={{ fontSize: "clamp(38px, 10vw, 56px)", color: PALETTE.charcoal, letterSpacing: "0.03em" }}
                >
                  {partner1}
                </h1>
              )}

              {/* Ampersand */}
              <div className="flex items-center justify-center gap-4 w-40 mx-auto select-none">
                {isLive ? (
                  <>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={isOpen ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                      className="flex-1 h-px origin-right"
                      style={{ backgroundColor: `${accentColor}70` }}
                    />
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
                      animate={isOpen ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.7, rotate: -15 }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.75 }}
                      className="ff-script text-3xl"
                      style={{ color: accentColor }}
                    >
                      &amp;
                    </motion.span>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={isOpen ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                      className="flex-1 h-px origin-left"
                      style={{ backgroundColor: `${accentColor}70` }}
                    />
                  </>
                ) : (
                  <>
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: `${accentColor}70` }}
                    />
                    <span
                      className="ff-script text-3xl"
                      style={{ color: accentColor }}
                    >
                      &amp;
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: `${accentColor}70` }}
                    />
                  </>
                )}
              </div>

              {/* Partner 2 */}
              {isLive ? (
                <motion.h1
                  variants={nameAnim(1)}
                  initial="hidden"
                  animate={isOpen ? "visible" : "hidden"}
                  className="ff-script font-light leading-none tracking-wide text-stone-850"
                  style={{ fontSize: "clamp(38px, 10vw, 56px)", color: PALETTE.charcoal }}
                >
                  {partner2}
                </motion.h1>
              ) : (
                <h1
                  className="ff-script font-light leading-none tracking-wide text-stone-850"
                  style={{ fontSize: "clamp(38px, 10vw, 56px)", color: PALETTE.charcoal, letterSpacing: "0.03em" }}
                >
                  {partner2}
                </h1>
              )}

              {/* Gold Heart Splitter */}
              {isLive ? (
                <motion.div
                  variants={fadeUp(4)}
                  initial="hidden"
                  animate={isOpen ? "visible" : "hidden"}
                  className="pt-2"
                >
                  <GoldHeart size={8} gold={accentColor} />
                </motion.div>
              ) : (
                <div className="pt-2">
                  <GoldHeart size={8} gold={accentColor} />
                </div>
              )}

              {/* Tag / Invitation message */}
              {isLive ? (
                <motion.p
                  variants={fadeUp(5)}
                  initial="hidden"
                  animate={isOpen ? "visible" : "hidden"}
                  className="ff-sans text-[10px] uppercase font-semibold tracking-wider text-zinc-500 max-w-70 mx-auto leading-relaxed"
                >
                  {tagline}
                  <span className="block mt-2 font-normal text-zinc-400 capitalize ff-serif text-sm italic">
                    {inviteMsg}
                  </span>
                </motion.p>
              ) : (
                <p
                  className="ff-sans text-[10px] uppercase font-semibold tracking-wider text-zinc-500 max-w-70 mx-auto leading-relaxed"
                >
                  {tagline}
                  <span className="block mt-2 font-normal text-zinc-400 capitalize ff-serif text-sm italic">
                    {inviteMsg}
                  </span>
                </p>
              )}
            </div>

            {/* Bottom: Scroll Text */}
            {isLive ? (
              <motion.div
                variants={fadeUp(6)}
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
                className="space-y-2 mt-8"
              >
                <p
                  className="ff-sans text-[8px] uppercase tracking-[0.25em] font-semibold animate-pulse"
                  style={{ color: accentColor }}
                >
                  Scroll to explore
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2 mt-8">
                <p
                  className="ff-sans text-[8px] uppercase tracking-[0.25em] font-semibold animate-pulse"
                  style={{ color: accentColor }}
                >
                  Scroll to explore
                </p>
              </div>
            )}
          </div>
        </section>


        {/* ── DETAILS SECTION ── */}
        <section
          className="relative w-full flex flex-col justify-center items-center overflow-hidden py-16 px-8"
          style={{
            backgroundColor: bgColor,
            minHeight: "100svh",
            borderTop: `1px solid ${accentColor}20`,
          }}
        >
          {/* Card Border Frames */}
          <div className="absolute inset-4 rounded-[20px] pointer-events-none" style={{ border: `1px solid ${accentColor}35`, zIndex: 2 }} />
          <div className="absolute inset-5 rounded-2xl pointer-events-none" style={{ border: `0.5px solid ${accentColor}15`, zIndex: 2 }} />

          {/* Details Content Container */}
          {(() => {
            const calendarMonthName = dateObj.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth();
            const firstDayIndex = new Date(year, month, 1).getDay();
            const totalDays = new Date(year, month + 1, 0).getDate();
            
            const calendarDays = [];
            for (let i = 0; i < firstDayIndex; i++) {
              calendarDays.push(null);
            }
            for (let i = 1; i <= totalDays; i++) {
              calendarDays.push(i);
            }

            return (
              <div className="w-full max-w-sm flex flex-col justify-center items-center text-center space-y-8 relative z-10">
                
                {/* Header: Cursive Title */}
                <div className="space-y-1">
                  <span className="ff-script text-3xl font-light text-stone-700 block" style={{ color: accentColor }}>
                    The Celebration
                  </span>
                  <div className="w-12 h-px mx-auto" style={{ backgroundColor: `${accentColor}40` }} />
                </div>

                {/* Date Display: Calendar Grid */}
                <div className="space-y-4 w-full px-2">
                  <div className="space-y-1">
                    <span className="ff-sans uppercase tracking-[0.2em] text-[9px] font-semibold" style={{ color: accentColor }}>
                      {dayOfWeek}
                    </span>
                    <h3 className="ff-serif font-light text-base tracking-widest text-stone-800">
                      {calendarMonthName} {year}
                    </h3>
                  </div>

                  {/* Calendar Grid Container */}
                  <div className="max-w-60 mx-auto border-t border-b py-3 w-full" style={{ borderColor: `${accentColor}25` }}>
                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-y-2 text-[9px] font-semibold text-stone-400 ff-sans mb-2">
                      <span>S</span>
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                    </div>

                    {/* Days Numbers */}
                    <div className="grid grid-cols-7 gap-y-1 text-xs ff-sans text-stone-700">
                      {calendarDays.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} />;
                        }
                        const isEventDay = day === eventDay;
                        return (
                          <div key={`day-${day}`} className="relative h-7 flex items-center justify-center">
                            {isEventDay ? (
                              <div className="relative w-7 h-7 flex items-center justify-center">
                                <svg className="absolute w-6 h-6" viewBox="0 0 24 24" style={{ color: accentColor }}>
                                  <path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    fill="currentColor"
                                  />
                                </svg>
                                <span className="relative z-10 text-white font-semibold text-[10px] pt-0.5">
                                  {day}
                                </span>
                              </div>
                            ) : (
                              <span className="font-light text-stone-600">
                                {day}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Details */}
                  <div className="space-y-0.5">
                    <p className="ff-sans text-[10px] font-medium tracking-wide text-stone-600">
                      {eventTime}
                    </p>
                    {endTimeEnabled && endDateTime && (
                      <p className="ff-sans text-[9px] font-light tracking-wide text-stone-400">
                        UNTIL {endDateTime.toUpperCase()}
                      </p>
                    )}
                  </div>

                  {/* Add to Calendar Button */}
                  {(() => {
                    const links = getCalendarLinks();
                    return (
                      <div className="relative pt-1 z-20">
                        <button
                          onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 border rounded-full text-[9px] uppercase font-semibold tracking-wider transition-all duration-300 hover:bg-stone-850 hover:text-white cursor-pointer"
                          style={{
                            borderColor: `${accentColor}40`,
                            color: accentColor,
                          }}
                        >
                          <span>Add to Calendar</span>
                          <span className="text-[6px] opacity-70">▼</span>
                        </button>

                        {showCalendarMenu && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowCalendarMenu(false)} />
                            <div
                              className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-36 rounded-xl bg-white shadow-lg border py-1 z-40 flex flex-col text-center"
                              style={{ borderColor: `${accentColor}20` }}
                            >
                              <a
                                href={links.googleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowCalendarMenu(false)}
                                className="px-3 py-1.5 text-[9px] text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors ff-sans uppercase tracking-wider font-semibold"
                              >
                                Google Calendar
                              </a>
                              <div className="h-px w-full" style={{ backgroundColor: `${accentColor}10` }} />
                              <a
                                href={links.icsUrl}
                                download={`wedding_${partner1}_${partner2}.ics`}
                                onClick={() => setShowCalendarMenu(false)}
                                className="px-3 py-1.5 text-[9px] text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors ff-sans uppercase tracking-wider font-semibold"
                              >
                                iCal / Outlook
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>


                {/* Countdown Timer Block */}
                <div className="space-y-3 pt-4 w-full flex flex-col items-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-px" style={{ backgroundColor: `${accentColor}30` }} />
                    <span className="ff-sans uppercase tracking-[0.25em] text-[7.5px] font-semibold text-stone-400">
                      the countdown
                    </span>
                    <div className="w-6 h-px" style={{ backgroundColor: `${accentColor}30` }} />
                  </div>

                  <div className="flex items-center justify-center w-full max-w-77.5 mx-auto py-3.5 rounded-xl border" style={{ borderColor: `${accentColor}25`, backgroundColor: "rgba(255, 255, 255, 0.4)" }}>
                    {/* Days */}
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xl ff-serif font-light text-stone-850 leading-none">
                        {String(countdown.days).padStart(2, "0")}
                      </span>
                      <span className="text-[7px] uppercase tracking-widest text-stone-400 mt-1 ff-sans font-semibold">Days</span>
                    </div>

                    <div className="h-6 w-px" style={{ backgroundColor: `${accentColor}30` }} />

                    {/* Hours */}
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xl ff-serif font-light text-stone-850 leading-none">
                        {String(countdown.hours).padStart(2, "0")}
                      </span>
                      <span className="text-[7px] uppercase tracking-widest text-stone-400 mt-1 ff-sans font-semibold">Hours</span>
                    </div>

                    <div className="h-6 w-px" style={{ backgroundColor: `${accentColor}30` }} />

                    {/* Minutes */}
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xl ff-serif font-light text-stone-850 leading-none">
                        {String(countdown.mins).padStart(2, "0")}
                      </span>
                      <span className="text-[7px] uppercase tracking-widest text-stone-400 mt-1 ff-sans font-semibold">Mins</span>
                    </div>

                    <div className="h-6 w-px" style={{ backgroundColor: `${accentColor}30` }} />

                    {/* Seconds */}
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xl ff-serif font-light text-stone-800 leading-none" style={{ color: accentColor }}>
                        {String(countdown.secs).padStart(2, "0")}
                      </span>
                      <span className="text-[7px] uppercase tracking-widest text-stone-400 mt-1 ff-sans font-semibold">Secs</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
        </section>

        {/* ── PHOTO ALBUM SECTION ── */}
        {photoAlbumEnabled && photoAlbum && photoAlbum.length > 0 && (
          <section
            className="relative w-full flex flex-col justify-center items-center overflow-hidden py-16 px-8"
            style={{
              backgroundColor: bgColor,
              minHeight: "100svh",
              borderTop: `1px solid ${accentColor}20`,
            }}
          >
            {/* Card Border Frames */}
            <div className="absolute inset-4 rounded-[20px] pointer-events-none" style={{ border: `1px solid ${accentColor}35`, zIndex: 2 }} />
            <div className="absolute inset-5 rounded-2xl pointer-events-none" style={{ border: `0.5px solid ${accentColor}15`, zIndex: 2 }} />

            {/* Album Content Container */}
            <div className="w-full max-w-sm flex flex-col justify-center items-center text-center space-y-6 relative z-10">
              
              {/* Header */}
              <div className="space-y-2">
                <span className="ff-script text-3xl font-light text-stone-700 block" style={{ color: accentColor }}>
                  Our Album
                </span>
                <p className="ff-sans text-[8.5px] uppercase tracking-[0.2em] text-stone-450 max-w-65 mx-auto leading-relaxed">
                  capturing our favorite memories &amp; shared moments
                </p>
                <div className="w-12 h-px mx-auto" style={{ backgroundColor: `${accentColor}40` }} />
              </div>

              {/* Scattered Polaroid Collage Grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-78.75 mx-auto pt-4 pb-2">
                {photoAlbum.map((img, idx) => {
                  // Alternating rotation angles for organic "scattered snapshots on table" look
                  const rotations = ["-rotate-2", "rotate-3", "rotate-1", "-rotate-3", "rotate-2", "-rotate-1"];
                  const rotClass = rotations[idx % rotations.length];
                  
                  // Alternate heights to create a beautiful staggered masonry collage look
                  const heightClass = idx % 4 === 0 || idx % 4 === 3 ? "h-48" : "h-38";
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedImg(img)}
                      className={`relative overflow-hidden rounded-lg bg-white p-2 pb-6 shadow-md border cursor-pointer hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 transform ${rotClass} ${heightClass}`}
                      style={{ borderColor: `${accentColor}25` }}
                    >
                      {/* Photo Inset */}
                      <div className="w-full h-[calc(100%-14px)] rounded overflow-hidden bg-stone-50">
                        <img
                          src={img}
                          alt={`Moment ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Polaroid Margin writing label */}
                      <div className="absolute bottom-1 left-0 right-0 text-center">
                        <span className="text-[6.5px] uppercase tracking-[0.2em] font-medium text-stone-400 ff-sans block">
                          {idx === 0 ? "forever" : idx === 1 ? "together" : idx === 2 ? "love" : idx === 3 ? "us" : idx === 4 ? "joy" : "always"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer text */}
              <span className="ff-sans uppercase tracking-[0.25em] text-[7.5px] font-semibold text-stone-400">
                click to enlarge
              </span>

            </div>
          </section>
        )}

        {/* ── VENUE SECTION ── */}
        <section
          className="relative w-full flex flex-col justify-center items-center overflow-hidden py-16 px-8"
          style={{
            backgroundColor: bgColor,
            minHeight: "100svh",
            borderTop: `1px solid ${accentColor}20`,
          }}
        >
          {/* Card Border Frames */}
          <div className="absolute inset-4 rounded-[20px] pointer-events-none" style={{ border: `1px solid ${accentColor}35`, zIndex: 2 }} />
          <div className="absolute inset-5 rounded-2xl pointer-events-none" style={{ border: `0.5px solid ${accentColor}15`, zIndex: 2 }} />

          {/* Venue Content Container */}
          <div className="w-full max-w-sm flex flex-col justify-center items-center text-center space-y-6 relative z-10">
            
            {/* Header: Cursive Title */}
            <div className="space-y-1">
              <span className="ff-script text-3xl font-light text-stone-700 block" style={{ color: accentColor }}>
                The Venue
              </span>
              <div className="w-12 h-px mx-auto" style={{ backgroundColor: `${accentColor}40` }} />
            </div>

            {/* Gold Sketch Illustration */}
            <div className="w-48 h-32 flex items-center justify-center my-1 select-none pointer-events-none">
              <img
                src="/Images/Templates/Golden-Vow/venue-sketch.png"
                alt="Venue Sketch"
                className="w-full h-full object-contain"
                style={{
                  mixBlendMode: "multiply",
                  opacity: 0.85,
                }}
              />
            </div>

            {/* Venue Details */}
            {(() => {
              const mapUrl = googleMapLink || (venueAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue + ", " + venueAddress)}` : "");
              
              return (
                <div className="space-y-4 pt-2 w-full flex flex-col items-center">
                  <div className="space-y-1.5 text-center">
                    <h3 className="ff-serif font-light text-xl text-stone-850 tracking-wide">
                      {venue}
                    </h3>
                    
                    {mapUrl ? (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block ff-sans text-xs font-light text-stone-500 max-w-65 mx-auto leading-relaxed hover:underline hover:text-stone-800 transition-colors"
                        title="Open in Google Maps"
                      >
                        {venueAddress}
                      </a>
                    ) : (
                      <p className="ff-sans text-xs font-light text-stone-500 max-w-65 mx-auto leading-relaxed">
                        {venueAddress}
                      </p>
                    )}
                  </div>
                  
                  {mapUrl && (
                    <div className="pt-2">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-2 border rounded-full text-[10px] uppercase font-semibold tracking-wider transition-all duration-300 hover:bg-stone-800 hover:text-white cursor-pointer"
                        style={{
                          borderColor: accentColor,
                          color: accentColor,
                        }}
                      >
                        View Map
                      </a>
                    </div>
                  )}

                  {/* Gold Separator Divider */}
                  <div className="pt-4 w-full flex items-center justify-center gap-3">
                    <div className="w-16 h-px" style={{ backgroundColor: `${accentColor}30` }} />
                    <span className="text-[10px] ff-serif opacity-30" style={{ color: accentColor }}>❦</span>
                    <div className="w-16 h-px" style={{ backgroundColor: `${accentColor}30` }} />
                  </div>

                  {/* Welcome Note Quote Block */}
                  <div className="relative px-6 py-3 w-full">
                    {/* Left Quote Mark */}
                    <span className="absolute top-0 left-2 text-3xl ff-serif leading-none select-none opacity-20" style={{ color: accentColor }}>
                      “
                    </span>
                    
                    <p className="ff-serif italic font-light text-stone-600 max-w-70 mx-auto text-[13px] leading-relaxed tracking-wide">
                      {welcomeNote}
                    </p>

                    {/* Right Quote Mark */}
                    <span className="absolute bottom-0 right-2 text-3xl ff-serif leading-none select-none opacity-20 pt-4" style={{ color: accentColor }}>
                      ”
                    </span>
                  </div>

                  {/* Parents' Section */}
                  {parentsEnabled && (brideParents || groomParents) && (
                    <div className="space-y-4 py-2 w-full relative">
                      <div className="w-20 h-px mx-auto" style={{ backgroundColor: `${accentColor}30` }} />
                      <span className="ff-script text-2xl text-stone-500 block" style={{ color: accentColor }}>
                        together with their parents
                      </span>
                      <div className="space-y-1.5 font-normal text-stone-800 ff-serif tracking-wide text-sm italic leading-relaxed max-w-70 mx-auto capitalize">
                        {brideParents && <p>{brideParents}</p>}
                        {brideParents && groomParents && <p className="ff-script text-xl my-0.5" style={{ color: accentColor }}>&amp;</p>}
                        {groomParents && <p>{groomParents}</p>}
                      </div>
                      <div className="w-20 h-px mx-auto mt-4" style={{ backgroundColor: `${accentColor}30` }} />
                    </div>
                  )}

                </div>
              );
            })()}
          </div>
        </section>

        {/* ── RSVP SECTION ── */}
        {rsvpEnabled && (
          <section
            className="relative w-full flex flex-col justify-center items-center overflow-hidden py-14 px-8"
            style={{
              backgroundColor: bgColor,
              borderTop: `1px solid ${accentColor}20`,
            }}
          >
            {/* Card Border Frames */}
            <div className="absolute inset-4 rounded-[20px] pointer-events-none" style={{ border: `1px solid ${accentColor}35`, zIndex: 2 }} />
            <div className="absolute inset-5 rounded-2xl pointer-events-none" style={{ border: `0.5px solid ${accentColor}15`, zIndex: 2 }} />

            {/* RSVP Container */}
            <div className="w-full max-w-xs flex flex-col justify-center items-center text-center space-y-8 relative z-10">
              
              {/* Header */}
              <div className="space-y-1">
                <span className="ff-script text-3xl font-light text-stone-700 block" style={{ color: accentColor }}>
                  R.S.V.P.
                </span>
                <div className="w-12 h-px mx-auto" style={{ backgroundColor: `${accentColor}40` }} />
              </div>

              {rsvpSubmitted ? (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 py-8"
                >
                  <div className="mx-auto w-12 h-12 rounded-full border flex items-center justify-center text-lg font-medium" style={{ borderColor: `${accentColor}50`, color: accentColor }}>
                    ✓
                  </div>
                  <h3 className="ff-serif font-light text-lg text-stone-850">
                    Response Received
                  </h3>
                  <p className="ff-sans text-xs text-stone-500 max-w-60 mx-auto leading-relaxed">
                    {rsvpData.status === "attending"
                      ? "Thank you! We are so excited to celebrate our special day together with you."
                      : "Thank you for letting us know. You will be missed!"}
                  </p>
                </motion.div>
              ) : (
                /* Form View */
                <form onSubmit={handleRsvpSubmit} className="w-full space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2 text-left">
                    <label className="ff-sans text-[7.5px] uppercase tracking-[0.2em] font-semibold text-stone-400 block text-center">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Please enter your full name"
                      value={rsvpData.guest_name}
                      onChange={(e) => setRsvpData((prev) => ({ ...prev, guest_name: e.target.value }))}
                      className="w-full bg-transparent border-b text-center py-2 text-xs focus:outline-none ff-serif font-light text-stone-850 placeholder-stone-300 transition-colors"
                      style={{ borderColor: `${accentColor}40` }}
                    />
                  </div>

                  {/* Attendance Choice */}
                  <div className="space-y-3 pt-2">
                    <label className="ff-sans text-[7.5px] uppercase tracking-[0.2em] font-semibold text-stone-400 block text-center">
                      Will you attend?
                    </label>
                    
                    <div className="flex flex-col gap-3.5 max-w-55 mx-auto pt-1">
                      {/* Attending Selection */}
                      <label 
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-300 text-left"
                        style={{
                          backgroundColor: rsvpData.status === "attending" ? `${accentColor}10` : "transparent",
                          borderColor: rsvpData.status === "attending" ? accentColor : `${accentColor}20`
                        }}
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value="attending"
                          checked={rsvpData.status === "attending"}
                          onChange={() => setRsvpData((prev) => ({ ...prev, status: "attending" }))}
                          className="sr-only"
                        />
                        <div 
                          className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: rsvpData.status === "attending" ? accentColor : `${accentColor}60` }}
                        >
                          {rsvpData.status === "attending" && (
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                          )}
                        </div>
                        <span className="ff-serif italic text-xs text-stone-700">Joyfully Accepts</span>
                      </label>

                      {/* Declined Selection */}
                      <label 
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-300 text-left"
                        style={{
                          backgroundColor: rsvpData.status === "declined" ? `${accentColor}10` : "transparent",
                          borderColor: rsvpData.status === "declined" ? accentColor : `${accentColor}20`
                        }}
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value="declined"
                          checked={rsvpData.status === "declined"}
                          onChange={() => setRsvpData((prev) => ({ ...prev, status: "declined" }))}
                          className="sr-only"
                        />
                        <div 
                          className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: rsvpData.status === "declined" ? accentColor : `${accentColor}60` }}
                        >
                          {rsvpData.status === "declined" && (
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                          )}
                        </div>
                        <span className="ff-serif italic text-xs text-stone-700">Regretfully Declines</span>
                      </label>
                    </div>
                  </div>

                  {/* Submission Error */}
                  {rsvpError && (
                    <p className="text-[10px] text-red-600 ff-sans font-medium">
                      {rsvpError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={rsvpLoading}
                      className="px-8 py-3 rounded-full uppercase text-[10px] font-semibold tracking-widest text-white shadow-md transition-all duration-300 active:scale-95 hover:shadow-lg cursor-pointer disabled:opacity-50"
                      style={{
                        background: `radial-gradient(circle, ${accentColor}ee, ${accentColor})`
                      }}
                    >
                      {rsvpLoading ? "Submitting..." : "Send Response"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </section>
        )}

        {/* ── FOOTER SECTION ── */}
        <footer
          className="relative w-full flex flex-col justify-center items-center overflow-hidden py-12 px-8"
          style={{
            backgroundColor: bgColor,
            borderTop: `1px solid ${accentColor}20`,
          }}
        >
          {/* Card Border Frames */}
          <div className="absolute inset-4 rounded-[20px] pointer-events-none" style={{ border: `1px solid ${accentColor}35`, zIndex: 2 }} />
          <div className="absolute inset-5 rounded-2xl pointer-events-none" style={{ border: `0.5px solid ${accentColor}15`, zIndex: 2 }} />

          <div className="w-full max-w-sm flex flex-col justify-center items-center text-center space-y-6 relative z-10">
            
            {/* Bride & Groom Script Names */}
            <div className="space-y-1">
              <span className="ff-script text-3xl font-light text-stone-700 block" style={{ color: accentColor }}>
                {partner1} &amp; {partner2}
              </span>
              <div className="w-12 h-px mx-auto" style={{ backgroundColor: `${accentColor}30` }} />
            </div>

            {/* Date Footer String */}
            <div className="text-[10px] tracking-[0.25em] text-stone-500 ff-sans font-medium">
              {eventDay} . {dateObj.getMonth() + 1} . {eventYear}
            </div>

            {/* Attribution Block */}
            {attributionsEnabled && (attributionHeading || attributionNames) && (
              <div className="space-y-2 pt-4 border-t w-full border-dashed" style={{ borderColor: `${accentColor}25` }}>
                {attributionHeading && (
                  <span className="ff-sans uppercase tracking-[0.2em] text-[8px] font-semibold block text-stone-400">
                    {attributionHeading}
                  </span>
                )}
                {attributionNames && (
                  <p className="ff-serif italic text-xs text-stone-600 max-w-65 mx-auto leading-relaxed whitespace-pre-line">
                    {attributionNames}
                  </p>
                )}
              </div>
            )}

            {/* Branding credits */}
            {!hideBranding && (
              <div className="pt-6 text-[8px] uppercase tracking-[0.2em] font-semibold text-stone-400 opacity-60">
                Created with Cardessa
              </div>
            )}

          </div>
        </footer>

      </div>
      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 bg-stone-950/90 z-999 flex items-center justify-center p-4 cursor-pointer"
          >
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-6 right-6 text-white text-3xl font-light hover:scale-105 transition-transform"
              aria-label="Close lightbox"
            >
              ×
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedImg}
              alt="Enlarged moment"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border-2"
              style={{ borderColor: `${accentColor}40` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
