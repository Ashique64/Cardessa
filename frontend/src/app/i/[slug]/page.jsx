"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function GuestInvitationPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated guest-facing client fetch
    setTimeout(() => {
      setData({
        groom: "Rahul",
        bride: "Priya",
        date: "November 15, 2026",
        time: "06:00 PM",
        venueName: "Grand Palace resort",
        venueAddress: "Bypass road, Mumbai, Maharashtra",
        bgColor: "#FAF9F6",
        primaryColor: "#B59410",
        musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      });
      setLoading(false);
    }, 800);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans text-zinc-400">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm tracking-wider uppercase">Loading Invitation...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans flex flex-col justify-between items-center py-20 px-6"
      style={{ backgroundColor: data.bgColor }}
    >
      <div className="text-center max-w-lg mx-auto">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold block mb-6">You Are Invited</span>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: data.primaryColor }}>
          {data.groom} & {data.bride}
        </h1>

        <p className="text-zinc-500 text-sm italic mt-4">celebrate our union with us</p>

        <div className="my-12 py-6 border-t border-b border-zinc-200">
          <div className="text-lg font-bold text-zinc-800 tracking-wide">{data.date}</div>
          <div className="text-sm text-zinc-500 mt-1">{data.time}</div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-400">Venue</h3>
          <p className="font-bold text-zinc-850 text-base">{data.venueName}</p>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">{data.venueAddress}</p>
        </div>
      </div>

      <footer className="text-center text-xs text-zinc-400 mt-12 tracking-wide uppercase border-t border-zinc-200/50 pt-6 w-full max-w-sm">
        Made with Cardessa
      </footer>
    </div>
  );
}
