"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEditorStore } from "@/store/editorStore";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import FieldRenderer from "@/components/FieldRenderer";
import TemplateRenderer from "@/components/TemplateRenderer";
import CustomSelect from "@/components/CustomSelect";
import apiClient, { ordersApi } from "@/lib/api";

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

  // Zustand Auth Store
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);

  // Zustand Editor Store
  const {
    step, setStep,
    maxAllowedStep, setMaxAllowedStep,
    showPhonePreview, setShowPhonePreview,
    showAiCopilot, setShowAiCopilot,
    aiTone, setAiTone,
    aiDetails, setAiDetails,
    aiGroom, setAiGroom,
    aiBride, setAiBride,
    aiLoading, setAiLoading,
    aiVariations, setAiVariations,
    aiSelectedField, setAiSelectedField,
    resetEditor
  } = useEditorStore();

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

  const isStep1Complete = useCallback(() => {
    return !!(
      content.bride_name?.trim() &&
      content.groom_name?.trim() &&
      content.event_date &&
      content.venue_name?.trim() &&
      content.venue_address?.trim()
    );
  }, [content]);

  const isStep2Complete = useCallback(() => {
    return !!content.couple_photo;
  }, [content]);

  const toggleField = useCallback((key, enabledKey, relatedKeys = []) => {
    setContent(prev => {
      const nextContent = { ...prev, [enabledKey]: !prev[enabledKey] };
      if (!nextContent[enabledKey]) {
        relatedKeys.forEach(k => {
          nextContent[k] = "";
        });
      }
      return nextContent;
    });
  }, []);

  const handleNavigateStep = useCallback((targetStep) => {
    if (targetStep === 1) {
      setStep(1);
    } else if (targetStep === 2) {
      if (isStep1Complete()) {
        setMaxAllowedStep(Math.max(maxAllowedStep, 2));
        setStep(2);
      } else {
        alert("Please fill in all compulsory fields marked with * first.");
      }
    } else if (targetStep === 3) {
      if (isStep1Complete() && isStep2Complete()) {
        setMaxAllowedStep(Math.max(maxAllowedStep, 3));
        setStep(3);
      } else {
        alert("Please upload the compulsory Main Cover Photo first.");
      }
    } else if (targetStep === 4) {
      if (isStep1Complete() && isStep2Complete() && maxAllowedStep >= 3) {
        setMaxAllowedStep(Math.max(maxAllowedStep, 4));
        setStep(4);
      } else {
        alert("Please complete the previous steps first.");
      }
    }
  }, [isStep1Complete, isStep2Complete, maxAllowedStep, setStep, setMaxAllowedStep]);

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

  // Reset editor state on mount/unmount
  useEffect(() => {
    resetEditor();
    return () => resetEditor();
  }, [resetEditor]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // React Query: plan features
  const { data: featuresData } = useQuery({
    queryKey: ["features"],
    queryFn: async () => {
      const res = await apiClient.get("/orders/features/");
      return res.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (featuresData) {
      setFeatures(featuresData);
    }
  }, [featuresData]);

  // React Query: templates
  const { data: templatesData } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await apiClient.get("/templates/");
      const tpls = res.data;
      return Array.isArray(tpls) ? tpls : tpls.results ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (templatesData) {
      setAllTemplates(templatesData);
    }
  }, [templatesData]);

  // React Query: invitation detail
  const { data: invitationData, isLoading: invitationLoading } = useQuery({
    queryKey: ["invitation", slug],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/invitations/${slug}/`);
        return res.data;
      } catch (err) {
        const tplCheckRes = await apiClient.get(`/templates/${slug}/`);
        const tpl = tplCheckRes.data;

        const userInvRes = await apiClient.get("/invitations/");
        const list = Array.isArray(userInvRes.data) ? userInvRes.data : userInvRes.data.results ?? [];
        const existing = list.find(inv => inv.template === tpl.id);
        if (existing) {
          return existing;
        }

        const createRes = await apiClient.post("/invitations/", {
          template: tpl.id,
          content: tpl.demo_content || {},
          event_date: tpl.demo_content?.event_date || null
        });
        return createRes.data;
      }
    },
    enabled: !!user,
    retry: false,
  });

  // Redirect if invitation slug doesn't match current url
  useEffect(() => {
    if (invitationData && invitationData.slug !== slug) {
      router.push(`/editor/${invitationData.slug}`);
    }
  }, [invitationData, slug, router]);

  const activeTemplateId = invitationData?.template;
  const { data: activeTemplateData } = useQuery({
    queryKey: ["activeTemplate", activeTemplateId],
    queryFn: async () => {
      if (!activeTemplateId || !templatesData) return null;
      const matched = templatesData.find(t => t.id === activeTemplateId);
      if (matched) {
        const detailRes = await apiClient.get(`/templates/${matched.slug}/`);
        return detailRes.data;
      }
      return null;
    },
    enabled: !!activeTemplateId && !!templatesData,
  });

  useEffect(() => {
    if (activeTemplateData) {
      setTemplate(activeTemplateData);
      setFieldSchema(activeTemplateData.field_schema || { fields: [] });
      const textFields = (activeTemplateData.field_schema?.fields || []).filter(f => f.type === "text" || f.type === "textarea");
      if (textFields.length > 0) {
        setAiSelectedField(textFields[0].key);
      }
    }
  }, [activeTemplateData, setAiSelectedField]);

  // Sync loaded invitation data
  useEffect(() => {
    if (invitationData) {
      setDbTemplateId(invitationData.template || "");
      setSubdomain(invitationData.custom_subdomain || "");
      setCustomDomain(invitationData.custom_domain || "");
      setIsPublished(!!invitationData.is_published);
      setIsPaid(!!invitationData.is_paid);

      const savedContent =
        invitationData.content && Object.keys(invitationData.content).length > 0
          ? invitationData.content
          : invitationData.config || {};

      savedContent.parents_enabled = !!(savedContent.bride_parents || savedContent.groom_parents);
      savedContent.end_time_enabled = !!savedContent.end_date_time;
      savedContent.google_map_enabled = !!savedContent.google_map_link;
      savedContent.attributions_enabled = !!(savedContent.attribution_heading || savedContent.attribution_names);
      savedContent.our_story_enabled = !!savedContent.our_story;

      setContent(savedContent);

      setAiGroom(savedContent.groom_name || "");
      setAiBride(savedContent.bride_name || "");

      if (invitationData.is_paid) {
        setMaxAllowedStep(4);
      } else {
        const step1Ok = !!(
          savedContent.bride_name?.trim() &&
          savedContent.groom_name?.trim() &&
          savedContent.event_date &&
          savedContent.venue_name?.trim() &&
          savedContent.venue_address?.trim()
        );
        if (step1Ok) {
          const step2Ok = !!savedContent.couple_photo;
          if (step2Ok) {
            setMaxAllowedStep(3);
          } else {
            setMaxAllowedStep(2);
          }
        } else {
          setMaxAllowedStep(1);
        }
      }
    }
  }, [invitationData, setMaxAllowedStep, setAiGroom, setAiBride]);

  const checkingAccess = invitationLoading;

  // ─── Autosave ─────────────────────────────────────────────────────────────
  const patchContent = useCallback(
    async (latestContent) => {
      try {
        await apiClient.patch(`/invitations/${slug}/`, {
          content: latestContent,
          template: dbTemplateId || undefined,
          custom_subdomain: subdomain || null,
          custom_domain: customDomain || null,
          is_published: isPublished,
        });
      } catch (err) {
        const message = err.response?.data
          ? Object.values(err.response.data).flat().join(" ")
          : err.message;
        throw new Error(message);
      }
    },
    [slug, dbTemplateId, subdomain, customDomain, isPublished]
  );

  const saveStatus = useAutosave(content, patchContent, 1000);

  // ─── Presigned upload ──────────────────────────────────────────────────────
  const handlePresignUpload = async (file, fieldKey, type) => {
    try {
      const presignRes = await apiClient.post("/media/presign/", {
        filename: file.name,
        content_type: file.type,
        field_type: type,
      });
      const { upload_url, public_url } = presignRes.data;

      await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return public_url;
    } catch (err) {
      throw new Error("Failed to get upload URL");
    }
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
      const res = await apiClient.post("/invitations/ai-write/", {
        tone: aiTone,
        groom_name: aiGroom,
        bride_name: aiBride,
        details: aiDetails,
        target_field: aiSelectedField
      });
      setAiVariations(res.data.variations || []);
    } catch {
      alert("Failed to generate variations. Upgrade your plan features.");
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
      const res = await apiClient.post("/orders/create/", {
        invitation_id: slug,
      });
      const orderData = res.data;
      if (orderData.free) {
        setIsPaid(true);
        setIsPublished(true);
        alert("✓ Free template activated and published!");
        return;
      }

      // Load Razorpay dynamically if not present
      if (typeof window !== "undefined" && !window.Razorpay) {
        const loaded = await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
        if (!loaded) {
          alert("Failed to load Razorpay SDK. Please check your internet connection.");
          setPublishing(false);
          return;
        }
      }

      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Cardessa",
        description: `Publish Invitation: ${template?.name || "Wedding Template"}`,
        order_id: orderData.razorpay_order_id,
        handler: async function (response) {
          try {
            await apiClient.post("/orders/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setIsPaid(true);
            setIsPublished(true);
            alert("✓ Payment successful! Your invitation has been published.");
          } catch (err) {
            console.error(err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: user?.email || "",
          name: user?.name || "",
        },
        theme: {
          color: "#6B8E70",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleRsvpSubmit = useCallback(async (rsvpData) => {
    try {
      await apiClient.post(`/invitations/${slug}/rsvp/`, rsvpData);
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(" ")
        : err.message || "Failed to submit RSVP.";
      throw new Error(msg);
    }
  }, [slug]);

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
  const editableTextFields = [
    { key: "welcome_note",        label: "Welcome Note" },
    { key: "our_story",           label: "Our Story" },
    { key: "attribution_heading", label: "Attribution Heading" },
    { key: "attribution_names",   label: "Attribution Names" },
  ];

  // Build unique shareable link
  const shareableLink = typeof window !== "undefined" ? `${window.location.origin}/i/${slug}` : `/i/${slug}`;
  const isAdmin = !!(user?.is_superuser || user?.is_staff);
  const displayPrice = isAdmin ? 0 : (template?.price_inr ?? 499);

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans select-none relative">

      {/* ── Header ── */}
      <header className="sticky top-0 bg-white border-b border-zinc-200 py-3.5 px-6 flex justify-between items-center z-30 shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition">
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
          <button
            onClick={() => setShowPhonePreview(true)}
            className="bg-[#6B8E70]/10 hover:bg-[#6B8E70]/20 text-[#6B8E70] font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#6B8E70]/20 transition cursor-pointer"
          >
            <span>📱</span> Preview Design
          </button>

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
      <div className="flex-1 flex flex-col gap-5 p-5 bg-zinc-100 max-w-7xl mx-auto w-full items-start">
        {/* Main Settings Panel (Centered layout) */}
        <aside className="w-full max-w-4xl mx-auto bg-white border border-zinc-200/80 rounded-3xl shadow-2xs flex flex-col shrink-0 overflow-hidden">
          {/* Wizard Step Timeline */}
          <div className="flex items-center justify-center py-6 px-4 bg-zinc-50/50 border-b border-zinc-100 shrink-0">
            <div className="flex items-center w-full max-w-lg justify-between relative">
              {/* Progress Line Background */}
              <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-zinc-200 -z-0" />
              
              {[
                { id: 1, label: "Customize" },
                { id: 2, label: "Media" },
                { id: 3, label: "Preview" },
                { id: 4, label: "Publish" }
              ].map((s, idx) => {
                const isActive = step === s.id;
                const isPassed = step > s.id;
                const isClickable =
                  s.id === 1 ||
                  isPaid ||
                  (s.id === 2 && isStep1Complete()) ||
                  (s.id === 3 && isStep1Complete() && isStep2Complete()) ||
                  (s.id === 4 && isStep1Complete() && isStep2Complete() && maxAllowedStep >= 3);
                
                return (
                  <div key={s.id} className="flex flex-col items-center relative z-10 flex-1">
                    <button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => handleNavigateStep(s.id)}
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#6B8E70] text-white ring-4 ring-[#6B8E70]/20 shadow-md cursor-pointer"
                          : isClickable
                          ? "bg-[#6B8E70]/80 text-white hover:bg-[#6B8E70] cursor-pointer"
                          : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      {s.id}
                    </button>
                    <span className={`text-[9px] font-bold uppercase tracking-wider mt-2 transition-colors ${
                      isActive ? "text-[#6B8E70]" : "text-zinc-400"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* STEP 1: CUSTOMIZE DETAILS */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg text-zinc-900 border-b pb-2">1. Customize & Styles</h3>

                {/* Color Theme Selector */}
                <div className="space-y-3 bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Invitation Color Theme</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Customize the color scheme of your digital invitation card.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { name: "Sage Botanical", accent: "#6B8E70", bg: "#F6F4F0" },
                      { name: "Obsidian Gold", accent: "#D4AF37", bg: "#121212" },
                      { name: "Earthy Terracotta", accent: "#C97A63", bg: "#FAF6F0" },
                      { name: "Burgundy Classic", accent: "#8E3B46", bg: "#FBF8F3" },
                      { name: "Midnight Sapphire", accent: "#4A6FA5", bg: "#F4F7FA" },
                    ].map((pal) => {
                      const isSelected = content.accent_color === pal.accent && content.bg_color === pal.bg;
                      return (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => setContent(prev => ({ ...prev, accent_color: pal.accent, bg_color: pal.bg }))}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelected ? "border-zinc-900 bg-white ring-2 ring-zinc-900/10 shadow-xs" : "border-zinc-200 bg-white/50 hover:bg-white"
                          }`}
                        >
                          <div className="flex gap-1 mb-1.5">
                            <div className="h-4 w-4 rounded-full border border-zinc-350/30 shadow-2xs" style={{ backgroundColor: pal.bg }} />
                            <div className="h-4 w-4 rounded-full border border-zinc-350/30 shadow-2xs" style={{ backgroundColor: pal.accent }} />
                          </div>
                          <span className="text-[9px] font-semibold text-zinc-650 truncate max-w-full text-center leading-none">
                            {pal.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Pickers */}
                  <div className="flex items-center gap-6 pt-2 border-t border-zinc-200/60">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Accent:</label>
                      <div className="relative h-6 w-9 rounded-lg border border-zinc-300 overflow-hidden cursor-pointer">
                        <input
                          type="color"
                          value={content.accent_color || "#6B8E70"}
                          onChange={(e) => setContent(prev => ({ ...prev, accent_color: e.target.value }))}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <div className="h-full w-full" style={{ backgroundColor: content.accent_color || "#6B8E70" }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Background:</label>
                      <div className="relative h-6 w-9 rounded-lg border border-zinc-300 overflow-hidden cursor-pointer">
                        <input
                          type="color"
                          value={content.bg_color || "#F6F4F0"}
                          onChange={(e) => setContent(prev => ({ ...prev, bg_color: e.target.value }))}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <div className="h-full w-full" style={{ backgroundColor: content.bg_color || "#F6F4F0" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid container for inputs to prevent scrolling */}
                <div className="bg-white border border-zinc-150 p-5 rounded-2xl space-y-5">
                  <h4 className="font-serif text-sm text-zinc-800 border-b pb-1.5">2. Ceremony Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        Bride Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={content.bride_name || ""}
                        onChange={(e) => setContent(prev => ({ ...prev, bride_name: e.target.value }))}
                        placeholder="Bride's Name"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        Groom Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={content.groom_name || ""}
                        onChange={(e) => setContent(prev => ({ ...prev, groom_name: e.target.value }))}
                        placeholder="Groom's Name"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Display Order</label>
                      <CustomSelect
                        value={content.name_display_order || "bride_first"}
                        onChange={(val) => setContent(prev => ({ ...prev, name_display_order: val }))}
                        options={[
                          { value: "bride_first", label: "Bride Name First" },
                          { value: "groom_first", label: "Groom Name First" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                    <div className="space-y-1.5 col-span-1 md:col-span-3 flex items-center justify-between bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-200/60">
                      <div>
                        <h5 className="font-bold text-zinc-900 text-xs">Include Parents Names</h5>
                        <p className="text-[10px] text-zinc-550">Show parents of the bride and groom on the card.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleField(null, "parents_enabled", ["bride_parents", "groom_parents"])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          content.parents_enabled ? "bg-[#6B8E70]" : "bg-zinc-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            content.parents_enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Ceremony Type</label>
                      <CustomSelect
                        value={content.ceremony_type || "Wedding"}
                        onChange={(val) => setContent(prev => ({ ...prev, ceremony_type: val }))}
                        options={[
                          { value: "Wedding", label: "Wedding" },
                          { value: "Engagement", label: "Engagement" },
                          { value: "Nikah", label: "Nikah" },
                          { value: "Sangeet", label: "Sangeet" },
                          { value: "Other", label: "Other Event" },
                        ]}
                      />
                    </div>
                    {content.parents_enabled && (
                      <>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Bride Parents (Opt)</label>
                          <input
                            type="text"
                            value={content.bride_parents || ""}
                            onChange={(e) => setContent(prev => ({ ...prev, bride_parents: e.target.value }))}
                            placeholder="Mr. & Mrs. Parent"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Groom Parents (Opt)</label>
                          <input
                            type="text"
                            value={content.groom_parents || ""}
                            onChange={(e) => setContent(prev => ({ ...prev, groom_parents: e.target.value }))}
                            placeholder="Mr. & Mrs. Parent"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-zinc-150 p-5 rounded-2xl space-y-5">
                  <h4 className="font-serif text-sm text-zinc-800 border-b pb-1.5">3. Date, Time & Venue</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        Event Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={content.event_date || ""}
                        onChange={(e) => setContent(prev => ({ ...prev, event_date: e.target.value }))}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Event Time</label>
                      <input
                        type="time"
                        value={content.event_time || ""}
                        onChange={(e) => setContent(prev => ({ ...prev, event_time: e.target.value }))}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex items-center justify-between bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-200/60 h-[46px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Specify End Time</span>
                        <button
                          type="button"
                          onClick={() => toggleField(null, "end_time_enabled", ["end_date_time"])}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                            content.end_time_enabled ? "bg-[#6B8E70]" : "bg-zinc-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                              content.end_time_enabled ? "translate-x-4.5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {content.end_time_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                      <div className="col-span-2 hidden md:block" />
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">End Time (Optional)</label>
                        <input
                          type="time"
                          value={content.end_date_time || ""}
                          onChange={(e) => setContent(prev => ({ ...prev, end_date_time: e.target.value }))}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        Venue Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={content.venue_name || ""}
                        onChange={(e) => setContent(prev => ({ ...prev, venue_name: e.target.value }))}
                        placeholder="Venue Hall Name"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex items-center justify-between bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-200/60 h-[46px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Google Map Link</span>
                        <button
                          type="button"
                          onClick={() => toggleField(null, "google_map_enabled", ["google_map_link"])}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                            content.google_map_enabled ? "bg-[#6B8E70]" : "bg-zinc-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                              content.google_map_enabled ? "translate-x-4.5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {content.google_map_enabled && (
                    <div className="grid grid-cols-1 gap-4 border-t pt-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Google Map URL</label>
                        <input
                          type="text"
                          value={content.google_map_link || ""}
                          onChange={(e) => setContent(prev => ({ ...prev, google_map_link: e.target.value }))}
                          placeholder="https://maps.google.com/..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 border-t pt-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      Venue Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={content.venue_address || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, venue_address: e.target.value }))}
                      placeholder="Street, City, State"
                      rows="2"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none resize-none focus:border-zinc-950 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="bg-white border border-zinc-150 p-5 rounded-2xl space-y-5">
                  <h4 className="font-serif text-sm text-zinc-800 border-b pb-1.5">4. Welcome Note & Attributions</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Welcome Note Presets</label>
                      </div>
                      <div className="space-y-2">
                        {currentPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setContent(prev => ({ ...prev, welcome_note: preset }))}
                            className={`w-full text-left p-2.5 border rounded-xl text-xs transition-all cursor-pointer ${
                              content.welcome_note === preset
                                ? "bg-[#6B8E70]/10 border-[#6B8E70] text-[#6B8E70] font-semibold"
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100/50"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Custom Welcome Note</label>
                        <p className="text-[10px] text-zinc-400 italic">Or type your custom greeting</p>
                      </div>
                      <textarea
                        value={content.welcome_note || ""}
                        onChange={(e) => setContent(prev => ({ ...prev, welcome_note: e.target.value }))}
                        placeholder="Type your own greeting note here..."
                        rows="5"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none resize-none focus:border-zinc-950 focus:bg-white transition-all h-[115px]"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-200/60">
                      <div>
                        <h5 className="font-bold text-zinc-900 text-xs">Enable Footer Attributions</h5>
                        <p className="text-[10px] text-zinc-550">Show a closing message or attribution names at the bottom of the card.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleField(null, "attributions_enabled", ["attribution_heading", "attribution_names"])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          content.attributions_enabled ? "bg-[#6B8E70]" : "bg-zinc-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            content.attributions_enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {content.attributions_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Attribution Heading</label>
                          <input
                            type="text"
                            value={content.attribution_heading || ""}
                            onChange={(e) => setContent(prev => ({ ...prev, attribution_heading: e.target.value }))}
                            placeholder={
                              content.ceremony_type?.toLowerCase() === "nikah" ? "e.g. Barakallah" :
                              content.ceremony_type?.toLowerCase() === "engagement" ? "e.g. Warm regards" :
                              "e.g. Best wishes"
                            }
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Attribution Names</label>
                          <input
                            type="text"
                            value={content.attribution_names || ""}
                            onChange={(e) => setContent(prev => ({ ...prev, attribution_names: e.target.value }))}
                            placeholder="e.g. Family & Friends"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                          />
                        </div>
                        <p className="col-span-1 md:col-span-2 text-[10px] text-zinc-400 italic mt-1 leading-none">
                          Shown at the bottom of your invitation (e.g. "Best wishes", "Family & Friends")
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigateStep(2)}
                  className="w-full bg-[#6B8E70] hover:bg-[#5f7d67] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider mt-6 cursor-pointer transition-all shadow-sm"
                >
                  Save and Continue →
                </button>
              </div>
            )}

            {/* STEP 2: MEDIA & ADD-ONS */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-serif text-lg text-zinc-900 border-b pb-2">Media & Add-ons</h3>

                <div className="border-b pb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">Enable Our Story</h4>
                      <p className="text-xs text-zinc-400">Add a brief, romantic description of your love story.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleField(null, "our_story_enabled", ["our_story"])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        content.our_story_enabled ? "bg-[#6B8E70]" : "bg-zinc-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          content.our_story_enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {content.our_story_enabled && (
                    <div className="space-y-1.5 pt-2">
                      <textarea
                        value={content.our_story || ""}
                        onChange={(e) => setContent(prev => ({ ...prev, our_story: e.target.value }))}
                        placeholder="Write a brief, romantic timeline or description of your love story..."
                        rows="4"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none resize-none focus:border-zinc-900"
                      />
                    </div>
                  )}
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Main Cover Photo <span className="text-red-500">*</span></label>
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
                        content.photo_album_enabled ? "bg-[#6B8E70]" : "bg-zinc-200"
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
                      content.rsvp_enabled ? "bg-[#6B8E70]" : "bg-zinc-200"
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
                    onClick={() => handleNavigateStep(1)}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateStep(3)}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Save & Preview →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PREVIEW DETAILS */}
            {step === 3 && (
              <div className="space-y-6 text-left py-4">
                <div className="border-l-4 border-[#8B7A5D] bg-[#FBFBFA] border border-zinc-200/60 rounded-2xl p-6 space-y-6">
                  {/* Header row with Icon */}
                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-[#6B8E70]/10 border border-[#6B8E70]/20 flex items-center justify-center text-[#6B8E70] text-lg shrink-0">
                      🚀
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">Ready to share with guests?</h4>
                      <p className="text-xs text-zinc-450 mt-0.5 leading-relaxed">
                        Publish to get your unique guest link — takes a few seconds
                      </p>
                    </div>
                  </div>

                  {/* Highlights Box */}
                  <div className="bg-[#F4F4F2]/75 border border-zinc-200/40 rounded-xl p-4 space-y-3.5 text-xs text-zinc-650">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-3.5 h-3.5 text-zinc-550 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      <span>A shareable link guests open on any device</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <svg className="w-3.5 h-3.5 text-zinc-550 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75v16.5M15 3.75v16.5M3.75 9h16.5M3.75 15h16.5" />
                      </svg>
                      <span>Cinematic opening animation — just like the real experience</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <svg className="w-3.5 h-3.5 text-zinc-550 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.115c0 1.047-.307 2.036-.837 2.87m0-5.99a9.06 9.06 0 00-1.5-.224 9.05 9.05 0 00-1.5.224m4-2.44a4.478 4.478 0 00-2.25-.612 4.478 4.478 0 00-2.25.612m0 0a4.47 4.47 0 00-2.25 3.75v.06M3.3 18c0-2.1 1.7-3.7 3.7-3.7 1.1 0 2 .5 2.7 1.3" />
                      </svg>
                      <span>Live RSVP tracking in your dashboard</span>
                    </div>
                  </div>

                  {/* Publish Button */}
                  <button
                    onClick={() => handleNavigateStep(4)}
                    className="w-full bg-[#6B8E70] hover:bg-[#5f7d67] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer shadow-sm"
                  >
                    🚀 Publish Invitation
                  </button>
                </div>

                {/* Back / Navigation block */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Need to make changes first?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleNavigateStep(1)}
                      className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-zinc-550" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit details
                    </button>
                    <button
                      onClick={() => router.push("/templates")}
                      className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-zinc-550" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Change template
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PAY & PUBLISH */}
            {step === 4 && (
              <div className="space-y-6 text-left">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl text-zinc-900 font-light">Publish Your Invitation</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    One payment. Your invitation goes live — share it with every guest instantly.
                  </p>
                </div>

                <div className="border border-zinc-200 bg-[#FBFBFA] rounded-3xl p-6 space-y-6">
                  {/* Order Summary Title */}
                  <div className="flex items-center gap-2 border-b border-zinc-150 pb-4">
                    <svg className="w-4 h-4 text-[#8B7A5D]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-widest">Order Summary</h4>
                  </div>

                  {/* Split Section: Invitation details */}
                  <div className="grid grid-cols-2 gap-4 border-b border-zinc-200/60 pb-5">
                    <div>
                      <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Invitation for</span>
                      <strong className="text-sm text-zinc-800 font-semibold mt-1 block">
                        {content.bride_name || "Bride"} &amp; {content.groom_name || "Groom"}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-right">Template</span>
                      <strong className="text-sm text-zinc-800 font-medium mt-1 block text-right">
                        {template?.name || "Floralarch"}
                      </strong>
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="flex justify-between items-center pb-1">
                    <div>
                      <span className="font-bold text-zinc-800 text-xs block">One-time publish fee</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">Unique guest link • Unlimited RSVPs</span>
                    </div>
                    <strong className="font-serif text-2xl font-light text-zinc-900">
                      {displayPrice === 0 ? "Free" : `₹${displayPrice}`}
                    </strong>
                  </div>

                  {/* Included features list */}
                  <div className="bg-[#F4F4F2]/75 border border-zinc-200/40 rounded-2xl p-5 space-y-3.5 text-xs text-zinc-650">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-3.5 h-3.5 text-[#6B8E70]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Digital wedding invitation</span>
                    </div>
                    {content.rsvp_enabled && (
                      <div className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-[#6B8E70]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Unlimited RSVP tracking</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <svg className="w-3.5 h-3.5 text-[#6B8E70]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Unique shareable guest link</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <svg className="w-3.5 h-3.5 text-[#6B8E70]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Photo album &amp; map navigation</span>
                    </div>
                  </div>

                  {/* Automatically remove notice box */}
                  <div className="border border-amber-200/80 bg-amber-50/40 rounded-2xl p-4 flex gap-3 text-[11px] text-amber-800 leading-relaxed items-start">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>
                      Your invitation will be <strong className="font-bold">automatically removed on {
                        content.event_date ? (
                          (() => {
                            const d = new Date(content.event_date);
                            d.setDate(d.getDate() + 10);
                            return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                          })()
                        ) : "September 9, 2026"
                      }</strong> — 10 days after your event date.
                    </span>
                  </div>
                </div>

                {!isPaid ? (
                  <div className="space-y-4">
                    <button
                      onClick={handlePayAndPublish}
                      disabled={publishing}
                      className="w-full bg-[#6B8E70] hover:bg-[#5f7d67] active:scale-[0.98] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {publishing ? "Processing Order..." : displayPrice === 0 ? "Publish Invitation" : "Pay & publish"}
                    </button>
                    <p className="text-[10px] text-zinc-400 text-center">
                      {displayPrice === 0 ? "On click, your invitation will be published instantly." : "On success, your invitation will be published and you'll receive a unique share link."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center text-emerald-800 space-y-2">
                      <span className="text-2xl block">🌿</span>
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
                          className="flex-1 bg-zinc-50 border border-zinc-200 border-r-0 rounded-l-xl px-4 py-3.5 text-xs text-zinc-650 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareableLink);
                            alert("Copied to clipboard!");
                          }}
                          className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-5 rounded-r-xl cursor-pointer"
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

        {/* Floating Preview Trigger Button */}
        <button
          onClick={() => setShowPhonePreview(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#6B8E70] hover:bg-[#5f7d67] text-white font-bold px-5 py-3 rounded-full text-xs shadow-xl flex items-center gap-2 transition hover:scale-105 active:scale-95 duration-200 cursor-pointer"
        >
          <span>📱</span> Preview Invitation
        </button>

        {/* Phone Preview Overlay Modal */}
        <AnimatePresence>
          {showPhonePreview && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6"
              onClick={() => setShowPhonePreview(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative flex flex-col items-center gap-4"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking phone mockup
              >
                {/* Close button */}
                <button
                  onClick={() => setShowPhonePreview(false)}
                  className="absolute -top-12 right-0 bg-white hover:bg-zinc-100 text-zinc-800 font-bold h-9 w-9 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer z-55 border border-zinc-200"
                  title="Close Preview"
                >
                  ✕
                </button>

                <div className="w-80 h-[calc(100vh-110px)] max-h-[685px] min-h-[500px] rounded-[44px] shadow-2xl border-[11px] border-zinc-950 bg-white overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-26 h-5.5 bg-zinc-950 rounded-b-2xl z-20" />
                  <div className="h-full w-full overflow-y-auto">
                    <TemplateRenderer
                      componentKey={componentKey}
                      content={content}
                      mode="editor"
                      onRsvpSubmit={handleRsvpSubmit}
                      hideBranding={content.hide_branding && features.white_label}
                    />
                  </div>
                </div>
                
                <span className="text-[10px] text-white/80 font-bold tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  Live Mobile Preview
                </span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
                  <CustomSelect
                    value={aiSelectedField}
                    onChange={(val) => {
                      setAiSelectedField(val);
                      setAiDetails("");
                      setAiVariations([]);
                    }}
                    options={editableTextFields.map((f) => ({ value: f.key, label: f.label }))}
                    placeholder="Select target field..."
                  />
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
                            : "bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200/50"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-650 uppercase">
                    {aiSelectedField === "our_story"
                      ? "How You Met / Love Story Details"
                      : aiSelectedField === "attribution_heading"
                      ? "Closing Tone Hint (optional)"
                      : aiSelectedField === "attribution_names"
                      ? "Family or Group Names to Include (optional)"
                      : "Theme, Details, or Message Settings"}
                  </label>
                  <textarea
                    placeholder={
                      aiSelectedField === "our_story"
                        ? "e.g. We met at college, introduced by a mutual friend, matched on an app..."
                        : aiSelectedField === "attribution_heading"
                        ? "e.g. Keep it short, religious, or modern..."
                        : aiSelectedField === "attribution_names"
                        ? "e.g. The Sharma Family, close friends..."
                        : "e.g. Garden wedding, traditional ceremony at sunset"
                    }
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
                  {aiLoading
                    ? "Generating…"
                    : `Generate ${
                        aiSelectedField === "our_story" ? "Our Story" :
                        aiSelectedField === "welcome_note" ? "Welcome Note" :
                        aiSelectedField === "attribution_heading" ? "Attribution Heading" :
                        aiSelectedField === "attribution_names" ? "Attribution Names" :
                        "Copy"
                      }`}
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
