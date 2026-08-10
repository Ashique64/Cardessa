# Cardessa — Phase-by-Phase Development Plan

> **Platform:** Digital Wedding Invitation Platform (Live Web App Only)
> **Stack:** Next.js + Django REST Framework + PostgreSQL + DigitalOcean + Vercel + Razorpay
> **Pricing Model:** Transaction-based Template Purchases (One-Time Layout Unlock, Free/Premium Templates)

---

## Overview

```
Phase 1    →  MVP Core & RSVP Foundation (4–6 weeks)
Phase 1.5  →  Dynamic Multi-Template Engine (2–3 weeks)
Phase 2    →  RSVP Dashboard, Filters & Exports (3–4 weeks)
Phase 3    →  Agency / White-Label Tier & Domains (3–4 weeks)
```

---

## Phase 1 — MVP Core & RSVP Foundation

> **Goal:** Admins can create and manage templates via Django Admin. Logged-in users can select active templates, customize them, collect RSVPs, and share live invitation links.

---

### 1.1 Project Setup & Infrastructure

**Backend (DigitalOcean)**
- [x] Initialize Django project with Django REST Framework
- [x] Set up `dj-rest-auth` for user authentication (register, login, logout, role management)
- [x] Configure PostgreSQL database
- [ ] Configure DigitalOcean Spaces (S3-compatible) for guest media uploads (couple photos, gallery, music)
- [x] Set up Django Admin Panel as the superuser/admin dashboard to create templates
- [x] Add CORS headers to support requests from the Next.js frontend

**Frontend (Vercel)**
- [x] Initialize Next.js project (App Router)
- [x] Set up Tailwind CSS with a global design token system (Sage/Pista theme)
- [x] Install Framer Motion, GSAP, Canvas support
- [x] Set up API client with axios and token storage interceptors
- [x] Implement AuthContext and login/register pages with custom validation
- [x] Add browser back-button auth guards to `/login` and `/register` pages

---

### 1.2 Data Models (Django) — original shape

| Model | Key Fields | Description |
|---|---|---|
| `User` | email, name, is_superuser, is_staff, created_at | Core User identity with admin capability flags |
| `Template` | name, slug, component_key, price_inr, is_new, description, field_schema, demo_content, is_active | Individual template pricing/metadata (999 INR default, is_new tag) |
| `Invitation` | user, template, slug (unique preview ID), content JSON, is_paid, is_published | Draft customizations and is_paid unlock tracking |
| `RSVP` | invitation, guest_name, email, phone, status (Attending / Declined), guest_count, message, created_at | Saved when guests respond on the live invitation |
| `Plan` | name, price_inr, billing_type, max_invitations, features JSON | Billing configurations (legacy support) |
| `Order` | user, invitation, plan (nullable), razorpay_order_id, razorpay_payment_id, status, amount_inr, created_at | Tracks payment unlocks for specific invitations |

---

### 1.3 Backend APIs

**Auth & Users**
- [x] `POST /api/auth/register/` — register new user
- [x] `POST /api/auth/login/` — returns access, refresh, user roles
- [x] `GET /api/auth/user/` — fetch active profile details

**Admin Templates Management**
- [x] `GET /api/templates/` — lists only **active** templates created by admins (Public)

**Invitations & Customization**
- [x] `POST /api/invitations/` — create invitation (requires plan validation check)
- [x] `GET /api/invitations/<slug>/` — fetch full invitation details for rendering (Public)
- [x] `PATCH /api/invitations/<slug>/` — update text, colors, music settings (Owner only)

**RSVP Guest Responses**
- [x] `POST /api/invitations/<slug>/rsvp/` — allows guests to submit RSVP form (Public)

---

### 1.4 Frontend — Pages & Routes

