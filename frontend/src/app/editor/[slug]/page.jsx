"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditorPage() {
  const { slug } = useParams();

  const [activeTab, setActiveTab] = useState("content");
  const [invitationData, setInvitationData] = useState({
    groom: "Rahul",
    bride: "Priya",
    date: "2026-11-15",
    time: "18:00",
    venueName: "Grand Palace resort",
    venueAddress: "Bypass road, Mumbai, MH",
    bgColor: "#FAF9F6",
    primaryColor: "#B59410",
    musicEnabled: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInvitationData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-zinc-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-550 hover:text-zinc-950 transition">
            ← Dashboard
          </Link>
          <span className="h-5 w-px bg-zinc-200"></span>
          <span className="text-zinc-500 text-sm">Editing Invitation</span>
        </div>
        <button
          onClick={() => alert("Changes saved successfully!")}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded-xl text-sm transition"
        >
          Save & Publish
        </button>
      </header>

      {/* Editor & Preview Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side — Settings Panel */}
        <aside className="w-full md:w-105 bg-white border-r border-zinc-200 flex flex-col">
          <nav className="flex border-b border-zinc-100 text-sm">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-4 text-center font-semibold border-b-2 ${
                activeTab === "content" ? "border-zinc-900 text-zinc-950" : "border-transparent text-zinc-500"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`flex-1 py-4 text-center font-semibold border-b-2 ${
                activeTab === "design" ? "border-zinc-900 text-zinc-950" : "border-transparent text-zinc-500"
              }`}
            >
              Design
            </button>
          </nav>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === "content" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Groom's Name</label>
                  <input
                    type="text"
                    name="groom"
                    value={invitationData.groom}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Bride's Name</label>
                  <input
                    type="text"
                    name="bride"
                    value={invitationData.bride}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Event Date</label>
                    <input
                      type="date"
                      name="date"
                      value={invitationData.date}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Start Time</label>
                    <input
                      type="time"
                      name="time"
                      value={invitationData.time}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Venue Name</label>
                  <input
                    type="text"
                    name="venueName"
                    value={invitationData.venueName}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Venue Address</label>
                  <textarea
                    name="venueAddress"
                    value={invitationData.venueAddress}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === "design" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Theme Background Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      name="bgColor"
                      value={invitationData.bgColor}
                      onChange={handleInputChange}
                      className="w-10 h-10 border border-zinc-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-zinc-600 text-sm font-medium">{invitationData.bgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Accent Brand Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      name="primaryColor"
                      value={invitationData.primaryColor}
                      onChange={handleInputChange}
                      className="w-10 h-10 border border-zinc-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-zinc-600 text-sm font-medium">{invitationData.primaryColor}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-6">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Background Music</h4>
                    <p className="text-xs text-zinc-500">Enable default audio track auto-play.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="musicEnabled"
                    checked={invitationData.musicEnabled}
                    onChange={handleInputChange}
                    className="h-5 w-5 border-zinc-300 rounded text-zinc-900 focus:ring-zinc-900"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Side — Interactive Live Preview Mock */}
        <main className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
          <div
            className="w-full max-w-90 h-160 rounded-[40px] shadow-2xl border-12 border-zinc-950 overflow-hidden flex flex-col justify-between p-6 relative transition-colors duration-300"
            style={{ backgroundColor: invitationData.bgColor }}
          >
            <div className="text-center mt-12">
              <span className="text-xs uppercase tracking-widest text-zinc-400">Save the date for</span>
              <h2 className="text-3xl font-extrabold mt-4 mb-2" style={{ color: invitationData.primaryColor }}>
                {invitationData.groom}
              </h2>
              <span className="text-lg text-zinc-450">&</span>
              <h2 className="text-3xl font-extrabold mt-2 mb-8" style={{ color: invitationData.primaryColor }}>
                {invitationData.bride}
              </h2>
              <div className="inline-block border-t border-b border-zinc-300 py-2 px-6 text-sm font-semibold tracking-wider text-zinc-650">
                {invitationData.date}
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Venue</div>
              <div className="font-bold text-zinc-800 text-sm">{invitationData.venueName}</div>
              <div className="text-xs text-zinc-500 mt-1 max-w-50 mx-auto">{invitationData.venueAddress}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
