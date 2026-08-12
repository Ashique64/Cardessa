"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Scratch reveal component tailored for Begin Forever
function ScratchReveal({ date, accentColor, onReveal }) {
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

    // Premium gold texture pattern
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#AA7C11");
    grad.addColorStop(0.3, "#F3E5AB");
    grad.addColorStop(0.7, "#D4AF37");
    grad.addColorStop(1, "#8A660F");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 15) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 20, canvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = "#42320b";
    ctx.font = "italic bold 12px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch for Date", canvas.width / 2, canvas.height / 2);
  }, [date]);

  const scratch = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 24, 0, Math.PI * 2);
    ctx.fill();

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    if ((transparent / (canvas.width * canvas.height)) * 100 > 40) {
      setIsRevealed(true);
      if (onReveal) onReveal();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-32 rounded-2xl overflow-hidden shadow-md flex items-center justify-center bg-zinc-900 border border-amber-500/20"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/90 p-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-1">Wedding Date</span>
        <p className="font-serif text-2xl font-light text-amber-100 tracking-wide">{date}</p>
        <span className="text-[8px] uppercase tracking-widest text-zinc-500 mt-1">Begin Forever</span>
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

export default function BeginForever({ content = {}, mode = "live", onRsvpSubmit, hideBranding = false }) {
  const isLive = mode === "live";
  const isPreOpen = mode === "preview" || mode === "editor";

  // Resolve content fields with sensible fallbacks
  const groomName = content.groom_name || "Farhan";
  const brideName = content.bride_name || "Zoya";
  const venue = content.venue_name || "Grand Regency Banquets";
  const venueAddress = content.venue_address || "MG Road, Bangalore, KA";
  const accentColor = content.accent_color || "#D4AF37"; // Royal Gold
  const bgColor = content.bg_color || "#121212"; // Midnight Obsidian
  const musicUrl = content.music_url || null;
  const musicEnabled = content.music_enabled !== false;

  const rawDate = content.event_date || null;
  const displayDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : "January 24, 2027";
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

  // Cover / audio state
  const [isOpen, setIsOpen] = useState(isPreOpen);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  // Countdown
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!rawDate) return;
    const target = new Date(`${rawDate}T19:00:00`).getTime();
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
      className="min-h-screen text-zinc-100 flex flex-col justify-between overflow-x-hidden font-sans select-none relative"
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
            className="h-9 w-9 rounded-full bg-black/80 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm cursor-pointer"
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
        {/* ── Wax Seal Cover Screen ── */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1.1, ease: [0.85, 0, 0.15, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none"
            style={{ backgroundColor: bgColor }}
          >
            {/* Elegant luxury frame */}
            <div className="absolute inset-5 rounded-3xl pointer-events-none" style={{ border: `2px solid ${accentColor}2b` }} />
            <div className="absolute inset-6 rounded-3xl pointer-events-none" style={{ border: `1px solid ${accentColor}15` }} />

            <div className="max-w-md w-full space-y-12 relative z-10">
              <div className="space-y-4">
                <div className="text-4xl text-amber-500 font-serif font-light mb-2">✦</div>
                <span className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: accentColor }}>
                  The Royal {ceremonyType} Union
                </span>
                <h1 className="font-serif text-5xl font-light text-zinc-100 leading-snug tracking-wide">
                  {partner1} <br />
                  <span className="italic font-normal font-serif" style={{ color: accentColor }}>&amp;</span> <br />
                  {partner2}
                </h1>
              </div>

              {/* Pulsing Monogram Seal */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleOpenInvite}
                  className="h-20 w-20 rounded-full border-2 border-amber-500/40 flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition duration-300 cursor-pointer relative"
                  style={{ background: `radial-gradient(circle, #AA7C11, #42320b)` }}
                  aria-label="Open invitation"
                >
                  <span className="absolute inset-0 rounded-full animate-ping opacity-35 pointer-events-none" style={{ border: `1px solid ${accentColor}` }} />
                  <span className="font-serif text-xl font-bold tracking-widest text-amber-200">{initials}</span>
                </button>
                <span className="text-[9px] uppercase tracking-widest font-bold text-amber-500/70 animate-pulse">
                  Break The Wax Seal
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Scroll Content ── */}
      <div className="flex-1 flex flex-col items-center">
        {/* Obsidian Hero Section */}
        <section className="min-h-screen w-full max-w-xl bg-zinc-950 border-x border-zinc-900 shadow-2xl flex flex-col justify-between p-12 relative overflow-hidden">
          
          {/* Ornate corners */}
          <div className="absolute top-8 left-8 text-2xl" style={{ color: `${accentColor}40` }}>✦</div>
          <div className="absolute top-8 right-8 text-2xl" style={{ color: `${accentColor}40` }}>✦</div>
          <div className="absolute bottom-8 left-8 text-2xl" style={{ color: `${accentColor}40` }}>✦</div>
          <div className="absolute bottom-8 right-8 text-2xl" style={{ color: `${accentColor}40` }}>✦</div>

          <div className="text-center my-auto space-y-12 pt-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accentColor }}>
              Begin Forever
            </span>

            <div className="space-y-4">
              <h1 className="font-serif text-5xl font-light text-zinc-150 tracking-wide">
                {partner1} <br />
                <span className="italic font-normal font-serif" style={{ color: accentColor }}>&amp;</span> <br />
                {partner2}
              </h1>
              <p className="text-[11px] text-amber-500/80 uppercase tracking-widest font-sans max-w-xs mx-auto whitespace-pre-line mb-3">
                {parentsGreeting}
              </p>
              <p className="text-xs text-zinc-400 italic max-w-xs mx-auto leading-relaxed">
                request the honor of your presence to witness the beginning of our forever.
              </p>
            </div>

            <div className="max-w-xs mx-auto pt-6">
              <ScratchReveal date={displayDate} accentColor={accentColor} />
            </div>
          </div>

          <div className="text-center text-[9px] text-zinc-500 uppercase tracking-widest pt-6">
            Scroll down to view royal ceremonies
          </div>
        </section>

        {/* Welcome Note Section (Optional, not on first page) */}
        {content.welcome_note && (
          <section className="w-full max-w-xl bg-zinc-950 border-x border-t border-zinc-900 px-12 py-16 text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] block" style={{ color: accentColor }}>Welcome Note</span>
            <p className="font-serif text-2xl font-light italic text-zinc-150 leading-relaxed max-w-sm mx-auto">
              "{content.welcome_note}"
            </p>
          </section>
        )}

        {/* Countdown */}
        <section className="w-full max-w-xl bg-zinc-950 border-x border-t border-zinc-900 px-12 py-16 text-center">
          <h2 className="font-serif text-2xl font-light text-zinc-200 mb-10 tracking-wide">
            The Golden <span className="italic font-normal">Countdown</span>
          </h2>
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {[
              { val: countdown.days, lbl: "Days" },
              { val: countdown.hours, lbl: "Hours" },
              { val: countdown.mins, lbl: "Mins" },
              { val: countdown.secs, lbl: "Secs" },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="bg-zinc-900 border border-amber-500/20 rounded-xl p-3 flex flex-col items-center shadow-xs">
                <span className="font-serif text-2xl font-semibold" style={{ color: accentColor }}>{val}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 mt-1">{lbl}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Our Story (Optional) */}
        {content.our_story && (
          <section className="w-full max-w-xl bg-zinc-950 border-x border-t border-zinc-900 px-12 py-16 text-center space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accentColor }}>Our Love Story</span>
            <h2 className="font-serif text-2xl font-light text-zinc-200 tracking-wide">
              How We <span className="italic font-normal">Began</span>
            </h2>
            <p className="text-xs text-zinc-400 italic max-w-sm mx-auto leading-relaxed whitespace-pre-line">
              {content.our_story}
            </p>
          </section>
        )}

        {/* Photo Album / Gallery */}
        {content.photo_album_enabled && content.photo_album && content.photo_album.filter(Boolean).length > 0 && (
          <section className="w-full max-w-xl bg-zinc-950 border-x border-t border-zinc-900 px-6 py-16 text-center space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accentColor }}>Memories</span>
            <h2 className="font-serif text-2xl font-light text-zinc-200 tracking-wide">
              Our <span className="italic font-normal">Photo Album</span>
            </h2>
            <div className="grid grid-cols-2 gap-3.5 max-w-md mx-auto">
              {content.photo_album.filter(Boolean).map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  className="aspect-square rounded-xl overflow-hidden border border-amber-500/20 shadow-md hover:scale-[1.02] transition duration-300 relative group cursor-pointer"
                >
                  <img src={imgUrl} alt={`Album Memory ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-350" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Event Schedule */}
        <section className="w-full max-w-xl bg-zinc-950 border-x border-t border-zinc-900 px-12 py-16 space-y-12">
          <h2 className="font-serif text-2xl font-light text-zinc-200 text-center tracking-wide">
            Royal <span className="italic font-normal">Schedule</span>
          </h2>
          <div className="space-y-6">
            {[
              { title: `${ceremonyType} Ceremony`, time: `${displayTime}${content.end_date_time ? ` - ${content.end_date_time}` : ""}`, venue: venue, dress: "Royal ethic wear" },
              { title: "Valima / Grand Banquet", time: "08:30 PM onwards", venue: venue, dress: "Black tie formal" },
            ].map((evt) => (
              <div key={evt.title} className="bg-zinc-900/60 border border-amber-500/10 p-6 rounded-2xl">
                <h3 className="font-serif text-lg font-medium text-amber-200">{evt.title}</h3>
                <div className="h-px bg-zinc-800 my-3" />
                <div className="space-y-2 text-xs text-zinc-400">
                  <p>⏰ <strong>Time:</strong> {evt.time}</p>
                  <p>📍 <strong>Venue:</strong> {evt.venue}</p>
                  <p>👔 <strong>Dress Code:</strong> {evt.dress}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Location */}
        <section className="w-full max-w-xl bg-zinc-950 border-x border-t border-zinc-900 px-12 py-16 space-y-8">
          <h2 className="font-serif text-2xl font-light text-zinc-200 text-center tracking-wide">
            The Banquet <span className="italic font-normal">Location</span>
          </h2>
          <div className="h-60 bg-zinc-900 rounded-2xl overflow-hidden border border-amber-500/15 relative">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${venue}, ${venueAddress}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-450 max-w-xs mx-auto mb-6">{venueAddress}</p>
            <a
              href={content.google_map_link || `https://maps.google.com/?q=${encodeURIComponent(`${venue}, ${venueAddress}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-zinc-950 font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-widest shadow-md transition"
              style={{ backgroundColor: accentColor }}
            >
              Get Location Map
            </a>
          </div>
        </section>

        {/* RSVP Form */}
        {content.rsvp_enabled && (
          <section className="w-full max-w-xl bg-zinc-950 border-x border-t border-zinc-900 px-12 py-16 space-y-8 pb-16">
            <h2 className="font-serif text-2xl font-light text-zinc-150 text-center tracking-wide">
              Confirm <span className="italic font-normal">Attendance</span>
            </h2>

            {rsvpSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-zinc-900 border border-amber-500/20 rounded-2xl max-w-sm mx-auto space-y-3"
              >
                <div className="h-10 w-10 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
                <h3 className="font-serif text-lg font-medium text-zinc-100">Blessings Received</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">Thank you for confirming your presence.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-sm mx-auto">
                {rsvpError && (
                  <div className="bg-red-950 border border-red-900 text-red-400 text-xs font-medium px-4 py-3 rounded-xl">{rsvpError}</div>
                )}
                <input
                  type="text" required placeholder="Guest Name"
                  value={rsvpData.guest_name}
                  onChange={(e) => setRsvpData({ ...rsvpData, guest_name: e.target.value })}
                  className="w-full bg-zinc-900 border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-zinc-100 placeholder:text-zinc-500"
                />
                <select 
                  value={rsvpData.status} 
                  onChange={(e) => setRsvpData({ ...rsvpData, status: e.target.value })} 
                  className="w-full bg-zinc-900 border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none text-zinc-450"
                >
                  <option value="attending">Will Attend</option>
                  <option value="declined">Will Decline</option>
                </select>
                <button
                  type="submit" disabled={rsvpLoading}
                  className="w-full text-zinc-950 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: accentColor }}
                >
                  {rsvpLoading ? "Confirming…" : "Send RSVP"}
                </button>
              </form>
            )}
          </section>
        )}

        {/* Attributions Section (Optional) */}
        {(content.attribution_heading || content.attribution_names) && (
          <section className="w-full max-w-xl bg-zinc-950 border-x border-t border-zinc-900 px-12 py-16 text-center space-y-2 pb-24">
            {content.attribution_heading && (
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] block" style={{ color: accentColor }}>
                {content.attribution_heading}
              </span>
            )}
            {content.attribution_names && (
              <p className="font-serif text-2xl font-light italic text-zinc-150">
                {content.attribution_names}
              </p>
            )}
          </section>
        )}
      </div>

      {!hideBranding && (
        <footer className="text-center text-[10px] text-zinc-500 py-8 border-t border-zinc-900 max-w-xl mx-auto w-full">
          Made with Cardessa Royal Begin Forever Theme
        </footer>
      )}
    </div>
  );
}
