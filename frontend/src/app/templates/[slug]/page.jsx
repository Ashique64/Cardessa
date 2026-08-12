"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ordersApi } from "@/lib/api";
import TemplateRenderer from "@/components/TemplateRenderer";

export default function TemplateDemoPage() {
  const { slug } = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [useLoading, setUseLoading] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/${slug}/`);
        if (!res.ok) {
          setError("Template not found.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setTemplate(data);
      } catch {
        setError("Error loading template preview.");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [slug]);

  const handleUseDesign = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/editor/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F4F0] flex flex-col items-center justify-center font-sans text-zinc-400">
        <div className="animate-spin h-7 w-7 border-4 border-[#6B8E70] border-t-transparent rounded-full mb-3" />
        <p className="text-xs uppercase tracking-widest font-bold">Loading Preview…</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-[#F6F4F0] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-zinc-200 max-w-sm p-8 rounded-3xl shadow-sm">
          <p className="text-sm font-semibold text-zinc-900 mb-4">{error || "Template not found"}</p>
          <Link href="/templates" className="text-xs text-[#6B8E70] hover:underline uppercase tracking-wider font-bold">
            Browse Templates
          </Link>
        </div>
      </div>
    );
  }

  const componentKey = template.component_key || "ivory-bloom";
  const demoContent  = template.demo_content  || {};

  return (
    <div className="relative min-h-screen">
      {/* ── Floating Header Bar ── */}
      <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/templates"
          className="pointer-events-auto bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-900 hover:text-[#6B8E70] px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition shadow-sm"
        >
          ← Back
        </Link>

        <div className="pointer-events-auto flex items-center gap-3">
          {/* Template name badge */}
          <span className="bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-600 px-4 py-2 rounded-full text-xs font-medium shadow-sm hidden sm:block">
            {template.name}
          </span>

          <button
            onClick={handleUseDesign}
            disabled={useLoading}
            className="bg-[#6B8E70] hover:bg-[#5a7a5e] text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-widest transition duration-300 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {useLoading ? "Checking…" : "Use Design"}
          </button>
        </div>
      </div>

      {/* ── Template Design Preview ── */}
      {/* mode="preview" → cover pre-opened, RSVP form hidden, no interactive audio */}
      <TemplateRenderer
        componentKey={componentKey}
        content={demoContent}
        mode="preview"
      />
    </div>
  );
}
