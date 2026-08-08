"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (!user.is_superuser && !user.is_staff)) {
      router.push("/");
      return;
    }

    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/admin/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch {
        alert("Failed to load templates.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [user, authLoading, router]);

  const handleDelete = async (slug) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/admin/${slug}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.slug !== slug));
      } else {
        alert("Delete failed.");
      }
    } catch {
      alert("Error deleting template.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center font-sans">
        <div className="animate-spin h-6 w-6 border-4 border-brand-accent border-t-transparent rounded-full mr-3" />
        <span className="text-sm text-brand-text-muted font-medium">Loading Admin Panel…</span>
      </div>
    );
  }

  const activeCount = templates.filter((t) => t.is_active).length;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 pt-36 pb-24 grow">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12 pb-6 border-b border-brand-border/60">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Super Admin Console</span>
            <h1 className="font-serif text-4xl font-light text-brand-dark tracking-tight">
              Manage <span className="italic font-normal">Templates</span>
            </h1>
          </div>
          <Link
            href="/admin/new"
            className="self-start sm:self-auto bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors duration-300 shadow-sm"
          >
            Create New Template
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-brand-border/60 p-6 rounded-2xl shadow-xs">
            <p className="font-serif text-3xl font-light text-brand-dark">{templates.length}</p>
            <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest mt-1">Total Templates</p>
          </div>
          <div className="bg-white border border-brand-border/60 p-6 rounded-2xl shadow-xs">
            <p className="font-serif text-3xl font-light text-brand-dark">{activeCount}</p>
            <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest mt-1">Active (Visible)</p>
          </div>
          <div className="bg-white border border-brand-border/60 p-6 rounded-2xl shadow-xs">
            <p className="font-serif text-3xl font-light text-brand-dark">{templates.length - activeCount}</p>
            <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest mt-1">Inactive / Draft</p>
          </div>
        </div>

        {/* Template List Table */}
        <div className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden shadow-xs">
          {templates.length === 0 ? (
            <div className="text-center py-20 text-brand-text-muted italic text-sm">
              No templates created yet. Click "Create New Template" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-bg-soft/40 border-b border-brand-border/60">
                    <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-brand-dark/75">Template Name</th>
                    <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-brand-dark/75">Tier</th>
                    <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-brand-dark/75">Style</th>
                    <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-brand-dark/75">Status</th>
                    <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-brand-dark/75 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {templates.map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-brand-bg-soft/10 transition-colors">
                      <td className="p-5 flex items-center gap-3">
                        <span className="h-8 w-8 rounded-lg bg-brand-bg-soft flex items-center justify-center font-bold text-brand-accent">
                          {tpl.name[0]}
                        </span>
                        <div>
                          <p className="font-serif text-sm font-semibold text-brand-dark">{tpl.name}</p>
                          <p className="text-[10px] text-brand-text-muted font-mono mt-0.5">{tpl.slug}</p>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                          tpl.tier?.toLowerCase() === "royal"
                            ? "bg-brand-accent/15 border-brand-accent/20 text-brand-accent"
                            : "bg-brand-bg-soft border-brand-border/60 text-brand-text-muted"
                        }`}>
                          {tpl.tier}
                        </span>
                      </td>
                      <td className="p-5 text-xs text-brand-text-muted font-medium">{tpl.style_tags?.[0] || "Custom"}</td>
                      <td className="p-5">
                        {tpl.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full">
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border border-zinc-200/50 px-2 py-0.5 rounded-full">
                            <span className="h-1 w-1 rounded-full bg-zinc-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right space-x-3">
                        <Link
                          href={`/admin/${tpl.slug}`}
                          className="inline-block bg-brand-bg-soft hover:bg-brand-dark text-brand-dark hover:text-white font-bold py-1.5 px-4 rounded-lg text-[10px] uppercase tracking-wider transition-all duration-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(tpl.slug)}
                          className="bg-red-50 hover:bg-red-500 border border-red-200/60 text-red-600 hover:text-white font-bold py-1.5 px-4 rounded-lg text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
