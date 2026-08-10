"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const PLAN_LABELS = {
  classic: { label: "Classic", cls: "bg-brand-bg-soft text-brand-text-muted border border-brand-border/60" },
  royal: { label: "Royal", cls: "bg-brand-accent/12 text-brand-accent border border-brand-accent/20" },
};

function StatusPill({ isPaid }) {
  if (isPaid)
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Paid &amp; Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Unpaid Draft
    </span>
  );
}

function EmptyState({ tab }) {
  const isDrafts = tab === "drafts";
  return (
    <motion.div {...fadeUp} className="flex flex-col items-center justify-center py-28 px-8 text-center max-w-sm mx-auto space-y-8">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border border-brand-border/60 bg-brand-bg-soft flex items-center justify-center">
          <div className="h-14 w-14 rounded-full border border-brand-accent/20 bg-brand-bg flex items-center justify-center">
            <svg className="h-6 w-6 text-brand-accent/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
          {isDrafts ? "No Drafts" : "No Active Invites"}
        </p>
        <h3 className="font-serif text-2xl font-light text-brand-dark leading-snug">
          {isDrafts ? (
            <>Begin your <span className="italic font-normal">design journey</span></>
          ) : (
            <>Activate your <span className="italic font-normal">invitations</span></>
          )}
        </h3>
        <p className="text-sm text-brand-text-muted leading-relaxed">
          {isDrafts
            ? "Choose from our catalog of premium templates and customize your wedding card."
            : "Go to your drafts and complete publishing to activate your shareable links."}
        </p>
      </div>

      {isDrafts && (
        <Link
          href="/templates"
          className="bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm"
        >
          Browse Templates
        </Link>
      )}
    </motion.div>
  );
}

