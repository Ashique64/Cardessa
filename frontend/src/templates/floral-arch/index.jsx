"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════
   PALETTE CONSTANTS
═══════════════════════════════════════════════════ */
const PALETTE = {
  ivory:   "#FBF8F2",
  gold:    "#B08D57",
  olive:   "#4A4A3A",
  taupe:   "#6B6455",
  sage:    "#8A9673",
  cream:   "#F5F0E8",
};

/* ═══════════════════════════════════════════════════
   REUSABLE: viewport-triggered reveal wrapper
═══════════════════════════════════════════════════ */
function RevealSection({ children, className = "", style = {}, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.88, delay, ease: [0.215, 0.61, 0.355, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════
   SMALL GOLD HEART ICON
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
   GOLD AMPERSAND DIVIDER with horizontal rules
═══════════════════════════════════════════════════ */
const AmpersandDivider = ({ gold = PALETTE.gold }) => (
  <div className="flex items-center justify-center gap-4 w-full max-w-[240px] mx-auto my-1">
    <div className="flex-1 h-px" style={{ backgroundColor: `${gold}60` }} />
    <span
      style={{
        fontFamily: "'Great Vibes', cursive",
        fontSize: 30,
        color: gold,
        lineHeight: 1,
        display: "block",
      }}
    >
      &amp;
    </span>
    <div className="flex-1 h-px" style={{ backgroundColor: `${gold}60` }} />
  </div>
);

/* ═══════════════════════════════════════════════════
   HEART + RULE DIVIDER
═══════════════════════════════════════════════════ */
const HeartDivider = ({ gold = PALETTE.gold }) => (
  <div className="flex items-center justify-center gap-3 w-full max-w-[200px] mx-auto my-3">
    <div className="flex-1 h-px" style={{ backgroundColor: `${gold}50` }} />
    <GoldHeart size={9} gold={gold} />
    <div className="flex-1 h-px" style={{ backgroundColor: `${gold}50` }} />
  </div>
);

/* ═══════════════════════════════════════════════════
   LEAF SPRIG DIVIDER (SVG)
═══════════════════════════════════════════════════ */
const LeafSprigDivider = ({ sage = PALETTE.sage, gold = PALETTE.gold }) => (
  <div className="flex items-center justify-center gap-2 my-3">
    <div className="h-px w-12" style={{ backgroundColor: `${gold}40` }} />
    <svg width="32" height="16" viewBox="0 0 32 16">
      <path d="M16 8 Q12 2 6 4" stroke={sage} strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="8" cy="5" rx="3" ry="5" fill={sage} opacity="0.6" transform="rotate(-30 8 5)" />
      <path d="M16 8 Q20 2 26 4" stroke={sage} strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="5" rx="3" ry="5" fill={sage} opacity="0.6" transform="rotate(30 24 5)" />
      <circle cx="16" cy="7" r="2" fill={gold} opacity="0.7" />
    </svg>
    <div className="h-px w-12" style={{ backgroundColor: `${gold}40` }} />
  </div>
);

/* ═══════════════════════════════════════════════════
   DATE ROW — 3-column
═══════════════════════════════════════════════════ */
const DateRow = ({ dayOfWeek, eventDay, eventMonth, eventYear, eventTime, gold = PALETTE.gold, taupe = PALETTE.taupe }) => (
  <div className="flex items-stretch justify-center mx-auto w-full max-w-[260px]">
    {/* Day of week */}
    <div className="flex-1 flex items-center justify-center border-r py-3 pr-3" style={{ borderColor: `${gold}45` }}>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: taupe, fontWeight: 600 }}>
        {dayOfWeek}
      </span>
    </div>

    {/* Center: date number + month + year */}
    <div className="flex flex-col items-center justify-center px-4 py-1">
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, color: gold, fontWeight: 300, lineHeight: 1 }}>
        {eventDay}
      </span>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: taupe, marginTop: 2 }}>
        {eventMonth}
      </span>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 8, letterSpacing: "0.15em", color: `${taupe}99` }}>
        {eventYear}
      </span>
    </div>

    {/* Time */}
    <div className="flex-1 flex flex-col items-center justify-center border-l py-3 pl-3 gap-0.5" style={{ borderColor: `${gold}45` }}>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: taupe, fontWeight: 600 }}>AT</span>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: taupe, fontWeight: 600 }}>{eventTime}</span>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   ARCH FRAME SVG (behind text, gold border)
