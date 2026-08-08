"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Scratch Card Sub-component ───
function ScratchCard({ date, primaryColor }) {
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

    // Fill with matte gold texture gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#D4AF37");
    grad.addColorStop(0.5, "#F3E5AB");
    grad.addColorStop(1, "#AA7C11");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Overlay texture lines
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
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check progress
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
    <div ref={containerRef} className="relative w-full h-36 bg-amber-50/20 border border-brand-accent/20 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
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

// ─── Main Guest Invitation View ───
export default function GuestInvitationPage() {
  const { slug } = useParams();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Envelope and audio states
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const audioRef = useRef(null);

  // RSVP Form states
  const [rsvpData, setRsvpData] = useState({
    guest_name: "",
    email: "",
    phone: "",
    status: "attending",
    guest_count: 1,
    message: ""
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/`);
        if (!res.ok) {
          setError("This invitation page is not active or could not be found.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setInvite(data);
      } catch {
        setError("Error loading invitation page.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvitation();
  }, [slug]);

  // Start Countdown once invitation date is loaded
  useEffect(() => {
    if (!invite || !invite.event_date) return;
    const target = new Date(`${invite.event_date}T18:00:00`).getTime();
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
  }, [invite]);

  const handleOpenInvite = () => {
    setIsOpen(true);
    if (audioRef.current && invite?.config?.music_enabled !== false) {
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
    setRsvpLoading(true);
    setRsvpError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/rsvp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rsvpData)
      });
      if (res.ok) {
        setRsvpSubmitted(true);
      } else {
        const data = await res.json();
        setRsvpError(Object.values(data).flat().join(" ") || "Failed to submit RSVP.");
      }
    } catch {
      setRsvpError("Network error. Please try again.");
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F4F0] flex flex-col items-center justify-center font-sans text-brand-text-muted">
        <div className="animate-spin h-7 w-7 border-4 border-brand-accent border-t-transparent rounded-full mb-3" />
        <p className="text-xs uppercase tracking-widest font-bold">Loading Invitation…</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-[#F6F4F0] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-brand-border/60 max-w-sm p-8 rounded-3xl shadow-xs">
          <p className="text-sm font-semibold text-brand-dark mb-4">{error || "Invitation Unavailable"}</p>
          <Link href="/" className="text-xs text-brand-accent hover:underline uppercase tracking-wider font-bold">
            Back to Cardessa
          </Link>
        </div>
      </div>
    );
  }

  // Fallback defaults if config object is empty/null
  const cfg = invite.config || {};
  const groomName = cfg.groom || "Rahul";
  const brideName = cfg.bride || "Priya";
  const venue = cfg.venueName || "Grand Palace Resort";
  const venueAddress = cfg.venueAddress || "Bypass road, Mumbai, MH";
  const bgColor = cfg.bgColor || "#F6F4F0";
  const accentColor = cfg.primaryColor || "#6B8E70";
  const displayDate = invite.event_date
    ? new Date(invite.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "November 15, 2026";
  const displayTime = cfg.time ? `${cfg.time} PM` : "06:00 PM";

  const initials = (groomName[0] || "") + (brideName[0] || "");

  return (
    <div
      className="min-h-screen text-brand-dark flex flex-col justify-between overflow-x-hidden font-sans select-none relative"
      style={{ backgroundColor: bgColor }}
    >
      
      {/* Background ambient music track */}
      {cfg.music_enabled !== false && (
        <audio
          ref={audioRef}
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          loop
        />
      )}

      {/* Floating sound toggle */}
      {isOpen && cfg.music_enabled !== false && (
        <div className="fixed top-6 right-6 z-40">
          <button
            onClick={toggleAudio}
            className="h-9 w-9 rounded-full bg-white/90 border border-brand-border flex items-center justify-center text-brand-dark hover:bg-brand-accent hover:text-white transition duration-300 shadow-xs cursor-pointer"
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
        {/* ── Cover Envelope Screen ── */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: [0.85, 0, 0.15, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none"
            style={{ backgroundColor: bgColor }}
          >
            {/* Elegant double border frame */}
            <div className="absolute inset-4 border border-brand-accent/10 rounded-3xl pointer-events-none" />
            <div className="absolute inset-5 border border-brand-accent/25 rounded-3xl pointer-events-none" />

            <div className="max-w-md w-full space-y-12">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-accent">Wedding Announcement</span>
                <h1 className="font-serif text-5xl font-light text-brand-dark leading-snug tracking-wide">
                  {groomName} <br />
                  <span className="italic font-normal text-brand-accent font-serif">&amp;</span> <br />
                  {brideName}
                </h1>
              </div>

              {/* Pulsing Monogram Seal */}
              <div className="flex flex-col items-center justify-center gap-4">
                <button
                  onClick={handleOpenInvite}
                  className="h-20 w-20 rounded-full border-2 border-white/60 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition duration-300 cursor-pointer relative"
                  style={{ background: `radial-gradient(circle, ${accentColor}dd, ${accentColor})` }}
                  aria-label="Open invitation"
                >
                  <span className="absolute inset-0 rounded-full animate-ping opacity-50 pointer-events-none" style={{ border: `1px solid ${accentColor}` }} />
                  <span className="font-serif text-2xl font-bold tracking-widest">{initials}</span>
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
          <div className="absolute top-8 left-8 text-2xl text-brand-accent/20">⚜</div>
          <div className="absolute top-8 right-8 text-2xl text-brand-accent/20">⚜</div>
          <div className="absolute bottom-8 left-8 text-2xl text-brand-accent/20">⚜</div>
          <div className="absolute bottom-8 right-8 text-2xl text-brand-accent/20">⚜</div>

          <div className="text-center my-auto space-y-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">Save The Date</span>
            
            <div className="space-y-4">
              <h1 className="font-serif text-6xl font-light text-brand-dark tracking-wide">
                {groomName} <br />
                <span className="italic font-normal font-serif text-brand-accent">&amp;</span> <br />
                {brideName}
              </h1>
              <p className="text-sm text-brand-text-muted italic max-w-xs mx-auto">
                Together with their families, invite you to celebrate their wedding.
              </p>
            </div>

            {/* Interactive Scratch-to-reveal Date */}
            <div className="max-w-xs mx-auto pt-6">
              <ScratchCard date={displayDate} primaryColor={accentColor} />
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
                <span className="font-serif text-2xl font-semibold" style={{ color: accentColor }}>{val}</span>
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
                time: displayTime,
                venue: venue,
                dress: "Traditional Indian / Ethic Wear",
              },
              {
                title: "Reception Dinner",
                time: "08:30 PM onwards",
                venue: venue,
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
              {venueAddress}
            </p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`}
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

          {rsvpSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 bg-brand-bg border border-brand-border rounded-2xl max-w-sm mx-auto space-y-3"
            >
              <div className="h-10 w-10 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
              <h3 className="font-serif text-xl font-medium text-brand-dark">Thank You!</h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">Your RSVP response has been successfully sent to the couple.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-sm mx-auto">
              
              {rsvpError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-3 rounded-xl">
                  {rsvpError}
                </div>
              )}

              <div className="space-y-1">
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={rsvpData.guest_name}
                  onChange={(e) => setRsvpData({ ...rsvpData, guest_name: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={rsvpData.email}
                  onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                />
                <input
                  type="tel"
                  placeholder="Phone (Optional)"
                  value={rsvpData.phone}
                  onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  required
                  value={rsvpData.status}
                  onChange={(e) => setRsvpData({ ...rsvpData, status: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                >
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                </select>

                <select
                  required
                  value={rsvpData.guest_count}
                  onChange={(e) => setRsvpData({ ...rsvpData, guest_count: parseInt(e.target.value) || 1 })}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? "Guest" : "Guests"}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <textarea
                  placeholder="Short blessing or message for the couple…"
                  value={rsvpData.message}
                  onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                  rows="3"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                />
              </div>

              <button
                type="submit"
                disabled={rsvpLoading}
                className="w-full bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {rsvpLoading ? "Sending RSVP…" : "Send RSVP"}
              </button>
            </form>
          )}
        </section>
      </div>

      <footer className="text-center text-[10px] text-brand-text-muted/60 py-8 border-t border-brand-border/20 max-w-xl mx-auto w-full">
        Made with Cardessa Premium Digital Invitations
      </footer>
    </div>
  );
}
