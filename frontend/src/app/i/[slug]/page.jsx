"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TemplateRenderer from "@/components/TemplateRenderer";

export default function GuestInvitationPage() {
  const { slug } = useParams();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleRsvpSubmit = async (rsvpData) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/rsvp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rsvpData),
    });
    if (!res.ok) {
      const data = await res.json();
      const msg = Object.values(data).flat().join(" ") || "Failed to submit RSVP.";
      throw new Error(msg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F4F0] flex flex-col items-center justify-center font-sans text-zinc-400">
        <div className="animate-spin h-7 w-7 border-4 border-[#6B8E70] border-t-transparent rounded-full mb-3" />
        <p className="text-xs uppercase tracking-widest font-bold">Loading Invitation…</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-[#F6F4F0] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-zinc-200 max-w-sm p-8 rounded-3xl shadow-sm">
          <p className="text-sm font-semibold text-zinc-900 mb-4">{error || "Invitation Unavailable"}</p>
          <a href="/" className="text-xs text-[#6B8E70] hover:underline uppercase tracking-wider font-bold">
            Back to Cardessa
          </a>
        </div>
      </div>
    );
  }

  // Resolve content: prefer new `content` field, fall back to legacy `config`
  const content = (invite.content && Object.keys(invite.content).length > 0)
    ? invite.content
    : invite.config || {};

  const componentKey = invite.component_key || "ivory-bloom";

  return (
    <TemplateRenderer
      componentKey={componentKey}
      content={content}
      mode="live"
      onRsvpSubmit={handleRsvpSubmit}
      hideBranding={invite.hide_branding}
    />
  );
}
