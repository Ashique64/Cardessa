# Cardessa — Phase-by-Phase Development Plan

> **Platform:** Digital Wedding Invitation Platform (Live Web App Only)
> **Stack:** Next.js + Django REST Framework + PostgreSQL + DigitalOcean + Vercel + Razorpay

---

## Overview

```
Phase 1  →  MVP Core (5–8 weeks)
Phase 2  →  Template & Language Expansion (4–6 weeks)
Phase 3  →  Agency Tier & Custom Domains (4–5 weeks)
Phase 4  →  Template Marketplace (4–6 weeks)
```

---

## Phase 1 — MVP Core

> **Goal:** Paying users can purchase a plan, build an invitation using an editor, and share it as a live link.
> **Timeline:** 5–8 weeks

---

### 1.1 Project Setup & Infrastructure

**Backend (DigitalOcean)**
- [ ] Initialize Django project with Django REST Framework
- [ ] Set up `dj-rest-auth` for user authentication (register, login, logout, password reset)
- [ ] Configure PostgreSQL database (DigitalOcean Managed PostgreSQL)
- [ ] Configure DigitalOcean Spaces (S3-compatible) for media storage — photos, music files, OG preview images
- [ ] Set up Django admin panel (will serve as the internal management dashboard)
- [ ] Add CORS headers (`django-cors-headers`) to allow requests from the Next.js frontend
- [ ] Create `.env` config for all secrets (DB credentials, Spaces keys, Razorpay keys)
- [ ] Deploy Django app to DigitalOcean App Platform (initial staging deployment)

**Frontend (Vercel)**
- [ ] Initialize Next.js project (App Router)
- [ ] Set up Tailwind CSS with a global design token system (CSS variables for colors, fonts, spacing)
- [ ] Install GSAP + `@gsap/react`, Framer Motion
- [ ] Configure environment variables (API base URL)
- [ ] Deploy to Vercel (initial staging deployment)
- [ ] Set up API client (e.g., `axios` instance with base URL + auth token interceptors)

---

### 1.2 Data Models (Django)

