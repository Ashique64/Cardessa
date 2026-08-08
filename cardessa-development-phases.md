# Cardessa — Phase-by-Phase Development Plan

> **Platform:** Digital Wedding Invitation Platform (Live Web App Only)
> **Stack:** Next.js + Django REST Framework + PostgreSQL + DigitalOcean + Vercel + Razorpay

---

## Overview

```
Phase 1  →  MVP Core & RSVP Foundation (4–6 weeks)
Phase 2  →  RSVP Dashboard, Filters & Exports (3–4 weeks)
Phase 3  →  Agency / White-Label Tier & Domains (3–4 weeks)
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

---

### 1.2 Data Models (Django)

| Model | Key Fields | Description |
|---|---|---|
| `User` | email, name, is_superuser, is_staff, created_at | Core User identity with admin capability flags |
| `Template` | name, slug, tier (Classic / Royal), style, description, icon, is_active | Created by Admin. Only active templates are shown to users |
| `Invitation` | user, template, slug (unique preview ID), title, groom_name, bride_name, event_date, event_time, venue_name, venue_address, bg_color, accent_color, music_enabled, is_published | Created by User from an admin template |
| `RSVP` | invitation, guest_name, email, phone, status (Attending / Declined), guest_count, message, created_at | Saved when guests respond on the live invitation |
| `Plan` | name, price_inr, billing_type, max_invitations, features JSON | Billing configurations |
| `Order` | user, plan, razorpay_order_id, razorpay_payment_id, status, created_at | Keeps track of payment conversions |

---

### 1.3 Backend APIs

**Auth & Users**
- `POST /api/auth/register/` — register new user
- `POST /api/auth/login/` — returns access, refresh, user roles
- `GET /api/auth/user/` — fetch active profile details

**Admin Templates Management**
- `GET /api/templates/` — lists only **active** templates created by admins (Public)

**Invitations & Customization**
- `POST /api/invitations/` — create invitation (requires plan validation check)
- `GET /api/invitations/<slug>/` — fetch full invitation details for rendering (Public)
- `PATCH /api/invitations/<slug>/` — update text, colors, music settings (Owner only)

**RSVP Guest Responses**
- `POST /api/invitations/<slug>/rsvp/` — allows guests to submit RSVP form (Public)

---

### 1.4 Frontend — Pages & Routes

| Route | Description | Gated? |
|---|---|---|
| `/` | Marketing & landing page | No |
| `/login` | Login page with toggle show/hide | No |
| `/register` | Sign-up page with check-toggles | No |
| `/templates` | Gallery showing active templates | No |
| `/templates/[slug]` | Interactive preview demo (Wax seal, Scratch Date, Map) | Gated (plan required, admin bypass) |
| `/pricing` | Choose pricing tier | No |
| `/checkout` | Razorpay payment modal | Gated (auth required) |
| `/dashboard` | User dashboard (List invitation pages, view RSVP counts) | Gated (auth required) |
| `/editor/[slug]` | Split-screen editor (Content + Design tab with real-time phone preview) | Gated (auth required) |
| `/i/[slug]` | **Public invitation page** with waxy seal cover & RSVP form | No |

---

### 1.5 Phase 1 Deliverables Checklist

- [x] Admin can create, modify, and delete templates using the Django Admin dashboard
- [x] User registration & login correctly saves tokens and updates navbar avatar menu
- [x] "Use Design" button validates plan ownership with superuser/admin role bypass
- [x] Template detail view runs wax seal opening cover, HTML5 canvas scratch reveal, and countdown clock
- [x] Editor preview matches the `Ivory Bloom` design layout and updates in real-time as users customize details
- [x] RSVP submission from live invite records details to the database

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
- [x] **Active Template Swapping**: Allow couples to swap to a different design theme without resetting text fields
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
- [ ] White-label toggle to hide "Made with Cardessa" branding from invitations
- [ ] White-labeled custom domain mapping (`invite.couple.com`)
- [ ] AI-powered text helper inside editor content fields
- [ ] Multi-client invitations organization for event planners
