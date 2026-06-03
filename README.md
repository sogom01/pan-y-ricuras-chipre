# 🥐 Pan y Ricuras Chipre — Digital Menu

> Digital menu card for **Pan y Ricuras**, an artisan bakery and pastry shop located in the Chipre neighborhood of Manizales, Colombia. Customers browse the menu via QR code at the table; staff manage products through a password-protected admin panel.

---

## ✨ Features

### Public menu (customers)
- Full product catalog grouped by category (Bakery, Pastry, Hot Drinks, Cold Drinks, Breakfast, Lunch)
- Live search across product names and descriptions
- Category filter tabs with horizontal scroll on mobile
- Detail modal per product (slides up from bottom — native bottom-sheet pattern on mobile)
- "Featured of the day" badges
- Sold-out items hidden automatically via database-level RLS policy
- Fully responsive: tested at 320px, 375px, 414px, 768px, 1280px+
- SEO-optimized: Server-side rendered HTML, OpenGraph metadata, local business keywords

### Admin panel (staff only)
- Secure login via Supabase Auth (email + password, bcrypt hashing)
- Session protected by HTTP-only cookies + middleware route guard
- View all products including sold-out ones
- Toggle availability (available ↔ sold out) with instant cache revalidation
- Create new products with client-side + server-side Zod validation
- Edit existing products with inline field-level error messages
- Delete products with confirmation
- Changes reflect on the public menu immediately (Next.js `revalidatePath`)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) — App Router, Server Components, Server Actions |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Database | [Supabase](https://supabase.com/) — PostgreSQL with Row Level Security |
| Auth | Supabase Auth (email/password, HTTP-only cookies via `@supabase/ssr`) |
| Validation | [Zod](https://zod.dev/) — shared schemas for client and server |
| Fonts | Cormorant Garamond + Syne — self-hosted via `next/font/google` |
| Favicon | Next.js `ImageResponse` — generated at build time, no binary assets |
| Testing | Vitest + Testing Library |
| Deployment | Vercel (recommended) |

---

## 🏗 Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Public menu (Server Component, SSR)
│   ├── layout.tsx                # Root layout: fonts, global metadata
│   ├── globals.css               # Tailwind base + animations
│   ├── icon.tsx                  # Favicon (generated PNG, 32×32)
│   ├── apple-icon.tsx            # Apple Touch Icon (180×180)
│   └── admin/
│       ├── actions.ts            # "use server" — all admin Server Actions
│       ├── login/page.tsx        # Login form (Server Action, CSRF-safe)
│       └── menu/
│           ├── page.tsx          # Admin panel (Server Component)
│           └── AdminControls.tsx # Client Component — modal state + action calls
│
├── components/                   # Reusable UI (all typed, no external UI libs)
│   ├── MenuContent.tsx           # Public carta: search, filters, grouped list
│   ├── MenuCard.tsx              # Individual product card with hover effects
│   ├── ItemModal.tsx             # Product detail bottom-sheet (focus trap, WCAG AA)
│   ├── AdminEditModal.tsx        # Create/Edit form with Zod client validation
│   └── Toast.tsx                 # Notification (aria-live polite)
│
├── lib/
│   ├── domain/
│   │   └── menu-item.ts          # Types, Zod schemas, business invariants
│   ├── repositories/
│   │   └── menu-repository.ts    # Repository Pattern — sole DB access point
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client (cookie-aware)
│   └── demo-data.ts              # Fallback data when Supabase is not configured
│
├── middleware.ts                 # Session refresh + /admin/* route protection
│
supabase/
└── migrations/
    ├── 001_menu_items_table.sql  # Table schema, indexes, updated_at trigger
    ├── 002_rls_policies.sql      # Row Level Security (anon read / auth write)
    └── 003_seed_menu.sql         # 26 initial products (idempotent seed)
```

### Design patterns used

| Pattern | Where | Why |
|---|---|---|
| **Repository** | `menu-repository.ts` | Single DB access point — swap Supabase without touching UI |
| **Server Components** | `page.tsx`, `admin/menu/page.tsx` | Data fetched on server → SEO + no credentials in browser bundle |
| **Server Actions** | `admin/actions.ts` | Form mutations without API routes; CSRF handled by Next.js |
| **Dependency Injection** | `MenuRepository(supabase)` | Same repository, different client (browser vs server) |
| **Defense in Depth** | Middleware + `getUser()` in each Action | Auth verified at route level AND at mutation level |

---

## 🔒 Security

| Threat | Mitigation |
|---|---|
| **Broken Access Control** (OWASP A01) | Postgres RLS policies — anon role can only `SELECT WHERE disponible = true`; authenticated role has full access |
| **SQL Injection** (OWASP A03) | Supabase JS client uses parameterized queries exclusively |
| **Auth Failures** (OWASP A07) | Supabase Auth bcrypt hashing; generic error message on login (no user enumeration); token verified server-side with `getUser()` (not `getSession()`) |
| **Security Misconfiguration** (OWASP A05) | HTTP security headers on all routes: `CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `HSTS` |
| **CSRF** | Next.js Server Actions include automatic CSRF origin check |
| **XSS** | Zod validates all input at system boundaries; React escapes output by default |
| **Sensitive Data Exposure** | `SUPABASE_SERVICE_ROLE_KEY` never exposed to browser; Postgres error messages mapped to generic domain errors before reaching client |
| **Credential Storage** | Passwords never stored by the app — Supabase Auth owns bcrypt hashes |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com/) account (free tier is sufficient)

### 1. Clone and install

```bash
git clone https://github.com/your-username/pan-y-ricuras-chipre.git
cd pan-y-ricuras-chipre
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. In the SQL Editor, run the migrations **in order**:
   - `supabase/migrations/001_menu_items_table.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_menu.sql`
3. Go to **Authentication → Users → Add user** and create the admin account

### 3. Configure environment variables

Copy `.env.local` and fill in your values:

```bash
# From Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Never expose with NEXT_PUBLIC_ prefix — server only
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** If you skip this step, the app runs in demo mode with 25 hardcoded products so you can preview the UI without a database.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the public menu loads immediately.
Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🗄 Database

### Schema overview

```sql
menu_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL CHECK (length BETWEEN 1 AND 120),
  descripcion TEXT NOT NULL CHECK (length BETWEEN 1 AND 400),
  precio      INTEGER NOT NULL CHECK (precio > 0),  -- COP, no decimals
  emoji       TEXT NOT NULL DEFAULT '🍽️',
  cat         TEXT NOT NULL CHECK (cat IN (...6 categories...)),
  destacado   BOOLEAN NOT NULL DEFAULT false,
  disponible  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()  -- auto-updated by trigger
)
```

### RLS policies

| Role | Operation | Condition |
|---|---|---|
| `anon` | SELECT | `disponible = true` only |
| `authenticated` | SELECT | All rows |
| `authenticated` | INSERT / UPDATE / DELETE | All rows |

### Verify the seed

Run this in the Supabase SQL Editor after seeding:

```sql
SELECT cat, count(*) AS total,
       count(*) FILTER (WHERE disponible) AS disponibles,
       count(*) FILTER (WHERE destacado)  AS destacados
FROM menu_items
GROUP BY cat ORDER BY cat;
```

Expected: 26 rows total, 25 available (Mogolla Integral is sold out by default).

---

## 📦 Available Scripts

```bash
npm run dev        # Start development server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run test       # Run unit tests (Vitest)
npm run test:watch # Vitest in watch mode
```

---

## 🧪 Tests

Unit tests cover the domain and repository layers:

```bash
npm run test

# With coverage report
npx vitest run --coverage
```

Tests are in `tests/repositories/menu.test.ts` and mock the Supabase client — no live database needed.

---

## ☁️ Deploy to Vercel

1. Push your code to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy — Vercel detects Next.js automatically

After deploy, validate security headers at [securityheaders.com](https://securityheaders.com).

---

## 📁 Environment Variables Reference

| Variable | Required | Exposed to browser | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | ✅ Yes | Public anon key (RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | ❌ Never | Bypasses RLS — for admin scripts only |
| `NEXT_PUBLIC_APP_URL` | Yes | ✅ Yes | Base URL for OpenGraph metadata |

---

## 🗺 Roadmap (post-MVP)

- [ ] Nonce-based CSP (replace `unsafe-inline` in `script-src`)
- [ ] Sentry error monitoring
- [ ] Rate limiting on `/admin/login` with `@upstash/ratelimit`
- [ ] MFA for admin account (Supabase Auth TOTP)
- [ ] Soft-delete products (`deleted_at`) instead of hard delete
- [ ] Audit log table (who changed what, when)
- [ ] JSON-LD LocalBusiness schema for Google rich results
- [ ] Playwright E2E tests (happy path + admin flow)
- [ ] Optimistic UI updates on admin mutations

---

## 📄 License

MIT — feel free to use as a template for similar hospitality projects.

---

*Built with Next.js 15, Supabase, and Tailwind CSS. Designed for [Pan y Ricuras Chipre](https://maps.app.goo.gl/example), Manizales, Colombia.*
