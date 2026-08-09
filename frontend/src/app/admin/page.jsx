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
  
  // Navigation tabs: 'stats' | 'templates' | 'users' | 'orders'
  const [activeTab, setActiveTab] = useState("stats");
  
  // Loaded data states
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_templates: 0,
    total_invitations: 0,
    total_revenue: 0,
    active_plans: 0
  });

  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      
      // Fetch stats
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin-stats/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch templates
      const tplRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/admin/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tplRes.ok) {
        const tplData = await tplRes.json();
        setTemplates(Array.isArray(tplData) ? tplData : tplData.results ?? []);
      }

      // Fetch users
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/admin/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : usersData.results ?? []);
      }

      // Fetch orders
      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.results ?? []);
      }

    } catch {
      alert("Failed to retrieve console data logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || (!user.is_superuser && !user.is_staff)) {
      router.push("/");
      return;
    }
    loadAdminData();
  }, [user, authLoading, router]);

  const handleDeleteTemplate = async (slug) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/admin/${slug}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.slug !== slug));
        // refresh stats
        loadAdminData();
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
        <span className="text-sm text-brand-text-muted font-medium">Loading Console workspace…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 pt-36 pb-24 grow">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-8 pb-4 border-b border-brand-border/60">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Super Admin Console</span>
            <h1 className="font-serif text-4xl font-light text-brand-dark tracking-tight">
              Management <span className="italic font-normal">Console</span>
            </h1>
          </div>
          {activeTab === "templates" && (
            <Link
              href="/admin/new"
              className="bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-white font-bold py-3 px-5 rounded-xl text-[10px] uppercase tracking-wider transition-colors duration-300 shadow-sm"
            >
              Create New Template
            </Link>
          )}
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-brand-border/40 gap-6 mb-10 text-xs font-bold uppercase tracking-wider">
          {[
            { id: "stats", label: "Stats & Metrics" },
            { id: "templates", label: "Templates Manager" },
            { id: "users", label: "User Directory" },
            { id: "orders", label: "Paid Orders Log" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 transition border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "border-brand-accent text-brand-dark"
                  : "border-transparent text-brand-text-muted hover:text-brand-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SUMMARY STATS */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white border border-brand-border/50 p-6 rounded-2xl shadow-2xs">
                <p className="font-serif text-3xl font-light text-brand-dark">₹{stats.total_revenue?.toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-widest mt-1">Total Revenue</p>
              </div>
              <div className="bg-white border border-brand-border/50 p-6 rounded-2xl shadow-2xs">
                <p className="font-serif text-3xl font-light text-brand-dark">{stats.total_users}</p>
                <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-widest mt-1">Registered Users</p>
              </div>
              <div className="bg-white border border-brand-border/50 p-6 rounded-2xl shadow-2xs">
                <p className="font-serif text-3xl font-light text-brand-dark">{stats.active_plans}</p>
                <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-widest mt-1">Active paid tiers</p>
              </div>
              <div className="bg-white border border-brand-border/50 p-6 rounded-2xl shadow-2xs">
                <p className="font-serif text-3xl font-light text-brand-dark">{stats.total_invitations}</p>
                <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-widest mt-1">Invitations Created</p>
              </div>
            </div>
            
            <div className="bg-white border border-brand-border/50 p-8 rounded-3xl space-y-4">
              <h3 className="font-serif text-xl font-light text-brand-dark">System Health &amp; Activity</h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Cardessa console monitoring runs active. Currently displaying database metrics computed live. Use the navigation links to manage details.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: TEMPLATE MANAGER */}
        {activeTab === "templates" && (
          <div className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden shadow-2xs">
            {templates.length === 0 ? (
              <div className="text-center py-20 text-brand-text-muted italic text-xs">No templates found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg-soft/40 border-b border-brand-border/60">
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Template Name</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Tier</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Style</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Status</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30 text-xs">
                    {templates.map((tpl) => (
                      <tr key={tpl.id} className="hover:bg-brand-bg-soft/10">
                        <td className="p-5 font-serif text-sm font-semibold text-brand-dark">{tpl.name}</td>
                        <td className="p-5">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border bg-brand-bg-soft text-brand-text-muted">{tpl.tier}</span>
                        </td>
                        <td className="p-5 text-brand-text-muted">{tpl.style_tags?.[0] || "Custom"}</td>
                        <td className="p-5">
                          {tpl.is_active ? (
                            <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Active</span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">Inactive</span>
                          )}
                        </td>
                        <td className="p-5 text-right space-x-3">
                          <Link href={`/admin/${tpl.slug}`} className="bg-brand-bg-soft hover:bg-brand-dark hover:text-white px-3 py-1.5 rounded-lg text-[9px] uppercase font-bold transition">Edit</Link>
                          <button onClick={() => handleDeleteTemplate(tpl.slug)} className="bg-red-50 hover:bg-red-500 hover:text-white text-red-650 px-3 py-1.5 rounded-lg text-[9px] uppercase font-bold transition cursor-pointer">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER DIRECTORY */}
        {activeTab === "users" && (
          <div className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden shadow-2xs">
            {users.length === 0 ? (
              <div className="text-center py-20 text-brand-text-muted italic text-xs">No registered users.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg-soft/40 border-b border-brand-border/60">
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">User Profile</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Email</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Account Role</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Signup Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30 text-xs">
                    {users.map((usr) => (
                      <tr key={usr.id} className="hover:bg-brand-bg-soft/10">
                        <td className="p-5 font-semibold text-brand-dark">{usr.name}</td>
                        <td className="p-5 text-brand-text-muted font-mono">{usr.email}</td>
                        <td className="p-5">
                          {usr.is_superuser ? (
                            <span className="text-[9px] font-bold uppercase text-brand-accent bg-brand-accent/12 px-2.5 py-0.5 rounded border border-brand-accent/20">Super Admin</span>
                          ) : usr.is_staff ? (
                            <span className="text-[9px] font-bold uppercase text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">Staff</span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase text-zinc-500 bg-zinc-50 px-2.5 py-0.5 rounded border border-zinc-200">Standard User</span>
                          )}
                        </td>
                        <td className="p-5 text-brand-text-muted">
                          {usr.created_at ? new Date(usr.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAID ORDERS LOG */}
        {activeTab === "orders" && (
          <div className="bg-white border border-brand-border/60 rounded-3xl overflow-hidden shadow-2xs">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-brand-text-muted italic text-xs">No orders registered in system.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg-soft/40 border-b border-brand-border/60">
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">User Email</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Plan Purchased</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Amount Paid</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Razorpay Order / Payment ID</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Status</th>
                      <th className="p-5 text-[9px] uppercase tracking-widest font-bold text-brand-dark/75">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30 text-xs">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-brand-bg-soft/10">
                        <td className="p-5 font-semibold text-brand-dark font-mono">{ord.user_email}</td>
                        <td className="p-5 font-medium text-brand-dark">{ord.plan_name}</td>
                        <td className="p-5 text-brand-text font-bold">₹{(ord.amount_inr / 100.0).toFixed(2)}</td>
                        <td className="p-5 text-brand-text-muted font-mono space-y-0.5">
                          <p>O: {ord.razorpay_order_id || "—"}</p>
                          <p>P: {ord.razorpay_payment_id || "—"}</p>
                        </td>
                        <td className="p-5">
                          {ord.status === "paid" ? (
                            <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Paid</span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">Pending</span>
                          )}
                        </td>
                        <td className="p-5 text-brand-text-muted">
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
