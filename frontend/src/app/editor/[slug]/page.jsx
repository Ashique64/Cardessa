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
  const [checkingAccess, setCheckingAccess] = useState(true);

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

  // UI tabs
  const [activeTab, setActiveTab] = useState("content");

  // AI Copilot state
  const [showAiCopilot, setShowAiCopilot] = useState(false);
  const [aiTone, setAiTone] = useState("romantic");
  const [aiDetails, setAiDetails] = useState("");
  const [aiGroom, setAiGroom] = useState("");
  const [aiBride, setAiBride] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiVariations, setAiVariations] = useState([]);
  const [aiSelectedField, setAiSelectedField] = useState("");

  // ─── Access check & data loading ──────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    const load = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { Authorization: `Bearer ${token}` };

        // Verify plan (admins bypass)
        if (!user.is_superuser && !user.is_staff) {
          const planRes = await ordersApi.checkPlan();
          if (!planRes.data.has_plan) { router.push("/pricing"); return; }
        }

        // Fetch plan features
        const featRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/features/`, { headers });
        if (featRes.ok) {
          const feats = await featRes.json();
          setFeatures(feats);
        }

        // Load all templates
        const tplsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/`, { headers });
        if (tplsRes.ok) {
          const tpls = await tplsRes.json();
          const list = Array.isArray(tpls) ? tpls : tpls.results ?? [];
          setAllTemplates(list);
        }

        // Load invitation
        const invRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/`, { headers });
        if (!invRes.ok) { router.push("/dashboard"); return; }
        const invite = await invRes.json();

        setDbTemplateId(invite.template || "");
        setSubdomain(invite.custom_subdomain || "");
        setCustomDomain(invite.custom_domain || "");
        setIsPublished(!!invite.is_published);

        // Resolve content
        const savedContent =
          invite.content && Object.keys(invite.content).length > 0
            ? invite.content
            : invite.config || {};
        setContent(savedContent);

        // Prefill AI helper inputs if details exist
        setAiGroom(savedContent.groom_name || "");
        setAiBride(savedContent.bride_name || "");

        // Load the template
        if (invite.template) {
          const tplRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/templates/${slug}/`,
            { headers }
          );
          if (tplRes.ok) {
            const tpl = await tplRes.json();
            setTemplate(tpl);
            setFieldSchema(tpl.field_schema || { fields: [] });
            // Auto-select first text field for AI helper destination
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

  // ─── Publish ───────────────────────────────────────────────────────────────
  const [publishing, setPublishing] = useState(false);
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          template: dbTemplateId || undefined,
          custom_subdomain: subdomain || null,
          custom_domain: customDomain || null,
          is_published: true,
        }),
      });
      if (res.ok) {
        setIsPublished(true);
        alert("✓ Invitation published live!");
      }
    } catch {
      alert("Error publishing invitation.");
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

          {isPublished && (
            <a
              href={`/i/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#6B8E70] font-semibold hover:underline"
            >
              View Live ↗
            </a>
          )}

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {publishing ? "Publishing…" : isPublished ? "Update Live Page" : "Publish"}
          </button>
        </div>
      </header>

      {/* ── Editor Container ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Settings Panel */}
        <aside className="w-full md:w-96 bg-white border-r border-zinc-200 flex flex-col shrink-0 overflow-hidden">
          <nav className="flex border-b border-zinc-100 text-sm shrink-0">
            {["content", "design"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center font-semibold border-b-2 capitalize transition-colors ${
                  activeTab === tab
                    ? "border-zinc-900 text-zinc-950"
                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Content inputs list */}
            {activeTab === "content" && (
              <div className="space-y-6">
                {schemaFields.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-10">No customizable fields defined.</p>
                ) : (
                  schemaFields.map((field) => (
                    <FieldRenderer
                      key={field.key}
                      field={field}
                      value={content[field.key]}
                      onChange={(val) => setContent((prev) => ({ ...prev, [field.key]: val }))}
                      onPresignUpload={handlePresignUpload}
                    />
                  ))
                )}

                {/* Subdomain translation inputs always rendered */}
                <div className="border-t border-zinc-150 pt-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#6B8E70]">
                    Hindi/Tamil Translations
                  </h4>
                  {[
                    { code: "hi", label: "Hindi (HI)", groomPh: "वर का नाम", bridePh: "वधू का नाम" },
                    { code: "ta", label: "Tamil (TA)",  groomPh: "மணமகன் பெயர்", bridePh: "மணமகள் பெயர்" },
                  ].map(({ code, label, groomPh, bridePh }) => (
                    <div key={code} className="bg-zinc-50 p-4 border border-zinc-150 rounded-xl space-y-3">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text" placeholder={groomPh}
                          value={content[`${code}_groom_name`] ?? ""}
                          onChange={(e) => setContent(prev => ({ ...prev, [`${code}_groom_name`]: e.target.value }))}
                          className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                        <input
                          type="text" placeholder={bridePh}
                          value={content[`${code}_bride_name`] ?? ""}
                          onChange={(e) => setContent(prev => ({ ...prev, [`${code}_bride_name`]: e.target.value }))}
                          className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Design & Agency customization */}
            {activeTab === "design" && (
              <div className="space-y-6">
                {/* Template swap */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">Active Design Template</label>
                  <select
                    value={dbTemplateId}
                    onChange={(e) => setDbTemplateId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#6B8E70]"
                  >
                    <option value="">Select design theme</option>
                    {allTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.tier})</option>
                    ))}
                  </select>
                </div>

                {/* Subdomain settings */}
                <div className="space-y-2 border-t border-zinc-100 pt-5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">Subdomain configuration</label>
                  <div className="flex items-center">
                    <input
                      type="text" placeholder="couple-url"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="flex-1 border border-r-0 border-zinc-200 rounded-l-xl py-3 px-4 text-sm bg-zinc-50 focus:outline-none"
                    />
                    <span className="bg-zinc-100 border border-zinc-200 rounded-r-xl py-3 px-3 text-xs font-semibold text-zinc-500">.cardessa.in</span>
                  </div>
                </div>

                {/* Custom domain configuration (Phase 3 gated) */}
                <div className="space-y-2 border-t border-zinc-100 pt-5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">Custom Domain mapping</label>
                  <input
                    type="text"
                    disabled={!features.custom_domain}
                    placeholder={features.custom_domain ? "e.g. invite.ourwedding.com" : "🔒 Premium custom domain"}
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ""))}
                    className="w-full border border-zinc-200 rounded-xl py-3 px-4 text-sm bg-zinc-50 focus:outline-none disabled:bg-zinc-100/60 disabled:text-zinc-400"
                  />
                  {!features.custom_domain && (
                    <p className="text-[10px] text-zinc-400 leading-relaxed italic">Upgrade subscription to connect custom domains.</p>
                  )}
                </div>

                {/* White label Toggle (Phase 3 gated) */}
                <div className="flex items-center justify-between border-t border-zinc-100 pt-5">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Remove branding</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Hide the "Made with Cardessa" badge.</p>
                  </div>
                  <button
                    type="button"
                    disabled={!features.white_label}
                    onClick={() => setContent(prev => ({ ...prev, hide_branding: !prev.hide_branding }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      content.hide_branding && features.white_label ? "bg-[#6B8E70]" : "bg-zinc-200"
                    } disabled:opacity-40`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        content.hide_branding && features.white_label ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {!features.white_label && (
                  <p className="text-[10px] text-zinc-400 leading-relaxed italic mt-1">Upgrade subscription to activate white-label mode.</p>
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
                            : "bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
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
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
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