| Model | Key Fields |
|---|---|
| `User` | email, name, created_at (extends Django's default) |
| `Plan` | name, price_inr, billing_type (one_time / yearly), max_invitations, features JSON |
| `Order` | user, plan, razorpay_order_id, razorpay_payment_id, status, created_at |
| `Template` | name, slug, tier (standard / premium), preview_url, thumbnail, animation_config JSON, is_active |
| `Invitation` | user, template, slug (unique shareable ID), config JSON, event_date, is_published, created_at, updated_at |

---

### 1.3 Backend APIs

**Auth**
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/auth/password/reset/`

**Templates**
- `GET /api/templates/` — list all active templates (with tier, thumbnail, animation_config)
- `GET /api/templates/<slug>/` — single template detail

**Invitations**
- `POST /api/invitations/` — create new invitation (requires active order)
- `GET /api/invitations/<slug>/` — **public endpoint** (no auth) — returns config JSON for guest rendering
- `PATCH /api/invitations/<slug>/` — update invitation config (auth required, owner only)
- `DELETE /api/invitations/<slug>/` — delete invitation

**Orders & Payments (Razorpay)**
- `POST /api/orders/create/` — create Razorpay order, store pending order in DB
- `POST /api/orders/verify/` — verify Razorpay payment signature, activate order
- `POST /api/payments/webhook/` — Razorpay webhook handler (fallback payment confirmation)

**Media Upload**
- `POST /api/media/upload/` — upload photo or music file to DigitalOcean Spaces, return CDN URL
---

### 1.4 Frontend — Pages & Routes

| Route | Description |
|---|---|
| `/` | Marketing/landing page |
| `/templates` | Template gallery with live demo previews |
| `/templates/[slug]` | Template demo (full-screen interactive preview) |
| `/pricing` | Pricing page (Standard / Premium / Planner) |
| `/checkout` | Plan selection → Razorpay payment |
| `/dashboard` | User's invitations list |
| `/editor/[slug]` | Invitation editor |
| `/i/[slug]` | **Public guest-facing invitation page** |
| `/login` | Login page |
| `/register` | Register page |

---

### 1.5 Invitation Editor

The editor is the core product interaction. Build it as a side-panel + live-preview layout:

**Editor Panels**
- [ ] **Design tab** — color palette picker (primary, accent, background), font family selector
- [ ] **Content tab** — couple names, event date/time, venue name + address, personal message
- [ ] **Photos tab** — hero image upload, gallery image uploads (multi-upload to Spaces)
- [ ] **Music tab** — audio file upload or link, mute-by-default toggle
- [ ] **Sections tab** — toggle visibility of: countdown, map, gallery, music player
- [ ] **Save / Publish buttons** — auto-save draft, manual publish to make link live

**Live Preview**
- [ ] Split-screen or overlay preview that re-renders the invitation in real time as the user edits
- [ ] Mobile / desktop viewport toggle in preview

---

### 1.6 Templates (3–4 for MVP)

Build 3–4 initial templates. Each template is a Next.js React component that reads from the invitation's `config` JSON and applies the template's `animation_config`.

**Suggested MVP Templates**

| Template Name | Style | Animations |
|---|---|---|
| **Ivory Bloom** | Elegant minimalist, off-white + gold | Kinetic typography (hero), scroll stagger reveals, gradient mesh background |
| **Midnight Luxe** | Dark luxury, deep navy + rose gold | Parallax depth layers, animated SVG monogram draw, 3D tilt gallery cards |
| **Modern Script** | Clean contemporary, sans-serif | Marquee ticker text header, scroll-linked mask reveal, magnetic hover buttons |
| **Royal Garden** | Traditional ornate, floral motifs | Particle floating petals (soft, low-density), cursor-follow glow, smooth section transitions |

**Per Template, Build**
- [ ] Hero section (couple names, date — kinetic or reveal animation)
- [ ] Countdown timer widget
- [ ] Venue + Google Maps embed section
- [ ] Photo gallery / slideshow section
- [ ] Music player (floating, with mute toggle)
- [ ] Footer

---

### 1.7 Guest-Facing Invitation Page (`/i/[slug]`)

- [ ] Fetches invitation config JSON from `GET /api/invitations/<slug>/` at build time (ISR) or on request (SSR)
- [ ] Renders the correct template component with the config data
- [ ] Animations initialize on page load / scroll
- [ ] OG meta tags populated dynamically (couple names, date, photo) for WhatsApp/social link previews
- [ ] Mobile-first responsive layout

---

### 1.8 Payment Flow (Razorpay)

```
User selects plan (Pricing page)
       ↓
POST /api/orders/create/ → returns Razorpay order ID
       ↓
Razorpay JS SDK opens payment modal
       ↓
Payment success → POST /api/orders/verify/ (signature verification)
       ↓
Order activated → User redirected to editor to create invitation
       ↓
Razorpay webhook (POST /api/payments/webhook/) → backup confirmation
```

---

### 1.9 Phase 1 Deliverables Checklist

- [ ] User can register, log in, reset password
- [ ] User can browse the template gallery and see live interactive demos
- [ ] User can purchase Standard or Premium plan via Razorpay (UPI, cards, wallets)
- [ ] User can create and edit an invitation using the editor
- [ ] User can upload photos and music
- [ ] User can publish the invitation and share the live link (`/i/[slug]`)
- [ ] Guests can view the invitation page with full animations
- [ ] Django admin panel is functional (manage templates, view orders)
- [ ] Both frontend (Vercel) and backend (DigitalOcean) deployed and connected

---

## Phase 2 — Template & Language Expansion

> **Goal:** Expand template library, add multi-language guest toggle, and custom subdomain support.
> **Timeline:** 4–6 weeks (after Phase 1 is stable)

---

### 2.1 Template Expansion (6–10 Total)

- [ ] Design and build 3–6 additional templates
- [ ] Introduce a **template tag system** in Django admin (style tags: minimalist, royal, bohemian, modern, traditional)
- [ ] Add filter/sort UI to template gallery (by style, by tier)
- [ ] Implement **template switching** in the editor — allow user to swap template without losing their content config

---

### 2.2 Multi-Language Guest Toggle

Allow the couple to add a secondary language. Guests see a toggle on the invitation (e.g., English / Hindi / Tamil).

- [ ] Add `translations` object to the invitation `config` JSON schema
  ```json
  "translations": {
    "en": { "greeting": "Together with their families...", "venue": "Grand Palace, Mumbai" },
    "hi": { "greeting": "अपने परिवारों के साथ...", "venue": "ग्रैंड पैलेस, मुंबई" }
  }
  ```
- [ ] Add language editor tab in the invitation editor (primary language + optional secondary)
- [ ] Implement language toggle button on guest-facing invitation page (animated smooth transition)
- [ ] Store selected language preference in `localStorage` so the toggle persists across page refreshes

---

### 2.3 Custom Subdomain Support (Premium Plan)

Allow Premium users to use a custom subdomain like `rahul-priya.cardessa.in` instead of `cardessa.in/i/xyz123`.

- [ ] Add `custom_subdomain` field to the `Invitation` model
- [ ] Add subdomain input + availability check in the editor (Premium only, gated behind plan check)
- [ ] Backend API: `POST /api/invitations/<slug>/subdomain/` — validate and assign subdomain
- [ ] Configure Next.js middleware to resolve requests by subdomain → correct invitation slug
- [ ] Wildcard DNS record setup on Vercel (`*.cardessa.in → Vercel`)
- [ ] Display subdomain link in dashboard alongside the default `/i/[slug]` link

---

### 2.4 Phase 2 Deliverables Checklist

- [ ] 6–10 templates available in the gallery
- [ ] Template filtering and switching work in editor
- [ ] Couples can add a second language; guests can toggle between languages on the invitation
- [ ] Premium users can set and use a custom subdomain (`name.cardessa.in`)

---

## Phase 3 — Agency Tier & Custom Domains

> **Goal:** Launch the Planner/Agency subscription tier with white-label, multi-invitation management, and custom domain support.
> **Timeline:** 4–5 weeks

---

### 3.1 Planner / Agency Subscription (₹9,999/year)

- [ ] Add `Subscription` model: links user to a yearly plan, tracks renewal date
- [ ] Implement Razorpay subscription billing (auto-renewal) or annual one-time payment with renewal reminder
- [ ] Planner dashboard — separate view for managing multiple client invitations
- [ ] Increase invitation limit (multiple per subscription)
- [ ] Add **client management** — planner can create invitations on behalf of clients, group by client name

---

### 3.2 White-Label Mode

Allow agency users to remove Cardessa branding from guest-facing invitation pages.

- [ ] Add `white_label` boolean to `Order` / entitlement check
- [ ] Conditionally hide "Made with Cardessa" footer badge on invitation pages for white-label users
- [ ] Django admin toggle per order/user

---

### 3.3 Custom Domain Connection (₹999/year add-on)

Allow any user (Standard or Premium) to connect their own domain (e.g., `invite.theirweddingsite.com`).

- [ ] Add `custom_domain` field to `Invitation` model
- [ ] Domain verification flow: user adds a CNAME DNS record pointing to Vercel, then verifies via API
  - `POST /api/invitations/<slug>/domain/` — initiate domain connection
  - `GET /api/invitations/<slug>/domain/status/` — check DNS propagation / verification status
- [ ] Use Vercel Domains API to programmatically add the custom domain to the project
- [ ] Auto-provision SSL via Vercel (handled automatically once domain is verified)
- [ ] Charge ₹999/year via Razorpay at domain connection step

---

### 3.4 AI Invitation Text Writer

An AI-powered text helper that generates invitation copy from a short brief.

- [ ] Integrate OpenAI API (or Google Gemini API) on the Django backend
- [ ] Add "Write with AI" button in the Content tab of the editor
- [ ] User inputs brief details (style: formal/fun, language, tone, key names)
- [ ] Backend sends prompt to AI API, returns suggested text (greeting, body)
- [ ] User can accept, regenerate, or manually edit the suggestion
- [ ] Gate this feature behind Premium plan

---

### 3.5 Phase 3 Deliverables Checklist

- [ ] Planner/Agency plan purchasable and functional (yearly billing)
- [ ] Planners can manage multiple client invitations from a single dashboard
- [ ] White-label removes Cardessa branding for agency users
- [ ] Any user can connect a custom domain (with CNAME flow + SSL auto-provisioned)
- [ ] AI text writer works in the editor (Premium feature)

---

## Phase 4 — Template Marketplace

> **Goal:** Allow third-party designers to submit and sell templates, with a 70/30 revenue split.
> **Timeline:** 4–6 weeks

---

### 4.1 Designer Onboarding

- [ ] Designer registration flow — separate signup track, `Designer` profile model
- [ ] Designer agreement / terms acceptance during signup
- [ ] Django admin approval queue — admin reviews and approves or rejects submitted templates
- [ ] Designer dashboard — track template submission status, earnings, payout requests

---

### 4.2 Template Submission System

- [ ] Template submission form in the designer portal:
  - Template name, style tags, tier (standard/premium), thumbnail upload
  - Animation config JSON (defines which animation presets to use)
  - Template Next.js component (packaged/uploaded as a zip or submitted via Git repo link for review)
- [ ] Staging preview — admin can preview the submitted template in the live platform before approving
- [ ] Approval → template appears in the public gallery

---

### 4.3 Revenue Split & Payouts

- [ ] Track which orders include a marketplace template (via `template.designer` FK)
- [ ] Revenue attribution: 70% to designer, 30% to Cardessa
- [ ] Monthly payout calculation job (Django management command / scheduled task)
- [ ] Payout method: Razorpay Payouts API or manual bank transfer (choose based on volume)
- [ ] Designer payout history visible in designer dashboard

---

### 4.4 Phase 4 Deliverables Checklist

- [ ] Designers can register, submit templates, and track their status
- [ ] Admin can review, preview, approve, and publish marketplace templates
- [ ] Marketplace templates appear in the gallery with designer attribution
- [ ] Revenue split is tracked per order and payouts are processed monthly

---

## Cross-Phase: Ongoing Tasks

These tasks run throughout all phases and should be part of every sprint:

| Area | Task |
|---|---|
| **Testing** | Write tests for all new API endpoints (Django `TestCase` / `pytest`) |
| **Security** | Review auth on every new endpoint; sanitize all user-uploaded content |
| **Performance** | Optimize invitation page load (ISR caching, Spaces CDN URLs, lazy-load images) |
| **Mobile QA** | Test every new template and editor feature on mobile viewport (WhatsApp open simulation) |
| **Admin Panel** | Keep Django admin up to date as new models are added |
| **Monitoring** | Set up error tracking (Sentry) and uptime monitoring from Phase 1 |
| **OG Previews** | Ensure every invitation generates proper og:image, og:title, og:description for WhatsApp link previews |

---

## Tech Stack Reference

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS | Vercel |
| Animations | GSAP (ScrollTrigger) + Framer Motion | — |
| Backend API | Django + Django REST Framework | DigitalOcean App Platform |
| Database | PostgreSQL | DigitalOcean Managed PostgreSQL |
| Media Storage | DigitalOcean Spaces (S3-compatible) | DigitalOcean |
| Payments | Razorpay (UPI, cards, wallets, subscriptions) | — |
| AI Text | OpenAI / Google Gemini API (Phase 3) | — |
| Auth | `dj-rest-auth` + JWT tokens | — |

---

## Open Decisions (Resolve Before Starting Phase 1)

> Answer these before writing any data model code — they affect the schema.

1. **Event types at launch** — Wedding-only at launch, or multi-event (engagement, birthday, etc.) from day one? This affects template categorization and the template data model.

2. **Custom domain priority** — Custom domain support involves DNS + Vercel API automation. If this is a high-priority feature, scope the Vercel Domains API integration during Phase 1 setup rather than retrofitting in Phase 3.
