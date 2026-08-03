"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TemplateDemoPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-550 flex flex-col justify-between p-8 font-sans">
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full">
        <Link href="/templates" className="text-sm font-medium hover:text-white transition">
          ← Back to Gallery
        </Link>
        <span className="text-xs uppercase tracking-widest text-zinc-500">Live Interactive Preview</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto my-16">
        <div className="bg-linear-to-tr from-amber-500/10 to-indigo-500/10 border border-zinc-800 rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-4 uppercase tracking-wider">
            {slug ? slug.replace("-", " ") : "Demo Invitation"}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            This is where the fully animated template runtime runs. It loads the customized invitation tokens (fonts, colors, background music) and drives them using GSAP and Framer Motion.
          </p>
          <div className="text-xs text-zinc-500 border-t border-zinc-900 pt-4">
            Viewing Template: <code className="text-zinc-350">{slug}</code>
          </div>
        </div>

        <Link
          href={`/editor/${slug}`}
          className="bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-3 px-8 rounded-2xl text-sm tracking-wide transition shadow-lg"
        >
          Select & Customize This Design
        </Link>
      </main>

      <footer className="text-center text-xs text-zinc-650 max-w-4xl mx-auto w-full border-t border-zinc-900 pt-6">
        Cardessa Wedding Invitation Platform
      </footer>
    </div>
  );
}
