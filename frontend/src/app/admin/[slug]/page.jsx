"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import apiClient from "@/lib/api";

export default function EditTemplate() {
  const router = useRouter();
  const { slug } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  
  const [categoriesList, setCategoriesList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tier: "classic",
    price_inr: 999,
    is_new: false,
    component_key: "ivory-bloom",
    description: "",
    thumbnail: "",
    is_active: true,
    sort_order: 0,
    category_ids: [],
    style_tags_str: "",
    field_schema_str: "",
    demo_content_str: ""
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

    const loadData = async () => {
      try {
        // Fetch categories first
        const catRes = await apiClient.get("/categories/");
        setCategoriesList(catRes.data);

        // Fetch template detail
        const res = await apiClient.get(`/templates/admin/${slug}/`);
        const tpl = res.data;
        setFormData({
          name: tpl.name || "",
          slug: tpl.slug || "",
          tier: tpl.tier || "classic",
          price_inr: tpl.price_inr ?? 999,
          is_new: !!tpl.is_new,
          component_key: tpl.component_key || "ivory-bloom",
          description: tpl.description || "",
          thumbnail: tpl.thumbnail || "",
          is_active: !!tpl.is_active,
          sort_order: tpl.sort_order || 0,
          category_ids: (tpl.categories || []).map(c => c.id),
          style_tags_str: (tpl.style_tags || []).join(", "),
          field_schema_str: JSON.stringify(tpl.field_schema || {}, null, 2),
          demo_content_str: JSON.stringify(tpl.demo_content || {}, null, 2)
        });
      } catch {
        setError("Error loading template details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, slug, router]);

  const handleThumbnailUpload = async (file) => {
    try {
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
          field_type: "image",
        }),
      });
      if (!presignRes.ok) throw new Error("Failed to get presigned URL");
      const { upload_url, public_url } = await presignRes.json();

      await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setFormData(prev => ({ ...prev, thumbnail: public_url }));
    } catch (err) {
      alert("Failed to upload thumbnail.");
    }
  };

  const handleCategoryChange = (catId, checked) => {
    setFormData(prev => {
      const updated = checked
        ? [...prev.category_ids, catId]
        : prev.category_ids.filter(id => id !== catId);
      return { ...prev, category_ids: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setError("Name and Slug are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let field_schema = {};
      try {
        field_schema = JSON.parse(formData.field_schema_str);
      } catch {
        setError("Invalid JSON format for field schema.");
        setSaving(false);
        return;
      }

      let demo_content = {};
      try {
        demo_content = JSON.parse(formData.demo_content_str);
      } catch {
        setError("Invalid JSON format for demo content.");
        setSaving(false);
        return;
      }

      const style_tags = formData.style_tags_str
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await apiClient.patch(`/templates/admin/${slug}/`, {
        name: formData.name,
        slug: formData.slug,
        tier: formData.tier,
        price_inr: parseInt(formData.price_inr) || 0,
        is_new: formData.is_new,
        component_key: formData.component_key,
        description: formData.description,
        thumbnail: formData.thumbnail,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order) || 0,
        category_ids: formData.category_ids,
        style_tags,
        field_schema,
        demo_content
      });

      router.push("/admin");
    } catch (err) {
      const errMsg = err.response?.data
        ? Object.values(err.response.data).flat().join(" ")
        : "Failed to update template.";
      setError(errMsg);
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
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none"
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
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Component Key (Registry)</label>
              <input
                type="text"
                value={formData.component_key}
                onChange={(e) => setFormData({ ...formData, component_key: e.target.value })}
                placeholder="e.g. ivory-bloom"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Price (INR)</label>
              <input
                type="number"
                value={formData.price_inr}
                onChange={(e) => setFormData({ ...formData, price_inr: e.target.value })}
                placeholder="e.g. 999"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Tier Badge</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              >
                <option value="new">New</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Categories</label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {categoriesList.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 text-xs text-brand-dark">
                  <input
                    type="checkbox"
                    checked={formData.category_ids.includes(cat.id)}
                    onChange={(e) => handleCategoryChange(cat.id, e.target.checked)}
                    className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-brand-border rounded"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 border-t pt-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Style Tags (Comma-separated)</label>
            <input
              type="text"
              value={formData.style_tags_str}
              onChange={(e) => setFormData({ ...formData, style_tags_str: e.target.value })}
              placeholder="Minimalist, Traditional, Modern"
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Thumbnail Image URL</label>
            {formData.thumbnail && (
              <div className="h-28 w-full border rounded-xl overflow-hidden mb-2 relative group">
                <img src={formData.thumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thumbnail: "" })}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition duration-200"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="Thumbnail URL path..."
                className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-xs focus:outline-none"
              />
              <div className="bg-brand-dark text-brand-bg hover:bg-brand-accent hover:text-brand-dark transition-colors px-4 rounded-xl text-xs font-bold flex items-center justify-center relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleThumbnailUpload(e.target.files[0]);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                Upload
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              placeholder="Short sales copy describing design highlights…"
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Field Schema JSON Config</label>
            <textarea
              value={formData.field_schema_str}
              onChange={(e) => setFormData({ ...formData, field_schema_str: e.target.value })}
              rows="5"
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Demo Content JSON Config</label>
            <textarea
              value={formData.demo_content_str}
              onChange={(e) => setFormData({ ...formData, demo_content_str: e.target.value })}
              rows="5"
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 items-center border-t border-brand-border/40 pt-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-brand-border rounded"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/75">Is Active</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-brand-border rounded"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/75">Is New</span>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/75">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none"
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
