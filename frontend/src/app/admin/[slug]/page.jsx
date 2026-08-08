"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EditTemplate() {
  const router = useRouter();
  const { slug } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tier: "classic",
    description: "",
    is_active: true,
    sort_order: 0,
    style_tags_str: "",
    animation_config_str: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || (!user.is_superuser && !user.is_staff)) {
      router.push("/");
      return;
    }

    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/admin/${slug}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const tpl = await res.json();
          setFormData({
            name: tpl.name || "",
            slug: tpl.slug || "",
            tier: tpl.tier || "classic",
            description: tpl.description || "",
            is_active: !!tpl.is_active,
            sort_order: tpl.sort_order || 0,
            style_tags_str: (tpl.style_tags || []).join(", "),
            animation_config_str: JSON.stringify(tpl.animation_config || {}, null, 2)
          });
        } else {
          setError("Template not found.");
        }
      } catch {
        setError("Error loading template details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [user, authLoading, slug, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setError("Name and Slug are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      
      // Parse JSON fields
      let animation_config = {};
      try {
        animation_config = JSON.parse(formData.animation_config_str);
      } catch {
        setError("Invalid JSON format for animation config.");
        setSaving(false);
        return;
      }

      const style_tags = formData.style_tags_str
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/admin/${slug}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          tier: formData.tier,
          description: formData.description,
          is_active: formData.is_active,
          sort_order: parseInt(formData.sort_order) || 0,
          style_tags,
          animation_config
        })
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const errData = await res.json();
        setError(Object.values(errData).flat().join(" ") || "Failed to update template.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center font-sans">
        <div className="animate-spin h-6 w-6 border-4 border-brand-accent border-t-transparent rounded-full mr-3" />
        <span className="text-sm text-brand-text-muted font-medium">Loading Template details…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col justify-between">
      <Navbar />

      <main className="max-w-xl w-full mx-auto px-6 pt-36 pb-24 grow">
        
        {/* Header */}
        <header className="mb-10 space-y-1">
          <Link href="/admin" className="text-xs font-bold text-brand-accent hover:underline uppercase tracking-wider block mb-3">
            ← Back to Console
          </Link>
          <h1 className="font-serif text-3xl font-light text-brand-dark tracking-tight">
            Edit <span className="italic font-normal">Template</span>
          </h1>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-brand-border/60 p-8 rounded-3xl shadow-xs">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Vintage Velvet"
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Unique URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. vintage-velvet"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
              >
                <option value="classic">Classic</option>
                <option value="royal">Royal</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Style Tags (Comma-separated)</label>
            <input
              type="text"
              value={formData.style_tags_str}
              onChange={(e) => setFormData({ ...formData, style_tags_str: e.target.value })}
              placeholder="Minimalist, Traditional, Modern"
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Short sales copy describing design highlights…"
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Animation Config JSON</label>
            <textarea
              value={formData.animation_config_str}
              onChange={(e) => setFormData({ ...formData, animation_config_str: e.target.value })}
              rows="4"
              placeholder='e.g. {"hero": "kinetic", "interactive": "scratch"}'
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center border-t border-brand-border/40 pt-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-brand-border rounded"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/75">Is Active (Visible)</span>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {saving ? "Updating Template…" : "Update Template"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
