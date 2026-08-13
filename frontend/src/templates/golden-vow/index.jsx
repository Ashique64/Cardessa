"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  /* ── Cover & Audio State ── */
  const [isOpen, setIsOpen]   = useState(isPreOpen);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

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

  /* ── Load Google Fonts dynamically once on mount ── */
  useEffect(() => {
    const linkId = "google-fonts-golden-vow";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Alex+Brush&family=Montserrat:wght@300;400;500;600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  /* ── RSVP State ── */
  const [rsvpData, setRsvpData] = useState({ guest_name: "", status: "attending" });
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
        .ff-serif { font-family: "Playfair Display", serif; }
        .ff-script { font-family: "Alex Brush", cursive; }
        .ff-sans { font-family: "Montserrat", sans-serif; }
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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none"
            style={{ backgroundColor: bgColor }}
          >
            {/* Elegant double gold frames for cover screen */}
            <div className="absolute inset-5 rounded-3xl pointer-events-none" style={{ border: `1px solid ${accentColor}45` }} />
            <div className="absolute inset-6 rounded-3xl pointer-events-none" style={{ border: `0.5px solid ${accentColor}25` }} />

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
      <div className="w-full max-w-[550px] flex flex-col min-h-screen bg-white shadow-2xl relative">
        
        {/* ── HERO SECTION ── */}
        <section
          className="relative w-full flex flex-col justify-between overflow-hidden"
          style={{
            backgroundColor: bgColor,
            minHeight: "100svh",
          }}
        >
          {/* Top-Left Corner Flower */}
          <div className="absolute pointer-events-none" style={{ top: "-10px", left: "-10px", zIndex: 5 }}>
            {isLive ? (
              <motion.div
                variants={slideInTL}
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
              >
                <img
                  src="/Images/Templates/Golden-Vow/corner-flower.png"
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "clamp(160px, 38vw, 240px)",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "left top",
                    mixBlendMode: "multiply",
                    opacity: 0.98,
                  }}
                />
              </motion.div>
            ) : (
              <div>
                <img
                  src="/Images/Templates/Golden-Vow/corner-flower.png"
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "clamp(160px, 38vw, 240px)",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "left top",
                    mixBlendMode: "multiply",
                    opacity: 0.98,
                  }}
                />
              </div>
            )}
          </div>

          {/* Bottom-Right Corner Flower */}
          <div className="absolute pointer-events-none" style={{ bottom: "-10px", right: "-10px", zIndex: 5 }}>
            {isLive ? (
              <motion.div
                variants={slideInBR}
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
              >
                <img
                  src="/Images/Templates/Golden-Vow/corner-flower.png"
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "clamp(160px, 38vw, 240px)",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "left top",
                    mixBlendMode: "multiply",
                    opacity: 0.98,
                    transform: "rotate(180deg)",
                  }}
                />
              </motion.div>
            ) : (
              <div>
                <img
                  src="/Images/Templates/Golden-Vow/corner-flower.png"
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "clamp(160px, 38vw, 240px)",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "left top",
                    mixBlendMode: "multiply",
                    opacity: 0.98,
                    transform: "rotate(180deg)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Gold Stepped Arch Frame */}
          <SteppedArchFrame gold={accentColor} isOpen={isOpen} isLive={isLive} />

          {/* Core Content Inside Arch */}
          <div
            className="relative flex-1 flex flex-col items-center justify-between text-center select-none"
            style={{
              zIndex: 10,
              paddingTop: "clamp(110px, 18vh, 150px)",
              paddingBottom: "clamp(60px, 10vh, 80px)",
              paddingLeft: "clamp(24px, 6vw, 48px)",
              paddingRight: "clamp(24px, 6vw, 48px)",
            }}
          >
            {/* Top Details (Ceremony Type) */}
            <div className="space-y-4">
              {isLive ? (
                <>
                  <motion.div variants={fadeUp(0)} initial="hidden" animate={isOpen ? "visible" : "hidden"}>
                    <GoldHeart size={10} gold={accentColor} />
                  </motion.div>
                  <motion.p
                    variants={fadeUp(1)}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="ff-sans uppercase font-medium tracking-[0.24em] text-[10px]"
                    style={{ color: accentColor }}
                  >
                    {ceremonyType}
                  </motion.p>
                </>
              ) : (
                <>
                  <div>
                    <GoldHeart size={10} gold={accentColor} />
                  </div>
                  <p
                    className="ff-sans uppercase font-medium tracking-[0.24em] text-[10px]"
                    style={{ color: accentColor }}
                  >
                    {ceremonyType}
                  </p>
                </>
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
                  className="ff-serif font-light leading-none tracking-wide text-stone-850"
                  style={{ fontSize: "clamp(34px, 8.5vw, 50px)", color: PALETTE.charcoal }}
                >
                  {partner1}
                </motion.h1>
              ) : (
                <h1
                  className="ff-serif font-light leading-none tracking-wide text-stone-850"
                  style={{ fontSize: "clamp(34px, 8.5vw, 50px)", color: PALETTE.charcoal, letterSpacing: "0.03em" }}
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
                  className="ff-serif font-light leading-none tracking-wide text-stone-850"
                  style={{ fontSize: "clamp(34px, 8.5vw, 50px)", color: PALETTE.charcoal }}
                >
                  {partner2}
                </motion.h1>
              ) : (
                <h1
                  className="ff-serif font-light leading-none tracking-wide text-stone-850"
                  style={{ fontSize: "clamp(34px, 8.5vw, 50px)", color: PALETTE.charcoal, letterSpacing: "0.03em" }}
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
                  className="ff-sans text-[10px] uppercase font-semibold tracking-wider text-zinc-500 max-w-[280px] mx-auto leading-relaxed"
                >
                  {tagline}
                  <span className="block mt-2 font-normal text-zinc-400 capitalize ff-serif text-sm italic">
                    {inviteMsg}
                  </span>
                </motion.p>
              ) : (
                <p
                  className="ff-sans text-[10px] uppercase font-semibold tracking-wider text-zinc-500 max-w-[280px] mx-auto leading-relaxed"
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

      </div>
    </div>
  );
}