| Route | Description | Gated? |
|---|---|---|
| `/` | Marketing & landing page | No |
| `/login` | Login page (Credentials only, no Google Auth) | No |
| `/register` | Sign-up page with check-toggles | No |
| `/templates` | Gallery showing active templates with price tags and price filters | No |
| `/templates/[slug]` | Interactive preview demo (Wax seal, Scratch Date, Map) | No |
| `/how-it-works` | Explains the 4-step wizard process (replaces pricing) | No |
| `/dashboard` | User dashboard (Divided into Edited Drafts vs Purchased Active tabs) | Gated (auth required) |
| `/editor/[slug]` | Step-by-step 4-step wizard editor with real-time phone preview | Gated (auth required) |
| `/i/[slug]` | **Public invitation page** with waxy seal cover & RSVP form | No |
| `/admin` | Super Admin console (Users, Template-based Orders, Metrics) | Gated (admin required) |

---

### 1.5 Phase 1 Deliverables Checklist

- [x] Admin can create, modify, and delete templates using the Django Admin dashboard
- [x] User registration & login correctly saves tokens and updates navbar avatar menu
- [x] "Use Design" button validates plan ownership with superuser/admin role bypass
- [x] Template detail view runs wax seal opening cover, HTML5 canvas scratch reveal, and countdown clock
- [x] Editor preview matches the `Ivory Bloom` design layout and updates in real-time as users customize details
- [x] RSVP submission from live invite records details to the database
- [x] Super Admin workspace selection modal on login (redirect to Admin Console or User Site)
- [x] Admin console with Users Directory, Paid Orders Log, and System Metrics tabs

---

## Phase 1.5 — Dynamic Multi-Template Engine (Coded Components + Content Schema)

> **Goal:** Build Invytor-style editable templates in Cardessa where each template is a coded component + a content schema, rather than trying to describe layout/animations dynamically in free-text JSON.

### The Core Design Pattern
- **Each template = one hand-built React component (the design/animation) + one JSON schema (which parts of it are user-editable).**
- Stop trying to describe animations in JSON. Describe editable content fields instead.
- Add a `component_key` mapping (e.g. `floral-arch`) that tells Next.js which coded component to render dynamically via a component registry map (`registry.js`).
- The generic editor renders controls driven entirely by `field_schema.fields`, and saves to `Invitation.content`.

---

### 1.5.1 Data Model Changes (Django)

| Model | Key Fields | Description |
|---|---|---|
| `Category` | name, slug, icon | Powers the pill filter row (Wedding, Naming Ceremony, House Warming, Birthday Party, Corporate Event, Baby Shower, Anniversary, Engagement, Festival Celebration...) |
| `Template` *(updated)* | name, slug, **component_key**, categories (M2M), tier, price_inr, is_premium, is_active, thumbnail, description, **field_schema (JSON)**, **demo_content (JSON)** | `component_key` maps to a registered React component; `field_schema` defines every editable field for this specific design; `demo_content` feeds the `/templates/[slug]` preview |
| `Invitation` *(updated)* | user, template, slug, is_published, **content (JSON)**, created_at, updated_at | Fixed columns (`groom_name`, `bride_name`, `bg_color`, etc.) are replaced by a single `content` JSONField whose keys are defined per-template by `template.field_schema` |

- [x] Add `Category` model + migration
- [x] Add `component_key`, `field_schema`, `demo_content` fields to `Template` + migration
- [x] Add `content` JSONField to `Invitation`; write a data migration to move existing fixed fields (`groom_name`, `bride_name`, `event_date`, `venue_name`, `bg_color`, `accent_color`, `music_enabled`) into `content` keyed the same way, so no existing invitations break
- [x] Register `field_schema` for the existing `Ivory Bloom` template so it round-trips through the new generic editor with zero visible change to end users

**Example `field_schema` for one template:**
```json
{
  "fields": [
    { "key": "groom_name",   "type": "text",  "label": "Groom's Name", "max_length": 40, "required": true },
    { "key": "bride_name",   "type": "text",  "label": "Bride's Name", "max_length": 40, "required": true },
    { "key": "event_date",   "type": "date",  "label": "Wedding Date", "required": true },
    { "key": "venue_name",   "type": "text",  "label": "Venue", "required": true },
    { "key": "couple_photo", "type": "image", "label": "Couple Photo", "aspect_ratio": "4:5", "required": true },
    { "key": "accent_color", "type": "color", "label": "Accent Color", "options": ["#C9A66B", "#7A8B6F", "#8E3B46"] },
    { "key": "music_url",    "type": "audio", "label": "Background Music", "required": false }
  ]
}
```