═══════════════════════════════════════════════════ */
const ArchFrame = ({ gold = PALETTE.gold }) => (
  <svg
    viewBox="0 0 320 580"
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full pointer-events-none"
    style={{ zIndex: 2 }}
    aria-hidden="true"
  >
    {/* Outer arch: starts partway down, curves into arch at top, rectangular sides + bottom */}
    <path
      d="M 20 580 L 20 110 Q 20 28 160 28 Q 300 28 300 110 L 300 580"
      fill="none"
      stroke={gold}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.7"
    />
    {/* Inner dashed arch for depth */}
    <path
      d="M 30 580 L 30 116 Q 30 40 160 40 Q 290 40 290 116 L 290 580"
      fill="none"
      stroke={gold}
      strokeWidth="0.5"
      strokeDasharray="4 4"
      strokeLinecap="round"
      opacity="0.4"
    />
    {/* Small top fleur ornament */}
    <circle cx="160" cy="28" r="2.5" fill={gold} opacity="0.6" />
    <circle cx="160" cy="28" r="5" fill="none" stroke={gold} strokeWidth="0.6" opacity="0.5" />
  </svg>
);

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function FloralArch({ content = {}, mode = "live", onRsvpSubmit, hideBranding = false }) {
  const isPreOpen = mode === "preview" || mode === "editor";

  /* ── Content resolution ── */
  const groomName    = content.groom_name    || "Omar";
  const brideName    = content.bride_name    || "Tia";
  const venue        = content.venue_name    || "The Garden Pavilion";
  const venueAddress = content.venue_address || "123 Blossom Way, Loveville, CA 92345";
  const musicUrl     = content.music_url     || null;
  const musicEnabled = content.music_enabled !== false;
  const couplePhoto  = content.couple_photo  || null;
  const tagline      = content.tagline       || "TOGETHER WITH THEIR FAMILIES";
  const inviteMsg    = content.invite_message || "JOYFULLY INVITE YOU TO CELEBRATE THEIR WEDDING";
  const receptionNote = content.reception_note || "reception to follow";

  /* ── Palette ── */
  const gold  = PALETTE.gold;
  const olive = PALETTE.olive;
  const taupe = PALETTE.taupe;
  const sage  = PALETTE.sage;
  const ivory = PALETTE.ivory;

  /* ── Date parsing ── */
  const rawDate  = content.event_date || null;
  const dateObj  = rawDate ? new Date(rawDate) : new Date("2025-05-24");
  const DAYS     = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const dayOfWeek  = DAYS[dateObj.getDay()];
  const eventDay   = dateObj.getDate();
  const eventMonth = dateObj.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const eventYear  = dateObj.getFullYear();
  const eventTime  = content.event_time || "04:00 PM";

  /* ── Name display order ── */
  const displayOrder = content.name_display_order || "bride_first";
  const name1 = displayOrder === "bride_first" ? brideName : groomName;  // top name
  const name2 = displayOrder === "bride_first" ? groomName : brideName;  // bottom name
  const initial1 = (name1[0] || "T").toUpperCase();
  const initial2 = (name2[0] || "O").toUpperCase();
  const initials  = initial1 + initial2;

  const ceremonyType = content.ceremony_type || "Wedding";

  /* ── State ── */
  const [isOpen, setIsOpen]   = useState(isPreOpen);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  /* ── Countdown ── */
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!rawDate) return;
    const target = new Date(`${rawDate}T${content.event_time || "16:00"}`).getTime();
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

  /* ── RSVP ── */
  const [rsvpData,      setRsvpData]      = useState({ guest_name: "", status: "attending" });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading,   setRsvpLoading]   = useState(false);
  const [rsvpError,     setRsvpError]     = useState("");

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
    else          { audioRef.current.pause(); setIsMuted(true); }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!onRsvpSubmit) { setRsvpSubmitted(true); return; }
    setRsvpLoading(true); setRsvpError("");
    try   { await onRsvpSubmit(rsvpData); setRsvpSubmitted(true); }
    catch (err) { setRsvpError(err?.message || "Failed to submit RSVP."); }
    finally { setRsvpLoading(false); }
  };

  /* ── Motion variants ── */
  const fadeUp = (i = 0) => ({
    hidden:  { opacity: 0, y: 18 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.4 + i * 0.18 }
    },
  });

  const slideInTL = {
    hidden:  { x: -36, y: -36, opacity: 0 },
    visible: { x: 0,   y: 0,   opacity: 1,
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 } },
  };
  const slideInBR = {
    hidden:  { x: 36,  y: 36,  opacity: 0 },
    visible: { x: 0,   y: 0,   opacity: 1,
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 } },
  };
  const slideInBL = {
    hidden:  { x: -30, y: 30,  opacity: 0 },
    visible: { x: 0,   y: 0,   opacity: 1,
      transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 } },
  };
  const archDraw = {
    hidden:  { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1,
      transition: { duration: 2.2, ease: "easeInOut", delay: 0.6 } },
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div
      className="min-h-screen flex flex-col items-center overflow-x-hidden select-none"
      style={{ backgroundColor: ivory }}
    >
      {/* Google Fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Montserrat:wght@300;400;500;600&display=swap');
        .ff-serif  { font-family: "Cormorant Garamond", "Playfair Display", serif; }
        .ff-script { font-family: "Great Vibes", cursive; }
        .ff-sans   { font-family: "Montserrat", sans-serif; }
      ` }} />

      {musicEnabled && musicUrl && <audio ref={audioRef} src={musicUrl} loop />}

      {/* Mute toggle */}
      {isOpen && musicEnabled && musicUrl && (
        <div className="fixed top-5 right-5 z-50">
          <button
            onClick={toggleAudio}
            className="h-10 w-10 rounded-full border flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: ivory, borderColor: gold, color: olive }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" /></svg>
              : <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            }
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════
          COVER SCREEN
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 1.1, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6"
            style={{ backgroundColor: ivory }}
          >
            {/* Cover corner flowers */}
            {/* Static outer div holds the positional offset — keeps it independent of Framer Motion */}
            <div className="absolute pointer-events-none" style={{ top: -20, left: -20, zIndex: 5 }}>
              <img
                src="/Images/Templates/Floral-Arch/top-left-design.png"
                alt="" aria-hidden="true"
                style={{ width: 200, height: 200, objectFit: "contain", objectPosition: "left top", opacity: 0.97 }}
              />
            </div>
            <div className="absolute bottom-0 right-0 pointer-events-none">
              <img
                src="/Images/Templates/Floral-Arch/floral-arch-corner-flower.jpg"
                alt="" aria-hidden="true"
                style={{ width: 200, height: 200, objectFit: "cover", objectPosition: "left top", mixBlendMode: "multiply", opacity: 0.95, transform: "scaleX(-1) scaleY(-1)" }}
              />
            </div>

            <div className="relative z-10 max-w-xs w-full space-y-10">
              <div className="space-y-4">
                <p className="ff-sans uppercase tracking-[0.25em] font-semibold" style={{ fontSize: 10, color: taupe }}>
                  {tagline}
                </p>
                <h1 className="ff-serif font-light leading-tight" style={{ fontSize: "clamp(36px, 10vw, 52px)", color: olive }}>
                  {name1}<br />
                  <span className="ff-script block font-normal" style={{ fontSize: "clamp(28px, 8vw, 36px)", color: gold, lineHeight: 1.3 }}>&amp;</span>
                  {name2}
                </h1>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleOpenInvite}
                  className="h-16 w-16 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
                  style={{ background: `radial-gradient(circle, ${sage}cc, ${sage})`, border: `1px solid ${ivory}` }}
                  aria-label="Open invitation"
                >
                  <span className="ff-serif text-xl font-medium tracking-widest">{initials}</span>
                </button>
                <span className="ff-sans text-[9px] uppercase tracking-widest font-semibold text-stone-400 animate-pulse">
                  Open Invitation
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          MAIN INVITATION CARD
      ══════════════════════════════════════ */}
      <div className="w-full max-w-[700px] flex flex-col">

        {/* ────────────────────────────────────
            HERO SECTION
        ──────────────────────────────────── */}
        <section
          className="relative w-full overflow-hidden"
          style={{
            backgroundColor: ivory,
            minHeight: "100svh",
          }}
        >
          {/* ── TOP-LEFT Floral Corner ── */}
          {/* Static outer div holds the corner offset independently of Framer Motion transform */}
          <div className="absolute pointer-events-none" style={{ top: -20, left: -20, zIndex: 5 }}>
            <motion.div
              variants={slideInTL}
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
            >
              <img
                src="/Images/Templates/Floral-Arch/top-left-design.png"
                alt="" aria-hidden="true"
                style={{
                  width: "clamp(200px, 46vw, 300px)",
                  height: "clamp(200px, 46vw, 300px)",
                  objectFit: "contain",
                  objectPosition: "left top",
                  opacity: 0.97,
                }}
              />
            </motion.div>
          </div>

          {/* ── BOTTOM-RIGHT Floral Corner ── */}
          <motion.div
            variants={slideInBR}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            className="absolute bottom-0 right-0 pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <img
              src="/Images/Templates/Floral-Arch/floral-arch-corner-flower.jpg"
              alt="" aria-hidden="true"
              style={{
                width: "clamp(180px, 42vw, 290px)",
                height: "clamp(180px, 42vw, 290px)",
                objectFit: "cover",
                objectPosition: "left top",
                mixBlendMode: "multiply",
                opacity: 0.97,
                transform: "scaleX(-1) scaleY(-1)",
              }}
            />
          </motion.div>

          {/* ── BOTTOM-LEFT Couple Illustration ── */}
          <motion.div
            variants={slideInBL}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            className="absolute bottom-0 left-0 pointer-events-none hidden sm:block"
            style={{ zIndex: 6 }}
          >
            <img
              src={couplePhoto || "/Images/Templates/Floral-Arch/couple-illustration.png"}
              alt="Bride and Groom"
              style={{
                width: "clamp(140px, 36vw, 240px)",
                height: "auto",
                maxHeight: "55%",
                objectFit: "contain",
                objectPosition: "bottom",
              }}
            />
          </motion.div>

          {/* ── GOLD ARCH FRAME SVG — Premium Cathedral Style ── */}
          <div
            className="absolute pointer-events-none"
            style={{ inset: 0, zIndex: 3 }}
          >
            <svg
              viewBox="0 0 320 480"
              preserveAspectRatio="none"
              className="w-full h-full"
              aria-hidden="true"
            >
              {/* ── Outer arch: pointed gothic/cathedral apex ── */}
              <motion.path
                d="M 24 480 L 24 160 C 24 60 160 16 160 16 C 160 16 296 60 296 160 L 296 480"
                fill="none"
                stroke={gold}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={archDraw}
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
              />
              {/* ── Inner dashed echo ── */}
              <motion.path
                d="M 34 480 L 34 163 C 34 72 160 30 160 30 C 160 30 286 72 286 163 L 286 480"
                fill="none"
                stroke={gold}
                strokeWidth="0.5"
                strokeDasharray="5 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={archDraw}
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
              />
              {/* ── Apex pointed ornament ── */}
              <motion.path
                d="M 160 6 L 165 16 L 160 14 L 155 16 Z"
                fill={gold} opacity="0.7"
                initial={{ opacity: 0, y: -4 }}
                animate={isOpen ? { opacity: 0.7, y: 0 } : { opacity: 0, y: -4 }}
                transition={{ delay: 2.5, duration: 0.5 }}
              />
              {/* ── Small diamonds at arch foot left ── */}
              <motion.rect
                x="20" y="474" width="8" height="8" rx="1"
                fill="none" stroke={gold} strokeWidth="0.8"
                transform="rotate(45 24 478)"
                initial={{ opacity: 0 }}
                animate={isOpen ? { opacity: 0.6 } : { opacity: 0 }}
                transition={{ delay: 2.6, duration: 0.5 }}
              />
              {/* ── Small diamonds at arch foot right ── */}
              <motion.rect
                x="292" y="474" width="8" height="8" rx="1"
                fill="none" stroke={gold} strokeWidth="0.8"
                transform="rotate(45 296 478)"
                initial={{ opacity: 0 }}
                animate={isOpen ? { opacity: 0.6 } : { opacity: 0 }}
                transition={{ delay: 2.6, duration: 0.5 }}
              />
              {/* ── Horizontal base rule ── */}
              <motion.line
                x1="24" y1="478" x2="296" y2="478"
                stroke={gold} strokeWidth="0.6"
                variants={archDraw}
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
              />
              {/* ── Decorative pillar marks left ── */}
              <motion.line x1="24" y1="440" x2="40" y2="440" stroke={gold} strokeWidth="0.5"
                initial={{ opacity: 0 }} animate={isOpen ? { opacity: 0.5 } : { opacity: 0 }} transition={{ delay: 2.7, duration: 0.4 }} />
              <motion.line x1="24" y1="400" x2="36" y2="400" stroke={gold} strokeWidth="0.4"
                initial={{ opacity: 0 }} animate={isOpen ? { opacity: 0.4 } : { opacity: 0 }} transition={{ delay: 2.8, duration: 0.4 }} />
              {/* ── Decorative pillar marks right ── */}
              <motion.line x1="296" y1="440" x2="280" y2="440" stroke={gold} strokeWidth="0.5"
                initial={{ opacity: 0 }} animate={isOpen ? { opacity: 0.5 } : { opacity: 0 }} transition={{ delay: 2.7, duration: 0.4 }} />
              <motion.line x1="296" y1="400" x2="284" y2="400" stroke={gold} strokeWidth="0.4"
                initial={{ opacity: 0 }} animate={isOpen ? { opacity: 0.4 } : { opacity: 0 }} transition={{ delay: 2.8, duration: 0.4 }} />
            </svg>
          </div>

          {/* ── HERO TEXT CONTENT: names only ── */}
          <div
            className="relative flex flex-col items-center justify-center text-center"
            style={{
              zIndex: 10,
              paddingTop: "clamp(90px, 16vh, 140px)",
              paddingBottom: "clamp(60px, 10vh, 100px)",
              paddingLeft:   "clamp(28px, 8vw, 80px)",
              paddingRight:  "clamp(28px, 8vw, 80px)",
            }}
          >
            {/* 1. Gold heart icon */}
            <motion.div variants={fadeUp(0)} initial="hidden" animate={isOpen ? "visible" : "hidden"} className="mb-3">
              <GoldHeart size={11} gold={gold} />
            </motion.div>

            {/* 2. Tagline */}
            <motion.p
              variants={fadeUp(1)} initial="hidden" animate={isOpen ? "visible" : "hidden"}
              className="ff-sans uppercase font-semibold tracking-[0.18em] mb-5"
              style={{ fontSize: 10, color: taupe }}
            >
              {tagline}
            </motion.p>

            {/* 3. Name 1 */}
            <motion.h1
              variants={fadeUp(2)} initial="hidden" animate={isOpen ? "visible" : "hidden"}
              className="ff-serif font-light leading-none"
              style={{ fontSize: "clamp(52px, 13vw, 82px)", color: olive, letterSpacing: "0.02em" }}
            >
              {name1}
            </motion.h1>

            {/* 4. Script "&" with flanking rules */}
            <motion.div variants={fadeUp(3)} initial="hidden" animate={isOpen ? "visible" : "hidden"} className="w-full my-1">
              <AmpersandDivider gold={gold} />
            </motion.div>

            {/* 5. Name 2 */}
            <motion.h1
              variants={fadeUp(4)} initial="hidden" animate={isOpen ? "visible" : "hidden"}
              className="ff-serif font-light leading-none"
              style={{ fontSize: "clamp(52px, 13vw, 82px)", color: olive, letterSpacing: "0.02em" }}
            >
              {name2}
            </motion.h1>

            {/* Scroll cue */}
            <motion.p
              variants={fadeUp(5)} initial="hidden" animate={isOpen ? "visible" : "hidden"}
              className="ff-sans text-[8px] uppercase tracking-[0.28em] animate-pulse mt-10"
              style={{ color: gold }}
            >
              scroll to explore
            </motion.p>

          </div>
        </section>

      </div>{/* /max-w-[700px] */}

    </div>
  );
}
