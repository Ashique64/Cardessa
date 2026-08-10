"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import FieldRenderer from "@/components/FieldRenderer";
import TemplateRenderer from "@/components/TemplateRenderer";

// ─── Autosave debounce hook ──────────────────────────────────────────────────
function useAutosave(value, saveFn, delay = 1000) {
  const timer = useRef(null);
  const [saveStatus, setSaveStatus] = useState("idle");

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveFn(value);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, delay);
    return () => clearTimeout(timer.current);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return saveStatus;
}

// ─── Save status indicator ───────────────────────────────────────────────────
function SaveBadge({ status }) {
  if (status === "idle") return null;
  const map = {
    saving: { text: "Saving…",   color: "text-zinc-400" },
    saved:  { text: "✓ Saved",   color: "text-[#6B8E70]" },
    error:  { text: "⚠ Error",   color: "text-red-400" },
  };
  const { text, color } = map[status] || {};
  return <span className={`text-xs font-semibold ${color} transition-all`}>{text}</span>;
}

// ─── Main Editor Page ────────────────────────────────────────────────────────
export default function EditorPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isPaid, setIsPaid] = useState(false);

  // Template & invitation meta
  const [template, setTemplate] = useState(null);
  const [fieldSchema, setFieldSchema] = useState({ fields: [] });
  const [dbTemplateId, setDbTemplateId] = useState("");
  const [allTemplates, setAllTemplates] = useState([]);

  // Schema-driven content state
  const [content, setContent] = useState({});

  // Non-content invitation settings
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Entitlements
  const [features, setFeatures] = useState({
    white_label: false,
    custom_domain: false,
    ai_assistant: false,
    multi_client: false,
    max_invitations: 1
  });

  // AI Copilot state
  const [showAiCopilot, setShowAiCopilot] = useState(false);
  const [aiTone, setAiTone] = useState("romantic");
  const [aiDetails, setAiDetails] = useState("");
  const [aiGroom, setAiGroom] = useState("");
  const [aiBride, setAiBride] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiVariations, setAiVariations] = useState([]);
  const [aiSelectedField, setAiSelectedField] = useState("");

  // Welcome note presets
  const presets = {
    wedding: [
      "We request the honor of your presence as we celebrate our love.",
      "Together with our families, we invite you to share in our joy.",
      "Join us as we take our vows and start our new journey forever."
    ],
    engagement: [
      "With love and joy, we invite you to celebrate our engagement.",
      "Please join us as we make our promises to each other.",
      "We request the pleasure of your company on our special day."
    ],
    nikah: [
      "By the grace of the Almighty, we invite you to bless our Nikah ceremony.",
      "Please join us in prayer and celebration as we exchange our vows.",
      "We invite you to share in our joy as we bind our souls in marriage."
    ],
    default: [
      "Please join us for our special celebration.",
      "We request the pleasure of your company.",
      "Celebrate this special day with us."
    ]
  };

  const currentPresets = presets[content.ceremony_type?.toLowerCase()] || presets.default;

  // ─── Access check & data loading ──────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    const load = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch plan features
        const featRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/features/`, { headers });
        if (featRes.ok) {
          const feats = await featRes.json();
          setFeatures(feats);
        }

        // Load all templates
        const tplsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/`, { headers });
        let currentTemplates = [];
        if (tplsRes.ok) {
          const tpls = await tplsRes.json();
          currentTemplates = Array.isArray(tpls) ? tpls : tpls.results ?? [];
          setAllTemplates(currentTemplates);
        }

        // 1. Try to fetch template details matching the URL slug first
        const tplCheckRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/${slug}/`, { headers });
        if (tplCheckRes.ok) {
          const tpl = await tplCheckRes.json();
          const userInvRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/`, { headers });
          if (userInvRes.ok) {
            const userInvs = await userInvRes.json();
            const list = Array.isArray(userInvs) ? userInvs : userInvs.results ?? [];
            const existing = list.find(inv => inv.template === tpl.id);
            if (existing) {
              router.push(`/editor/${existing.slug}`);
              return;
            }
          }
          // Create new invitation dynamically
          const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              template: tpl.id,
              content: tpl.demo_content || {},
              event_date: tpl.demo_content?.event_date || null
            })
          });
          if (createRes.ok) {
            const newInvite = await createRes.json();
            router.push(`/editor/${newInvite.slug}`);
            return;
          } else {
            router.push("/dashboard");
            return;
          }
        }

        // 2. Load invitation details directly
        const invRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/`, { headers });
        if (!invRes.ok) { router.push("/dashboard"); return; }
        const invite = await invRes.json();

        setDbTemplateId(invite.template || "");
        setSubdomain(invite.custom_subdomain || "");
        setCustomDomain(invite.custom_domain || "");
        setIsPublished(!!invite.is_published);
        setIsPaid(!!invite.is_paid);

        // Resolve content
        const savedContent =
          invite.content && Object.keys(invite.content).length > 0
            ? invite.content
            : invite.config || {};
        setContent(savedContent);

        // Prefill AI helper inputs if details exist
        setAiGroom(savedContent.groom_name || "");
        setAiBride(savedContent.bride_name || "");

        // Load active template's field_schema and details
        const matched = currentTemplates.find(t => t.id === invite.template);
        if (matched) {
          const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/${matched.slug}/`, { headers });
          if (detailRes.ok) {
            const tpl = await detailRes.json();
            setTemplate(tpl);
            setFieldSchema(tpl.field_schema || { fields: [] });
            const textFields = (tpl.field_schema?.fields || []).filter(f => f.type === "text" || f.type === "textarea");
            if (textFields.length > 0) {
              setAiSelectedField(textFields[0].key);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAccess(false);
      }
    };
    load();
  }, [user, authLoading, slug, router]);

  // ─── Autosave ─────────────────────────────────────────────────────────────
  const patchContent = useCallback(
    async (latestContent) => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: latestContent,
          template: dbTemplateId || undefined,
          custom_subdomain: subdomain || null,
          custom_domain: customDomain || null,
          is_published: isPublished,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Object.values(err).flat().join(" "));
      }
    },
    [slug, dbTemplateId, subdomain, customDomain, isPublished]
  );

  const saveStatus = useAutosave(content, patchContent, 1000);

  // ─── Presigned upload ──────────────────────────────────────────────────────
  const handlePresignUpload = async (file, fieldKey, type) => {
    const token = localStorage.getItem("access_token");
    const presignRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/presign/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type,
        field_type: type,
      }),
    });
    if (!presignRes.ok) throw new Error("Failed to get upload URL");
    const { upload_url, public_url } = await presignRes.json();

    await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return public_url;
  };

  const handlePhotoUpload = async (file, fieldKey) => {
    try {
      const url = await handlePresignUpload(file, fieldKey, "image");
      setContent(prev => ({ ...prev, [fieldKey]: url }));
    } catch {
      alert("Failed to upload image.");
    }
  };

  const handleAlbumPhotoUpload = async (file, index) => {
    try {
      const url = await handlePresignUpload(file, `album_${index}`, "image");
      setContent(prev => {
        const album = [...(prev.photo_album || [])];
        album[index] = url;
        return { ...prev, photo_album: album };
      });
    } catch {
      alert("Failed to upload album image.");
    }
  };

  // ─── AI Writer Copilot ─────────────────────────────────────────────────────
  const handleGenerateAiCopy = async () => {
    setAiLoading(true);
    setAiVariations([]);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/ai-write/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tone: aiTone,
          groom_name: aiGroom,
          bride_name: aiBride,
          details: aiDetails
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiVariations(data.variations || []);
      } else {
        alert("Failed to generate variations. Upgrade your plan features.");
      }
    } catch {
      alert("Error generating copy.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyVariation = (text) => {
    if (!aiSelectedField) return;
    setContent(prev => ({
      ...prev,
      [aiSelectedField]: text
    }));
    setShowAiCopilot(false);
  };

  // ─── Publish & Payment ─────────────────────────────────────────────────────
  const [publishing, setPublishing] = useState(false);
  const handlePayAndPublish = async () => {
    setPublishing(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invitation_id: slug,
        }),
      });
      if (res.ok) {
        const orderData = await res.json();
        if (orderData.free) {
          setIsPaid(true);
          setIsPublished(true);
          alert("✓ Free template activated and published!");
          return;
        }

        // Trigger simulated verification
        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/verify/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            razorpay_order_id: orderData.razorpay_order_id,
            razorpay_payment_id: "pay_simulated_" + Math.random().toString(36).substring(7),
            razorpay_signature: "simulated_signature",
          }),
        });
        if (verifyRes.ok) {
          setIsPaid(true);
          setIsPublished(true);
          alert("✓ Payment simulated successfully! Your invitation is now published.");
        } else {
          alert("Failed to verify payment.");
        }
      } else {
        alert("Failed to initialize payment order.");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout failed.");
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading || checkingAccess) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-3">
        <div className="h-7 w-7 border-4 border-[#6B8E70] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-zinc-500 font-medium tracking-wide">Loading editor workspace…</span>
      </div>
    );
  }

  const componentKey = template?.component_key || "ivory-bloom";
  const schemaFields = fieldSchema?.fields || [];
  const editableTextFields = schemaFields.filter(f => f.type === "text" || f.type === "textarea");

  // Build unique shareable link
  const shareableLink = typeof window !== "undefined" ? `${window.location.origin}/i/${slug}` : `/i/${slug}`;

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans select-none relative">

      {/* ── Header ── */}
      <header className="bg-white border-b border-zinc-200 py-3.5 px-6 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-550 hover:text-zinc-950 transition">
            ← Dashboard
          </Link>
          <span className="h-4 w-px bg-zinc-200" />
          <span className="text-zinc-700 text-sm font-medium truncate max-w-50">
            {template?.name || "Editor"}
          </span>
          <span className="h-4 w-px bg-zinc-200" />
          <span className="text-xs font-bold bg-[#6B8E70]/10 text-[#6B8E70] border border-[#6B8E70]/20 rounded-full px-3 py-1">
            Step {step} of 4
          </span>
          <SaveBadge status={saveStatus} />
        </div>

        <div className="flex items-center gap-3">
          {features.ai_assistant && (
            <button
              onClick={() => setShowAiCopilot(true)}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-purple-200 transition cursor-pointer"
            >
              <span>✨</span> AI Writer Copilot
            </button>
          )}

          {isPaid && (
            <a
              href={`/i/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#6B8E70] font-semibold hover:underline"
            >
              View Live ↗
            </a>
          )}
        </div>
      </header>

      {/* ── Editor Container ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Settings Panel */}
        <aside className="w-full md:w-[420px] bg-white border-r border-zinc-200 flex flex-col shrink-0 overflow-hidden">
          {/* Wizard Step Navigation */}
          <div className="flex border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider shrink-0 bg-zinc-50/50">
            {[
              { id: 1, label: "Customize" },
              { id: 2, label: "Media" },
              { id: 3, label: "Preview" },
              { id: 4, label: "Publish" }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  step === s.id
                    ? "border-zinc-900 text-zinc-950 bg-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STEP 1: CUSTOMIZE DETAILS */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-serif text-lg text-zinc-900 border-b pb-2">1. Ceremony Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Bride Name</label>
                    <input
                      type="text"
                      value={content.bride_name || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, bride_name: e.target.value }))}
                      placeholder="Bride's Name"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Groom Name</label>
                    <input
                      type="text"
                      value={content.groom_name || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, groom_name: e.target.value }))}
                      placeholder="Groom's Name"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Display Order</label>
                  <select
                    value={content.name_display_order || "bride_first"}
                    onChange={(e) => setContent(prev => ({ ...prev, name_display_order: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                  >
                    <option value="bride_first">Bride Name First</option>
                    <option value="groom_first">Groom Name First</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Ceremony Type</label>
                  <select
                    value={content.ceremony_type || "Wedding"}
                    onChange={(e) => setContent(prev => ({ ...prev, ceremony_type: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Nikah">Nikah</option>
                    <option value="Sangeet">Sangeet</option>
                    <option value="Other">Other Event</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Bride Parents (Opt)</label>
                    <input
                      type="text"
                      value={content.bride_parents || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, bride_parents: e.target.value }))}
                      placeholder="Mr. & Mrs. Parent"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Groom Parents (Opt)</label>
                    <input
                      type="text"
                      value={content.groom_parents || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, groom_parents: e.target.value }))}
                      placeholder="Mr. & Mrs. Parent"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-lg text-zinc-900 border-b pb-2 pt-4">2. Date, Time & Venue</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Event Date</label>
                    <input
                      type="date"
                      value={content.event_date || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, event_date: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Event Time</label>
                    <input
                      type="time"
                      value={content.event_time || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, event_time: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">End Time (Optional)</label>
                  <input
                    type="time"
                    value={content.end_date_time || ""}
                    onChange={(e) => setContent(prev => ({ ...prev, end_date_time: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Venue Name</label>
                  <input
                    type="text"
                    value={content.venue_name || ""}
                    onChange={(e) => setContent(prev => ({ ...prev, venue_name: e.target.value }))}
                    placeholder="Venue Hall Name"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Venue Address</label>
                  <textarea
                    value={content.venue_address || ""}
                    onChange={(e) => setContent(prev => ({ ...prev, venue_address: e.target.value }))}
                    placeholder="Street, City, State"
                    rows="2"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none resize-none focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Google Map Link (Optional)</label>
                  <input
                    type="text"
                    value={content.google_map_link || ""}
                    onChange={(e) => setContent(prev => ({ ...prev, google_map_link: e.target.value }))}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <h3 className="font-serif text-lg text-zinc-900 border-b pb-2 pt-4">3. Welcome Note & Attribution</h3>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Welcome Note Presets</label>
                  <div className="space-y-2">
                    {currentPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setContent(prev => ({ ...prev, welcome_note: preset }))}
                        className={`w-full text-left p-3 border rounded-xl text-xs transition-colors ${
                          content.welcome_note === preset
                            ? "bg-[#6B8E70]/10 border-[#6B8E70] text-zinc-900"
                            : "bg-zinc-55/30 border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Custom Welcome Note</label>
                  <textarea
                    value={content.welcome_note || ""}
                    onChange={(e) => setContent(prev => ({ ...prev, welcome_note: e.target.value }))}
                    placeholder="Or type your own greeting note here..."
                    rows="3"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none resize-none focus:border-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Attribution Heading</label>
                    <input
                      type="text"
                      value={content.attribution_heading || "Best wishes"}
                      onChange={(e) => setContent(prev => ({ ...prev, attribution_heading: e.target.value }))}
                      placeholder="e.g. Best wishes"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Attribution Names</label>
                    <input
                      type="text"
                      value={content.attribution_names || "Family & Friends"}
                      onChange={(e) => setContent(prev => ({ ...prev, attribution_names: e.target.value }))}
                      placeholder="e.g. Family & Friends"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider mt-6 cursor-pointer"
                >
                  Save and Continue →
                </button>
              </div>
            )}

            {/* STEP 2: MEDIA & ADD-ONS */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-serif text-lg text-zinc-900 border-b pb-2">Media & Add-ons</h3>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Our Story (Optional)</label>
                  <textarea
                    value={content.our_story || ""}
                    onChange={(e) => setContent(prev => ({ ...prev, our_story: e.target.value }))}
                    placeholder="Write a brief, romantic timeline or description of your love story..."
                    rows="4"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none resize-none focus:border-zinc-900"
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Main Cover Photo</label>
                  {content.couple_photo && (
                    <div className="h-44 w-full border border-zinc-200 rounded-xl overflow-hidden relative group">
                      <img src={content.couple_photo} alt="Couple portrait" className="h-full w-full object-cover" />
                      <button
                        onClick={() => setContent(prev => ({ ...prev, couple_photo: null }))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition duration-200 cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                  {!content.couple_photo && (
                    <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center hover:border-zinc-400 transition-colors duration-200 relative bg-zinc-50/50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0], "couple_photo");
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-lg">📷</p>
                      <p className="text-xs font-bold text-zinc-650 mt-2">Upload Portrait Cover Photo</p>
                      <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG up to 10MB (Aspect ratio 4:5)</p>
                    </div>
                  )}
                </div>

                {/* Photo Album Toggle */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">Enable Photo Album</h4>
                      <p className="text-xs text-zinc-400">Add an interactive photo slideshow.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setContent(prev => ({ ...prev, photo_album_enabled: !prev.photo_album_enabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        content.photo_album_enabled ? "bg-[#6B8E70]" : "bg-zinc-250"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          content.photo_album_enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {content.photo_album_enabled && (
                    <div className="space-y-3 pt-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Album Photos (Upload 4 to 8 photos)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 8 }).map((_, idx) => {
                          const imgUrl = content.photo_album?.[idx];
                          return (
                            <div key={idx} className="h-16 border border-zinc-200 rounded-lg overflow-hidden relative group bg-zinc-50">
                              {imgUrl ? (
                                <>
                                  <img src={imgUrl} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setContent(prev => {
                                      const album = [...(prev.photo_album || [])];
                                      album[idx] = null;
                                      return { ...prev, photo_album: album };
                                    })}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-bold cursor-pointer"
                                  >
                                    Del
                                  </button>
                                </>
                              ) : (
                                <div className="h-full flex items-center justify-center text-zinc-350 cursor-pointer relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) handleAlbumPhotoUpload(e.target.files[0], idx);
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                  <span className="text-base">+</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* RSVP Toggle */}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Enable RSVP Form</h4>
                    <p className="text-xs text-zinc-400">Allow guests to response attendance count.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContent(prev => ({ ...prev, rsvp_enabled: !prev.rsvp_enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      content.rsvp_enabled ? "bg-[#6B8E70]" : "bg-zinc-250"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        content.rsvp_enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Save & Preview →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PREVIEW DETAILS */}
            {step === 3 && (
              <div className="space-y-6 text-center py-8">
                <div className="h-16 w-16 bg-[#6B8E70]/10 border border-[#6B8E70]/20 rounded-full flex items-center justify-center text-[#6B8E70] text-3xl mx-auto">
                  📱
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-zinc-900">Check Your Invite</h3>
                  <p className="text-xs text-zinc-450 leading-relaxed px-4">
                    Review your invitation in the phone simulator frame on the right. You can interact with the countdown, click links, and see layouts.
                  </p>
                </div>

                <div className="space-y-3 pt-6 px-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="w-full bg-[#6B8E70] hover:bg-[#5f7d67] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                  >
                    Publish Invitation
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PAY & PUBLISH */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg text-zinc-900 border-b pb-2">4. Publish & Share</h3>

                <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-widest border-b pb-2">Order Summary</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Invitation Design:</span>
                    <strong className="text-zinc-900">{template?.name || "Premium Template"}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Price:</span>
                    <strong className="text-zinc-900">{template?.price_inr === 0 ? "Free" : `₹${template?.price_inr}`}</strong>
                  </div>
                  <div className="h-px bg-zinc-200/50" />
                  <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                    ⚠ Note: Your invitation website will be automatically deleted 10 days after the event date ({content.event_date || "the event date"}).
                  </p>
                </div>

                {!isPaid ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handlePayAndPublish}
                      disabled={publishing}
                      className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {publishing ? "Processing Order..." : template?.price_inr === 0 ? "Activate Free Invite" : "Pay & Publish"}
                    </button>
                    <p className="text-[10px] text-zinc-400 text-center">
                      * After successful payment, a unique shareable link will be generated.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5 pt-2">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center text-emerald-800 space-y-2">
                      <span className="text-2xl">✓</span>
                      <h4 className="font-serif text-base font-semibold">Your Invitation is Live!</h4>
                      <p className="text-[10px] text-emerald-600">Your unique shareable link has been generated below.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Shareable Link</label>
                      <div className="flex">
                        <input
                          type="text"
                          readOnly
                          value={shareableLink}
                          className="flex-1 bg-zinc-50 border border-zinc-200 border-r-0 rounded-l-xl px-4 py-3 text-xs text-zinc-650 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareableLink);
                            alert("Copied to clipboard!");
                          }}
                          className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-4 rounded-r-xl cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Phone frame preview */}
        <main className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-zinc-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-80 h-162.5 rounded-[44px] shadow-2xl border-10 border-zinc-900 bg-white overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-2xl z-20" />
              <div className="h-full w-full overflow-y-auto">
                <TemplateRenderer
                  componentKey={componentKey}
                  content={content}
                  mode="editor"
                  hideBranding={content.hide_branding && features.white_label}
                />
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase">Live Preview Frame</p>
          </div>
        </main>
      </div>

      {/* ── AI Copilot Assistant Drawer Modal ── */}
      <AnimatePresence>
        {showAiCopilot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="font-serif text-lg font-semibold text-zinc-900">AI Copywriter Assistant</h3>
                </div>
                <button
                  onClick={() => setShowAiCopilot(false)}
                  className="text-zinc-400 hover:text-zinc-600 font-bold text-sm cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-650 uppercase">Groom Name</label>
                    <input
                      type="text" value={aiGroom}
                      onChange={(e) => setAiGroom(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-650 uppercase">Bride Name</label>
                    <input
                      type="text" value={aiBride}
                      onChange={(e) => setAiBride(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-650 uppercase">Select Target Field to Fill</label>
                  <select
                    value={aiSelectedField}
                    onChange={(e) => setAiSelectedField(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none"
                  >
                    {editableTextFields.map(f => (
                      <option key={f.key} value={f.key}>{f.label} ({f.key})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-650 uppercase">Copywriting Tone</label>
                  <div className="flex gap-2">
                    {["romantic", "formal", "religious", "modern"].map((tone) => (
                      <button
                        key={tone} type="button"
                        onClick={() => setAiTone(tone)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                          aiTone === tone
                            ? "bg-purple-100 border border-purple-300 text-purple-700"
                            : "bg-zinc-55/35 border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-650 uppercase">Theme, details, or message settings</label>
                  <textarea
                    placeholder="e.g. Garden wedding, traditional ceremony at sunset"
                    value={aiDetails}
                    onChange={(e) => setAiDetails(e.target.value)}
                    rows="2"
                    className="w-full bg-zinc-55/35 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="button" disabled={aiLoading}
                  onClick={handleGenerateAiCopy}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {aiLoading ? "Generating Variants…" : "Generate Greeting Copy"}
                </button>
              </div>

              {/* Variations list */}
              {aiVariations.length > 0 && (
                <div className="border-t border-zinc-100 pt-4 space-y-3 overflow-y-auto max-h-48">
                  <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">Generated Variations (Click to Apply)</p>
                  <div className="space-y-2">
                    {aiVariations.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => handleApplyVariation(v)}
                        className="p-3 bg-purple-50/40 hover:bg-purple-50 border border-purple-100 rounded-xl text-xs text-zinc-700 cursor-pointer transition leading-relaxed hover:border-purple-300"
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