Supported field `type` values: `text`, `textarea`, `date`, `time`, `image`, `image_gallery`, `audio`, `color` (locked palette per template, not a free picker), `toggle`, `select`.

---

### 1.5.2 Backend APIs — additions & changes

- [x] `GET /api/categories/` — powers the pill filter row (**new**)
- [x] `GET /api/templates/?category=<slug>` — filter templates by category (**updated**)
- [x] `GET /api/templates/<slug>/` — now also returns `field_schema` + `demo_content` (**updated**)
- [x] `PATCH /api/invitations/<slug>/` — now accepts a single `content` object; validate incoming `content` against `template.field_schema` server-side (via `jsonschema` or a hand-rolled validator) before saving so a template can't be corrupted with fields it doesn't define (**updated**)
- [x] `POST /api/uploads/presign/` — returns a presigned DigitalOcean Spaces PUT URL + final public URL, so image/audio uploads go directly from browser to storage instead of through Django (**new**)

---

### 1.5.3 Frontend — Component Registry

```
frontend/templates/
  ivory-bloom/index.tsx
  floral-arch/index.tsx
  premium-gold/index.tsx
  begin-forever/index.tsx
  registry.ts
```

- [x] Build `templates/registry.ts` mapping `component_key → React component`
- [x] Build `<TemplateRenderer componentKey content />` — a single component used in all three places below, so the design is defined once and never drifts:
  - `/templates/[slug]` — public preview, fed `template.demo_content`
  - `/editor/[slug]` — live preview pane, fed in-progress `content` state
  - `/i/[slug]` — final public invitation, fed saved `content`
- [x] Migrate the existing `Ivory Bloom` design into `templates/ivory-bloom/index.tsx` as the first template built on the new pattern (proves the pattern works before building new designs)

---

### 1.5.4 Frontend — Generic Schema-Driven Editor

- [x] Build `<FieldRenderer field value onChange />` — one component per field `type` (text input, date picker, image upload + crop, locked-palette color swatches, audio uploader, toggle, select)
- [x] Rewrite `/editor/[slug]` to render `template.field_schema.fields.map(field => <FieldRenderer .../>)` instead of hardcoded form inputs, bound to `content` state
- [x] Autosave: debounce `PATCH /api/invitations/<slug>/` on `content` changes (~1s of inactivity) rather than a manual save button
- [x] Image fields: client-side crop to each field's `aspect_ratio` before upload (e.g. `react-easy-crop`) so every template's photo slot looks intentional

---

### 1.5.5 Category Gallery

- [x] Render the category pill row from `GET /api/categories/`
- [x] Filter `/templates` gallery client- or server-side by selected category
- [x] Support a template belonging to multiple categories (e.g. "Wedding · Engagement" tag shown on the card)

---

### 1.5.6 New Template Production Workflow (ongoing, post-migration)

This becomes the repeatable loop for adding new designs to the gallery:

**Developer:**
1. Build `templates/<new-key>/index.tsx` — the actual animated design.
2. Register it in `registry.ts`.
3. Deploy.

**Admin (Django Admin, no redeploy needed):**
1. Create a `Template` row — name, `component_key` matching what was just registered, categories, tier, price, thumbnail, `field_schema`, `demo_content`.
2. Toggle `is_active = True` → appears in `/templates` gallery immediately.

- [x] Document this workflow for whoever joins the team next (designer/dev handoff checklist)

---

### 1.5.7 Phase 1.5 Deliverables Checklist

- [x] Existing `Ivory Bloom` invitations still render and edit correctly after the `content` migration (zero regressions)
- [x] At least 2 new visually distinct templates built on the registry pattern (e.g. Floral Arch, Wax Seal / Begin Forever)
- [x] Editor is fully schema-driven — no template-specific code paths inside `/editor/[slug]`
- [x] `content` is validated server-side against `field_schema` on every `PATCH`
- [x] Category pill filters working on `/templates`
- [x] Image/audio uploads go through presigned DigitalOcean Spaces URLs

---

## Phase 2 — RSVP Dashboard, Filters & Exports

> **Goal:** Enhance the user dashboard to view and manage guest lists, filter RSVPs, download spreadsheets, and toggle invite languages.

