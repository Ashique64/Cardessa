"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState(null); // 'yes' | 'no' | null
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);
  const [showAuthMessageModal, setShowAuthMessageModal] = useState(false);
  const heroRef = useRef(null);

  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    fetch(`${API}/templates/`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        setFeaturedTemplates(list.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  const handleUseDesign = async (slug) => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const tplRes = await fetch(`${API}/templates/${slug}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tplRes.ok) {
        const tpl = await tplRes.json();
        const createRes = await fetch(`${API}/invitations/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            template: tpl.id,
            content: tpl.demo_content || {},
            event_date: tpl.demo_content?.event_date || null
          })
        });
        if (createRes.ok) {
          const newInvite = await createRes.json();
          router.push(`/editor/${newInvite.slug}`);
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    // Register ScrollTrigger client-side only
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // GSAP Split-type Headline Entrance
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-title-word",
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
        }
      );

      gsap.fromTo(
        ".hero-fade-in",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: "power3.out" }
      );

      // Parallax effect for phone mockup in Hero
      gsap.to(".gsap-hero-mockup", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ".gsap-hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Staggered reveal for cards in "How it works"
      gsap.fromTo(
        ".gsap-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-card-container",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Section animations for Why Go Digital
      gsap.fromTo(
        ".why-digital-left",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".why-digital-section",
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".why-digital-right-item",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".why-digital-section",
            start: "top 75%",
          },
        }
      );

      // Section animations for Pricing Plans
      gsap.fromTo(
        ".gsap-pricing-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-pricing-section",
            start: "top 75%",
          },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleCreateInvitationClick = (e) => {
    e.preventDefault();
    if (user) {
      setShowAuthMessageModal(true);
    } else {
      router.push("/login");
    }
  };

  return (
    <div ref={heroRef} className="min-h-screen bg-brand-bg text-brand-text font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="gsap-hero-section relative pt-40 pb-24 md:py-48 min-h-screen flex items-center px-6 border-b border-brand-border/40 overflow-hidden">
        {/* Background elegant circles/blur with parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 gsap-hero-mockup">
          <div className="absolute top-1/4 left-1/4 w-100 h-100 rounded-full bg-brand-bg-soft filter blur-3xl opacity-60 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-75 h-75 rounded-full bg-brand-accent/5 filter blur-3xl opacity-60" />
        </div>

        <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-8 relative text-center">
          {/* Elegant Fine Art Border Frame */}
          <div className="absolute -inset-6 sm:-inset-10 border border-brand-accent/15 rounded-3xl pointer-events-none -z-10" />
          <div className="absolute -inset-8 sm:-inset-14 border border-brand-accent/10 rounded-[36px] pointer-events-none -z-10" />
          
          {/* Gold Monogram ornament at top */}
          <div className="flex flex-col items-center animate-fade-in select-none">
            <div className="w-16 h-16 border border-brand-accent/30 rounded-full flex items-center justify-center bg-brand-bg shadow-xs relative">
              <span className="font-serif text-2xl font-extralight tracking-widest text-brand-accent">C</span>
            </div>
            <div className="w-px h-6 bg-brand-accent/30 mt-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/40 mt-1" />
          </div>

          <div className="inline-flex items-center gap-2 bg-brand-bg-soft border border-brand-accent/20 rounded-full px-4.5 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-accent">
            ✨ The Fine Art of Celebration
          </div>
          
          <div className="overflow-hidden">
            <h1 className="font-serif text-5xl sm:text-8xl font-light text-brand-dark tracking-tight leading-[1.05] max-w-3xl mx-auto">
              <span className="block hero-title-word">The Art of Modern</span>
              <span className="block hero-title-word italic font-normal text-brand-accent mt-2">
                Invitations
              </span>
            </h1>
          </div>

          <p className="hero-fade-in text-base sm:text-xl text-brand-text-muted leading-relaxed max-w-2xl mx-auto font-light">
            Say goodbye to traditional paper. Design gorgeous, fully animated mobile wedding invitations with custom music, countdowns, direction maps, and live RSVP tracking. 
            <span className="block text-brand-dark mt-3 font-medium">Edit your details anytime — even after sharing.</span>
          </p>

          <div className="hero-fade-in flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Link
              href="/templates"
              className="w-full sm:w-auto bg-brand-dark hover:bg-brand-accent text-brand-bg font-bold py-4 px-10 rounded-lg text-xs uppercase tracking-widest transition-colors duration-300 text-center shadow-md hover:shadow-lg"
            >
              Browse Designs
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto bg-transparent border border-brand-dark/20 hover:border-brand-dark hover:bg-brand-bg-soft text-brand-dark font-bold py-4 px-10 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 text-center"
            >
              How it works
            </Link>
          </div>

          {/* Premium Mini Features Dock (Centered Row) */}
          <div className="hero-fade-in pt-12 max-w-3xl mx-auto">
            <div className="h-px bg-linear-to-r from-transparent via-brand-border to-transparent" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 text-center">
              <div className="space-y-1">
                <span className="block text-lg">🎵</span>
                <span className="block text-[10px] uppercase tracking-widest font-bold text-brand-dark">Ambient Music</span>
              </div>
              <div className="space-y-1">
                <span className="block text-lg">📍</span>
                <span className="block text-[10px] uppercase tracking-widest font-bold text-brand-dark">GPS Maps</span>
              </div>
              <div className="space-y-1">
                <span className="block text-lg">📅</span>
                <span className="block text-[10px] uppercase tracking-widest font-bold text-brand-dark">Countdowns</span>
              </div>
              <div className="space-y-1">
                <span className="block text-lg">✍️</span>
                <span className="block text-[10px] uppercase tracking-widest font-bold text-brand-dark">Guest Book</span>
              </div>
            </div>
            <div className="h-px bg-linear-to-r from-transparent via-brand-border to-transparent" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 px-6 border-b border-brand-border/40 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-20 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2.5 block">Process</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-brand-dark tracking-tight">
              Crafted in Three <span className="italic font-normal">Simple Steps</span>
            </h2>
            <div className="h-0.5 w-16 bg-brand-accent mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gsap-card-container">
            {[
              {
                num: "01",
                title: "Select a Design",
                desc: "Choose from our catalog of designer templates crafted by professional typographers and visual artists.",
                icon: "🎨",
              },
              {
                num: "02",
                title: "Personalize Details",
                desc: "Add your schedules, RSVP forms, digital countdown timers, maps, and upload background music.",
                icon: "✍️",
              },
              {
                num: "03",
                title: "Share instantly",
                desc: "Send a stunning live link via WhatsApp or email. Guests can view, RSVP, and navigate instantly.",
                icon: "✨",
              },
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="gsap-card bg-brand-bg-soft/40 border border-brand-border/60 rounded-xl p-8 space-y-6 relative overflow-hidden transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Accent Background light blur hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full filter blur-xl translate-x-8 -translate-y-8" />
                
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 bg-brand-bg rounded-lg border border-brand-border flex items-center justify-center text-xl shadow-xs">
                    {step.icon}
                  </div>
                  <span className="font-serif text-3xl font-extralight text-brand-accent/40 tracking-wider">
                    {step.num}
                  </span>
                </div>
                
                <h4 className="font-serif text-xl font-medium text-brand-dark">
                  {step.title}
                </h4>
                
                <p className="text-sm text-brand-text-muted leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Why Go Digital Section */}
      <section className="why-digital-section py-24 md:py-32 px-6 bg-brand-bg-soft/20 border-b border-brand-border/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Block */}
          <div className="lg:col-span-5 space-y-6 why-digital-left">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2.5 block">Advantages</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-brand-dark tracking-tight leading-tight">
              Why Choose <br />
              <span className="italic font-normal text-brand-accent">Digital Over Paper?</span>
            </h2>
            <div className="h-0.5 w-16 bg-brand-accent mt-4 mb-6" />
            <p className="text-brand-text-muted leading-relaxed text-sm sm:text-base">
              Cardessa merges modern web development with high-end designer wedding layouts. Say goodbye to envelope stuffing, mailing errors, and unreadable maps.
            </p>
            <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-xs space-y-2">
              <span className="font-serif text-3xl font-bold text-brand-accent">100%</span>
              <p className="text-xs font-semibold text-brand-dark uppercase tracking-wide">
                Sustainable Digital Canvas
              </p>
              <p className="text-xs text-brand-text-muted">
                Eliminate printing overhead, paper waste, and postage fees. Share your card instantly with zero carbon footprint.
              </p>
            </div>
          </div>

          {/* Right Block */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                title: "Ambient Music",
                desc: "Add a classical violin performance or romantic instrumental to automatically play as guests open your card.",
                icon: "🎵",
              },
              {
                title: "Live GPS Navigation",
                desc: "Integrate Apple Maps, Google Maps, and Waze directly so out-of-town guests locate your venue effortlessly.",
                icon: "📍",
              },
              {
                title: "Real-time Updates",
                desc: "Spotted a typo? Shifted timing? Update details directly in our editor and the live URL syncs instantly.",
                icon: "✏️",
              },
              {
                title: "Eco-Friendly & Swift",
                desc: "Zero printing delays, zero postage cost, zero carbon footprint. Deliver invites in seconds via WhatsApp.",
                icon: "🌱",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="why-digital-right-item bg-brand-bg border border-brand-border/60 hover:border-brand-accent/40 rounded-xl p-6 space-y-4 transition-colors duration-300"
              >
                <div className="h-10 w-10 bg-brand-bg-soft rounded-lg border border-brand-border flex items-center justify-center text-lg font-bold">
                  {feat.icon}
                </div>
                <h4 className="font-serif text-lg font-medium text-brand-dark">
                  {feat.title}
                </h4>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Designs Section */}
      <section className="py-24 md:py-32 px-6 border-b border-brand-border/40 bg-brand-bg-soft/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2.5 block">Collection</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-brand-dark tracking-tight">
              Our Featured <span className="italic font-normal">Invitation Designs</span>
            </h2>
            <div className="h-0.5 w-16 bg-brand-accent mx-auto mt-4" />
            <p className="text-sm text-brand-text-muted mt-4">
              Select a luxury mobile template. Personalize and preview for free, and unlock for a one-time fee when you are ready to share.
            </p>
          </div>

          {loadingTemplates ? (
            <div className="flex justify-center items-center py-12 gap-2">
              <div className="h-5 w-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-brand-text-muted">Loading designs...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTemplates.map((tpl) => (
                <motion.div
                  key={tpl.slug}
                  whileHover={{ y: -8 }}
                  className="bg-brand-bg border border-brand-border/60 rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-lg transition-all duration-300"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-brand-bg-soft border border-brand-border/60 px-2 py-0.5 rounded text-brand-text-muted">
                        {tpl.price_inr === 0 ? "Free" : `₹${tpl.price_inr}`}
                      </span>
                      {tpl.is_new && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-brand-accent/20 border border-brand-accent/30 px-2 py-0.5 rounded text-brand-accent">
                          New
                        </span>
                      )}
                    </div>
                    
                    <div className="h-48 w-full bg-brand-bg-soft rounded-xl border border-brand-border flex items-center justify-center overflow-hidden mb-6 relative">
                      {tpl.thumbnail ? (
                        <img src={tpl.thumbnail} alt={tpl.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl">🎴</span>
                      )}
                    </div>

                    <h3 className="font-serif text-2xl font-light text-brand-dark mb-2">{tpl.name}</h3>
                    <p className="text-xs text-brand-text-muted leading-relaxed line-clamp-3 mb-6">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link
                      href={`/templates/${tpl.slug}`}
                      className="flex-1 text-center bg-brand-bg-soft hover:bg-brand-dark hover:text-white border border-brand-border text-brand-dark py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => handleUseDesign(tpl.slug)}
                      className="flex-1 text-center bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-brand-dark py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                    >
                      Use Design
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-12">
            <Link
              href="/templates"
              className="bg-transparent border border-brand-dark hover:bg-brand-dark hover:text-brand-bg text-brand-dark font-bold py-4 px-10 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 text-center"
            >
              View All Designs
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 md:py-36 px-6 bg-brand-dark text-[#FCFAF6] relative overflow-hidden">
        {/* Abstract background details */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 border border-brand-border/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 border border-brand-border/10 rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent block">Get Started</span>
          <h2 className="font-serif text-5xl sm:text-7xl font-light tracking-tight leading-tight">
            Craft a Love Story <br />
            <span className="italic font-normal text-brand-accent">Worth Sharing</span>
          </h2>
          <p className="text-brand-bg-soft/75 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Begin custom designing your digital invitation. Select a luxury theme, enter your event schedule, and launch in less than 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleCreateInvitationClick}
              className="w-full sm:w-auto bg-brand-accent border border-brand-accent hover:bg-transparent hover:text-brand-accent text-brand-dark font-bold py-4 px-10 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 text-center cursor-pointer font-sans"
            >
              Create Your Invitation
            </button>
            <Link
              href="/templates"
              className="w-full sm:w-auto bg-transparent border border-brand-bg-soft/20 hover:bg-brand-bg-soft hover:text-brand-dark text-brand-bg font-bold py-4 px-10 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 text-center"
            >
              Explore Templates
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <AnimatePresence>
        {showAuthMessageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FCFAF6] border border-brand-accent/30 rounded-3xl max-w-sm w-full p-8 shadow-2xl space-y-6 text-center text-brand-dark"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center text-brand-accent text-lg">✨</div>
                <h3 className="font-serif text-xl font-light">Active Session</h3>
              </div>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                You are already logged in to Cardessa! Head to your dashboard to manage your invitations or create a new design.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setShowAuthMessageModal(false)}
                  className="text-xs uppercase tracking-wider font-bold text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAuthMessageModal(false);
                    router.push("/dashboard");
                  }}
                  className="bg-brand-dark hover:bg-brand-accent text-white hover:text-brand-dark px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