// ─── Guest RSVP Manager Modal ───
function RsvpManagerModal({ slug, onClose }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    guest_name: "", email: "", phone: "",
    status: "attending", guest_count: 1, message: ""
  });
  const [addLoading, setAddLoading] = useState(false);

  const fetchRSVPs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/rsvps/`);
      if (search) url.searchParams.set("search", search);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGuests(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRSVPs();
  }, [slug, search, statusFilter]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${slug}/rsvps/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newGuest)
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewGuest({ guest_name: "", email: "", phone: "", status: "attending", guest_count: 1, message: "" });
        fetchRSVPs();
      }
    } catch {
      alert("Error adding guest.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (guests.length === 0) return;
    const headers = "Guest Name,Status,Count,Email,Phone,Message\n";
    const rows = guests.map(g => (
      `"${g.guest_name}","${g.status}",${g.guest_count},"${g.email || ''}","${g.phone || ''}","${g.message || ''}"`
    )).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `RSVP_GuestList_${slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCount = guests.reduce((acc, g) => acc + g.guest_count, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 z-50 font-sans"
    >
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        className="bg-brand-bg w-full max-w-2xl rounded-3xl p-8 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden space-y-6"
      >
        <div className="flex justify-between items-center border-b border-brand-border/40 pb-4 shrink-0">
          <div>
            <h2 className="font-serif text-2xl font-light text-brand-dark">Guest RSVP List</h2>
            <p className="text-xs text-brand-text-muted mt-1">Total attending guests: {totalCount}</p>
          </div>
          <button onClick={onClose} className="text-brand-dark/70 hover:text-brand-dark text-xs uppercase tracking-widest font-bold cursor-pointer">
            Close
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <input
            type="text" placeholder="Search by name…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-brand-bg-soft/40 border border-brand-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
          />
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-brand-bg border border-brand-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
          >
            <option value="all">All RSVP statuses</option>
            <option value="attending">Attending</option>
            <option value="declined">Declined</option>
          </select>

          <button
            onClick={() => setShowAddForm(p => !p)}
            className="bg-brand-bg-soft hover:bg-brand-dark text-brand-dark hover:text-brand-bg border border-brand-border/60 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {showAddForm ? "View List" : "Add Offline Guest"}
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Export CSV
          </button>
        </div>

        {/* Guest Add Form */}
        <div className="flex-1 overflow-y-auto">
          {showAddForm ? (
            <form onSubmit={handleAddGuest} className="space-y-4 max-w-md mx-auto pt-4">
              <h3 className="font-serif text-lg text-brand-dark">Manual Entry</h3>
              <input
                type="text" required placeholder="Guest Name"
                value={newGuest.guest_name} onChange={(e) => setNewGuest({ ...newGuest, guest_name: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border/60 rounded-xl px-4 py-3 text-xs focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="email" placeholder="Email" value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} className="w-full bg-brand-bg border border-brand-border/60 rounded-xl px-4 py-3 text-xs" />
                <input type="tel" placeholder="Phone" value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} className="w-full bg-brand-bg border border-brand-border/60 rounded-xl px-4 py-3 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={newGuest.status} onChange={(e) => setNewGuest({ ...newGuest, status: e.target.value })} className="w-full bg-brand-bg border border-brand-border/60 rounded-xl px-4 py-3 text-xs">
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                </select>
                <input type="number" min="1" value={newGuest.guest_count} onChange={(e) => setNewGuest({ ...newGuest, guest_count: parseInt(e.target.value) || 1 })} className="w-full bg-brand-bg border border-brand-border/60 rounded-xl px-4 py-3 text-xs" />
              </div>
              <textarea placeholder="Wishes/comments" value={newGuest.message} onChange={(e) => setNewGuest({ ...newGuest, message: e.target.value })} rows="3" className="w-full bg-brand-bg border border-brand-border/60 rounded-xl px-4 py-3 text-xs resize-none" />
              <button type="submit" disabled={addLoading} className="w-full bg-brand-dark text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer">
                {addLoading ? "Adding…" : "Save Guest Entry"}
              </button>
            </form>
          ) : loading ? (
            <div className="flex justify-center items-center py-20 gap-2.5">
              <div className="h-5 w-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-brand-text-muted">Loading list…</span>
            </div>
          ) : guests.length === 0 ? (
            <p className="text-center py-20 text-xs text-brand-text-muted italic">No guest responses match current query.</p>
          ) : (
            <div className="overflow-x-auto bg-white border border-brand-border/40 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-bg-soft/30 border-b border-brand-border/40">
                    <th className="p-4 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Guest Name</th>
                    <th className="p-4 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Status</th>
                    <th className="p-4 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Count</th>
                    <th className="p-4 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Contact Details</th>
                    <th className="p-4 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Wishes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20 text-xs">
                  {guests.map((g) => (
                    <tr key={g.id} className="hover:bg-brand-bg-soft/10">
                      <td className="p-4 font-medium text-brand-dark">{g.guest_name}</td>
                      <td className="p-4">
                        {g.status === "attending" ? (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">Attending</span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/50">Declined</span>
                        )}
                      </td>
                      <td className="p-4 text-brand-text-muted font-bold">{g.guest_count}</td>
                      <td className="p-4 space-y-0.5">
                        {g.email && <p className="text-zinc-500">{g.email}</p>}
                        {g.phone && <p className="text-zinc-500">{g.phone}</p>}
                        {!g.email && !g.phone && <span className="text-zinc-400 font-light">—</span>}
                      </td>
                      <td className="p-4 text-brand-text-muted max-w-44 truncate italic">
                        {g.message || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInviteSlug, setSelectedInviteSlug] = useState(null);
  const [dashboardTab, setDashboardTab] = useState("drafts"); // drafts | purchased

  // Agency client folder states
  const [features, setFeatures] = useState({
    multi_client: false
  });
  const [folders, setFolders] = useState(["All"]);
  const [activeFolder, setActiveFolder] = useState("All");
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [invitationFolderMap, setInvitationFolderMap] = useState({});

  useEffect(() => {
    const fetchInvitations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { setLoading(false); return; }
        
        // Fetch invitations
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInvitations(Array.isArray(data) ? data : data.results ?? []);
        }

        // Fetch plan features
        const featRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/features/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (featRes.ok) {
          const feats = await featRes.json();
          setFeatures(feats);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();

    // Load folder config from local storage if available
    try {
      const savedFolders = JSON.parse(localStorage.getItem("cardessa_folders") || '["All"]');
      const savedMap = JSON.parse(localStorage.getItem("cardessa_folder_map") || "{}");
      setFolders(savedFolders);
      setInvitationFolderMap(savedMap);
    } catch {
      // fail silently
    }
  }, []);

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim();
    if (!folders.includes(name)) {
      const updated = [...folders, name];
      setFolders(updated);
      localStorage.setItem("cardessa_folders", JSON.stringify(updated));
    }
    setNewFolderName("");
    setShowFolderModal(false);
  };

  const handleMoveToFolder = (invId, folderName) => {
    const updatedMap = { ...invitationFolderMap, [invId]: folderName };
    setInvitationFolderMap(updatedMap);
    localStorage.setItem("cardessa_folder_map", JSON.stringify(updatedMap));
  };

  const filteredInvitations = invitations.filter((inv) => {
    if (activeFolder === "All") return true;
    return invitationFolderMap[inv.id] === activeFolder;
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-6 pt-36 pb-28 grow">

        {/* Header */}
        <motion.header
          {...fadeUp}
          className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12 pb-8 border-b border-brand-border/40"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Workspace</span>
            <h1 className="font-serif text-4xl font-light text-brand-dark tracking-tight leading-tight">
              Hello, <span className="italic font-normal">{firstName}</span>
            </h1>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Manage, edit, and personalize your digital invitations.
            </p>
          </div>

          <Link
            href="/templates"
            className="self-start sm:self-auto flex items-center gap-2 bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors duration-300 shadow-sm"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Invitation
          </Link>
        </motion.header>

        {/* Stats Row */}
        {!loading && invitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-10"
          >
            {[
              { label: "Total Invitations", value: invitations.length },
              { label: "Published & Paid", value: invitations.filter((i) => i.is_paid).length },
              { label: "Drafts", value: invitations.filter((i) => !i.is_paid).length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-brand-bg border border-brand-border/50 rounded-2xl p-5 space-y-1">
                <p className="text-2xl font-serif font-light text-brand-dark">{value}</p>
                <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Agency Multi-Client folders row ── */}
        {features.multi_client && !loading && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B8E70]">Client Folders (Planner Mode)</span>
              <button
                onClick={() => setShowFolderModal(true)}
                className="text-xs text-[#6B8E70] font-semibold hover:underline"
              >
                + Add Client Folder
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeFolder === folder
                      ? "bg-brand-dark border-brand-dark text-white"
                      : "bg-white border-brand-border/60 text-brand-dark hover:border-brand-accent"
                  }`}
                >
                  {folder === "All" ? "📂 All Clients" : `📁 ${folder}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex border-b border-brand-border/40 gap-6 mb-8 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setDashboardTab("drafts")}
            className={`pb-3 transition border-b-2 cursor-pointer ${
              dashboardTab === "drafts"
                ? "border-brand-accent text-brand-dark"
                : "border-transparent text-brand-text-muted hover:text-brand-dark"
            }`}
          >
            Edited Designs ({invitations.filter((i) => !i.is_paid).length})
          </button>
          <button
            onClick={() => setDashboardTab("purchased")}
            className={`pb-3 transition border-b-2 cursor-pointer ${
              dashboardTab === "purchased"
                ? "border-brand-accent text-brand-dark"
                : "border-transparent text-brand-text-muted hover:text-brand-dark"
            }`}
          >
            Purchased &amp; Published ({invitations.filter((i) => i.is_paid).length})
          </button>
        </div>

        {/* Invitations List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="bg-brand-bg border border-brand-border/50 rounded-3xl overflow-hidden shadow-xs"
        >
          {loading ? (
            <div className="flex items-center justify-center py-28 gap-3">
              <svg className="animate-spin h-5 w-5 text-brand-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-brand-text-muted font-medium tracking-wide">Loading invitations…</span>
            </div>
          ) : invitations.filter((inv) => dashboardTab === "drafts" ? !inv.is_paid : inv.is_paid).length === 0 ? (
            <EmptyState tab={dashboardTab} />
          ) : (
            <ul className="divide-y divide-brand-border/40">
              {invitations
                .filter((inv) => dashboardTab === "drafts" ? !inv.is_paid : inv.is_paid)
                .map((item, idx) => {
                  const currentFolder = invitationFolderMap[item.id] || "Unassigned";
                  return (
                    <motion.li
                      key={item.id ?? idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.06 }}
                      className="group p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-brand-bg-soft/30 transition-colors duration-300"
                    >
                      <div className="flex items-start gap-5">
                        <div className="hidden sm:flex h-12 w-12 rounded-xl bg-brand-bg-soft border border-brand-border/60 items-center justify-center shrink-0">
                          <svg className="h-5 w-5 text-brand-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-serif text-xl font-light text-brand-dark leading-tight">
                              {item.couple_name || "Untitled Invitation"}
                            </h3>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-650 border border-zinc-200">
                              {item.price === 0 ? "Free Template" : `Premium (₹${item.price})`}
                            </span>

                            {/* Client folder label indicator */}
                            {features.multi_client && (
                              <span className="text-[10px] bg-zinc-100 text-zinc-550 border border-zinc-200 px-2 py-0.5 rounded-md font-semibold">
                                📁 {currentFolder}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-text-muted">
                            {item.template_name && (
                              <span>Template: <strong className="text-brand-dark font-medium">{item.template_name}</strong></span>
                            )}
                            {item.event_date && (
                              <>
                                <span className="text-brand-border">·</span>
                                <span>Date: <strong className="text-brand-dark font-medium">{new Date(item.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Move to folder dropdown selector for agency planner users */}
                        {features.multi_client && (
                          <select
                            value={invitationFolderMap[item.id] || "All"}
                            onChange={(e) => handleMoveToFolder(item.id, e.target.value)}
                            className="bg-white border border-brand-border/65 text-zinc-650 px-2.5 py-2 rounded-xl text-xs focus:outline-none"
                          >
                            <option value="All">Unassigned Client</option>
                            {folders.filter(f => f !== "All").map(f => (
                              <option key={f} value={f}>Move to {f}</option>
                            ))}
                          </select>
                        )}

                        <StatusPill isPaid={item.is_paid} />

                        {item.is_paid && (
                          <button
                            onClick={() => setSelectedInviteSlug(item.slug)}
                            className="bg-brand-bg border border-brand-border/60 hover:bg-brand-accent hover:border-brand-accent hover:text-white text-brand-dark font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                          >
                            Guest RSVPs
                          </button>
                        )}

                        {item.slug && item.is_paid && (
                          <a
                            href={`/i/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-bg border border-brand-border/60 hover:bg-brand-accent hover:border-brand-accent hover:text-white text-brand-dark font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
                          >
                            View Live
                          </a>
                        )}

                        <Link
                          href={`/editor/${item.slug || item.id}`}
                          className="bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors duration-300"
                        >
                          {item.is_paid ? "Edit" : "Resume Customization"}
                        </Link>
                      </div>
                    </motion.li>
                  );
                })}
            </ul>
          )}
        </motion.div>
      </main>

      {/* ── Folder Creation Dialog Modal ── */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div>
                <h3 className="font-serif text-xl text-brand-dark">Create Client Folder</h3>
                <p className="text-xs text-brand-text-muted mt-1">Group and organize invitations by couple or event category.</p>
              </div>
              <form onSubmit={handleAddFolder} className="space-y-4">
                <input
                  type="text" required placeholder="Client / Folder Name"
                  value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-zinc-50 border border-brand-border/60 rounded-xl px-4 py-3 text-xs focus:outline-none"
                />
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowFolderModal(false)} className="text-xs uppercase tracking-wider font-bold text-zinc-400 cursor-pointer">Cancel</button>
                  <button type="submit" className="bg-brand-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer">Create</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedInviteSlug && (
          <RsvpManagerModal
            slug={selectedInviteSlug}
            onClose={() => setSelectedInviteSlug(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