---

### 2.1 RSVP Guest List Dashboard
- [x] **Guest List Panel**: Dedicated tab inside `/dashboard` for each invitation page
- [x] **Filters**: Filter list by status (Attending / Declined), search by Guest Name
- [x] **CSV Export**: Button to download RSVP guest list as Excel/CSV
- [x] **Manual RSVP Entry**: Allow the couple to manually add guests who RSVP'd offline

### 2.2 Template Customization & Languages
- [x] **Multi-Language Support**: Enable Hindi / Tamil translation fields in editor
- [x] **Active Template Swapping**: Allow couples to swap to a different design theme without resetting text fields — *now straightforward post-Phase 1.5, since swapping just means changing `Invitation.template` and re-mapping any `content` keys shared by name between the two templates' `field_schema`*
- [x] **Custom Subdomain**: Let premium couples configure `<name>.cardessa.in` for their invitations

### 2.3 Expanded Admin Console Features
- [x] **User Directory**: View list of all registered users (Name, Email, Signup Date, role status).
- [x] **Subscription & Orders Log**: View real-time log of paid orders (User email, plan purchased, Razorpay order/payment IDs, transaction amount, payment date).
- [x] **System Dashboard Stats**: Admin panel homepage displaying summary cards (Total Users, Total Active Plans, Total Revenue).

---

## Phase 3 — Agency / White-Label Tier & Domains

> **Goal:** Launch the multi-event white-label subscription planner tier, custom domains, and AI-assisted greeting copy writers.

---

### 3.1 Planner Dashboard
- [x] White-label toggle to hide "Made with Cardessa" branding from invitations
- [x] White-labeled custom domain mapping (`invite.couple.com`)
- [x] AI-powered text helper inside editor content fields
- [x] Multi-client invitations organization for event planners

---

## Transactional Pivot Upgrade — Template-Based Model

> **Goal:** Pivot the platform from plans (Classic/Royal subscription tiers) to a transaction-based model where templates have individual prices (including Free templates), and users edit via a step-by-step wizard.

### Database Updates
- [x] **Template Model**: Added `price_inr` and `is_new`.
- [x] **Invitation Model**: Added `is_paid` column.
- [x] **Order Model**: Added `invitation` ForeignKey (nullable `plan` for legacy compatibility).

### Backend APIs & Order Verification
- [x] Filter templates by price (`?price=free|premium`) and sort by newest (`?sort=newest`).
- [x] Auto-initialize invitation draft `content` with template `demo_content` upon template selection.
- [x] Automated Razorpay verification bypass for mock signatures in local development.
- [x] Immediate activation and publication for `price_inr = 0` (free) templates.

### Frontend Pages
- [x] **Remove Google Auth**: Removed login integration to focus on standard credential sign-ins.
- [x] **"How It Works" Page**: Replaced "/pricing" with a custom explanation page describing the 4-step wizard:
  1. *Select & Customize*
  2. *Media & Features*
  3. *Interactive Preview*
  4. *Pay & Share*
- [x] **Homepage Showcase**: Replaced subscription grids with a dynamic "Featured Designs" templates collection.
- [x] **Templates Page**: Added price badges, price filter pills, and sorting controls. Clicking "Use Design" creates a draft invitation immediately and redirects to the editor.
- [x] **4-Step Editor Wizard**:
  - *Step 1*: Edit ceremony details, set bride/groom display order, choose event time/venue/Google Map links, and select welcome note presets based on event type (Wedding, Nikah, Engagement, etc.).
  - *Step 2*: Upload cover photo (aspect ratio 4:5), manage interactive gallery slideshow photos (4 to 8 slides), toggle RSVP guest counts, and edit couples story.
  - *Step 3*: Live mobile iframe preview check.
  - *Step 4*: Receipt calculation, automated mock payment triggers, and unique live URL generation.
- [x] **User Dashboard Tabs**: Separated drafts ("Edited Designs") and paid invitations ("Purchased & Published") in separate tabs with dedicated empty state prompts.
- [x] **Admin Orders Log**: Replaced plan column with "Product / Template" names and fixed decimal rupee formatting.
