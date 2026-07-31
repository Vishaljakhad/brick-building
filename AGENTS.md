# BrickBuilding — AI Agent Guide

This document gives AI agents everything they need to work on this codebase safely and consistently. Read it before making any changes.

---

## 1. What this project is

**BrickBuilding** is a B2B brick marketplace for India. It connects construction buyers directly with brick kilns ("bhatas"). Users compare brick prices across kilns, estimate truck loads, place orders with GPS delivery coordinates, and track orders from PENDING → DELIVERED.

Live production: https://brick-building.vercel.app (GitHub: `Vishaljakhad/brick-building`, branch `master`)

---

## 2. Tech stack (locked versions)

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16.2.12** (App Router, Turbopack, RSC) |
| Language | **TypeScript 5** |
| UI | Tailwind CSS v4, Framer Motion, Lucide icons, React Hot Toast |
| Database | PostgreSQL (local dev + Neon cloud) via **Prisma 6.6.0** |
| Auth | NextAuth v5 beta (Credentials provider, bcrypt hashing, **JWT strategy**) |
| Maps | Leaflet + React Leaflet |
| Deployment | **Vercel** (`vercel --prod`) |

There is **no migrations folder**. Schema changes use `prisma db push` (see §8).

---

## 3. Critical conventions — read before writing code

1. **Server/client split.** Pages using hooks/`useState` must start with `"use client"`. API route handlers are always server-side. Do not convert server components to client ones casually.
2. **Do NOT add comments to code** unless the user explicitly asks. Follow existing style exactly.
3. **No new dependencies without checking.** The project pins specific versions (`next`, `prisma`, `@prisma/client`, `react`). Verify a library is already used before importing it; otherwise ask.
4. **Role checks on every API route.** Every handler validates `session.user.role` (ADMIN / OWNER / CUSTOMER) before doing anything. Never trust the client — always re-authorize server-side.
5. **Never log or return secrets.** Error responses must be generic; detailed errors go to `console.error` only (see `isDatabaseUnavailable` in `src/lib/prisma.ts`). Never print `DATABASE_URL`, `NEXTAUTH_SECRET`, or hashes.
6. **`.env` files are gitignored.** `.env` (dev), `.env.production`, and any `.env.*.local` are NOT committed. Secrets live only in these files and in Vercel env vars.
7. **Rate limiting exists** (`src/lib/rate-limit.ts`). New endpoints that touch auth, writes, or public GETs should use it with the appropriate profile (see §6).
8. **Validation lives in `src/lib/validation.ts`** (server) and **`src/lib/client-validation.ts`** (client). Reuse these; don't inline new regexes when helpers exist.
9. **Optimistic UI pattern**: update local state immediately, then call the API, then roll back on failure (see customer/owner dashboards and order detail).

---

## 4. Data model (Prisma schema — `prisma/schema.prisma`)

- **User** — roles: `CUSTOMER`, `OWNER`, `ADMIN` (string field, default `CUSTOMER`). Has `referralCode` (unique), `referredById` (self-relation "Referrals"), `referralRewards` (Float), `referralRewardGranted` (Boolean).
- **Bhata** — a kiln owned by a `User` (ownerId). Has `latitude`/`longitude`, `isActive`.
- **BrickType** — catalog item (standard, hollow, fly ash, concrete blocks). `basePrice`, `unit`.
- **BrickPrice** — per-kiln price for a brick type. Unique on `[bhataId, brickTypeId]`. `stock`, `isAvailable`.
- **Order** — `status` (PENDING/CONFIRMED/PROCESSING/IN_TRANSIT/DELIVERED/CANCELLED), `paymentMethod` (COD/ONLINE), `paymentStatus` (UNPAID/PAID/REFUNDED), plus discount fields: `subtotalAmount`, `discountAmount`, `discountCode`, `discountLabel`, and delivery fields.
- **OrderItem** — quantity + unitPrice snapshot per brick type.
- **Account / Session / VerificationToken** — NextAuth adapter tables.

Relations: `User.orders`, `User.kilns` (= `Bhata`), `Bhata.brickPrices`, `Bhata.orders`, `BrickType.brickPrices`, `BrickType.orderItems`, `Order.items`.

> **Note**: the relation field is `User.kilns` (not `bhatas`). `Bhata.owner` is the owning user.

---

## 5. Money & discounts (critical business logic)

Discount rules are centralized in **`src/lib/constants.ts` → `DISCOUNT_RULES`** and computed in **`src/lib/discounts.ts`**:

- First order: **10% off, capped ₹500**.
- First order **with a referrer**: **15% off, capped ₹750**.
- Referrer reward: **5% of the referred order**, capped ₹500 — granted only when the referred order becomes **DELIVERED**.
- Referral reward balance is auto-applied as a discount on the next order (`computeDiscount` adds `REFERRER_REWARD`).

**Invariants to preserve:**
- `computeDiscount` returns `{ discountAmount, subtotalAmount, totalAmount, discountCode, discountLabel }` and rounds to 2 decimals. Never change this contract without updating `src/lib/discounts.ts` and every caller.
- Reward granting happens **inside a `$transaction`** in `src/app/api/orders/[id]/route.ts` (PATCH → DELIVERED), guarded by `referralRewardGranted` so it fires exactly once.
- First-order detection is `isFirstOrder()` — an order counts as "first" only if no non-CANCELLED order exists.
- Referral codes look like `NAME-XXXX` (`REFERRAL_CODE_REGEX = /^[A-Z0-9]{3,4}-[A-Z0-9]{4}$/`). Generated by `generateReferralCode()` in `src/lib/utils.ts`.

---

## 6. API routes & the security model

All routes live in `src/app/api/**/route.ts`. **Every route requires `auth()` and enforces roles.** No public endpoint exposes user data beyond the public listing routes.

| Route | Methods | Access | Notes |
|-------|---------|--------|-------|
| `/api/auth/[...nextauth]` | — | public | NextAuth handlers |
| `/api/auth/register` | POST | public | Rate-limited (`moderate`); validates email/password/name/role/phone/referral code |
| `/api/bhatas` | GET | public | Only `isActive: true`; optional `lat`/`lng`/`radius` distance sort; rate-limited (`relaxed`); `Cache-Control: public, s-maxage=60` |
| `/api/brick-types` | GET | public | Rate-limited; cached public |
| `/api/brick-types` | POST/PUT/DELETE | ADMIN | Inline `validateBody` |
| `/api/bhatas/my` | GET | OWNER | Own kiln + prices |
| `/api/bhatas/my` | POST/PUT | OWNER | Rate-limited (`moderate`) |
| `/api/bhatas/prices` | POST/PUT | OWNER | Rate-limited (`moderate`); validates price/stock |
| `/api/orders` | GET | any authed | Scoped by role (ADMIN=all, OWNER=own kilns, CUSTOMER=own) |
| `/api/orders` | POST | any authed | Rate-limited (`moderate`); full validation + discount computation |
| `/api/orders/[id]` | GET | scoped | `canAccessOrder()` — 404 (not 403) when unauthorized to avoid ID probing |
| `/api/orders/[id]` | PATCH | scoped | Status-transition rules per role; grants referral reward on DELIVERED |
| `/api/referral` | GET | any authed | Referral code, rewards, stats |
| `/api/admin/users` | GET | ADMIN | |
| `/api/admin/users/[id]` | PATCH | ADMIN | Role change; cannot demote self |
| `/api/admin/bhatas` | GET | ADMIN | |
| `/api/admin/bhatas/[id]` | PATCH | ADMIN | Toggle `isActive` |

**Order status rules** (`src/app/api/orders/[id]/route.ts`):
- ADMIN: any of `ALLOWED_STATUS`.
- OWNER: `CONFIRMED → PROCESSING → IN_TRANSIT → DELIVERED`, plus `CANCELLED`.
- CUSTOMER: `CANCELLED` only, and only while order is `PENDING` or `CONFIRMED`.
- A DELIVERED or already-CANCELLED order cannot be cancelled.

### Rate limiting (`src/lib/rate-limit.ts`)

Three named profiles: `strict` (5/window, auth), `moderate` (20/window, writes), `relaxed` (60/window, reads). All use exponential backoff and return `Retry-After`. Use `getClientIp(req)` for IP extraction and key by both IP and user id where a session exists. The limiter is in-memory per serverless instance — acceptable defense-in-depth, not globally atomic.

### Database guard (`src/lib/prisma.ts`)

The Prisma client is wrapped with `$extends` → every query gets a **10s timeout** and a **circuit breaker** (opens after 5 consecutive failures, 30s cooldown). Do not bypass this wrapper. `isDatabaseUnavailable()` identifies circuit-open errors.

---

## 7. Frontend structure

- **`src/app/`** — App Router pages:
  - `page.tsx` — landing
  - `login/`, `register/` — auth pages
  - `bhatas/`, `bhatas/[id]/` — kiln listing + detail (map, price comparison, order placement)
  - `orders/[id]/` — order detail (status timeline, cancel)
  - `dashboard/admin`, `dashboard/owner`, `dashboard/customer` — role dashboards
- **`src/components/`** — `navbar`, `providers`, `map-component`, animated sections, and a **`ui/` folder** with primitives: `button`, `card`, `badge`, `input`, `select`, `textarea`, `modal`, `alert`, `field`, `skeleton`. Reuse these primitives; don't hand-roll new ones.
- **`src/lib/`** — `auth.ts` (NextAuth config), `auth-types.ts` (session type augmentation), `prisma.ts`, `validation.ts`, `client-validation.ts`, `constants.ts`, `discounts.ts`, `rate-limit.ts`, `utils.ts`.

Styling: Tailwind v4. `cn()` from `src/lib/utils.ts` merges classes (clsx + tailwind-merge). Money formatting uses `formatPrice()` (INR, en-IN, 0 decimals). Use `ORDER_STATUS` / `STATUS_COLORS` / `PAYMENT_METHODS` / `PAYMENT_STATUS` from `constants.ts` for any status display.

---

## 8. Commands (must-run after changes)

```bash
npm run dev          # dev server (port 3000)
npm run build        # production build (this is what Vercel runs — MUST be green)
npm run lint         # eslint
npm run db:push      # sync Prisma schema to DB (no migrations folder)
npm run db:seed      # node prisma/seed.js — demo data
npm run db:studio    # Prisma Studio visual DB editor
npm install          # runs prisma generate via postinstall
```

**Verification workflow after any change:**
1. `npm run build` — must pass (Vercel deploys only if this passes).
2. `npm run lint` — known pre-existing noise below; new errors should not be introduced.
3. Push to `master` and deploy with `vercel --prod`, then smoke-test the changed endpoints live.
4. `npm audit` — currently 9 high findings, ALL in dev-only eslint toolchain (brace-expansion/minimatch). Runtime deps are clean. Do **not** run `npm audit fix --force` (it would downgrade to next@9.3.3). `package.json` `overrides` pins `postcss@8.5.25` and `sharp@0.35.3` for the runtime fixes — keep those.

### Known pre-existing lint noise (do not "fix" these)

- `set-state-in-effect` errors (React 19 `react-hooks/set-state-in-effect`) across dashboards, order/register pages, `bhatas/[id]` — the fetch-in-`useEffect` pattern is intentional in this codebase.
- `no-require-imports` errors in `prisma/seed.js` and `prisma/backfill-referral-codes.js` (standalone scripts, matching the existing `seed.js` pattern).
- Minor unused-variable warnings in a few files.

---

## 9. Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `.env` (dev), `.env.production` (live), Vercel | PostgreSQL connection (Prisma datasource) |
| `NEXTAUTH_SECRET` | both | NextAuth JWT signing secret |
| `NEXTAUTH_URL` | dev | Dev server URL |
| `SEED_PASSWORD` | optional | Override demo password in seeds |

- `.env.production` holds the live Neon connection string + prod secret — **never commit it** (already in `.gitignore`).
- Production demo logins use rotated strong passwords (`Bb-demo-*`), NOT the local `Demo@12345`.

---

## 10. Deployment & release workflow

1. Commit with a concise message matching history style (e.g. `feat:` / `Security hardening:` / `Add ...`).
2. `git push origin master`.
3. `vercel --prod` from the project root.
4. Smoke-test on https://brick-building.vercel.app (build is green only if `next build` passes; Vercel runs build, not lint).

---

## 11. Gotchas & gotchas to preserve

- **`next.config.ts`** sets global security headers (X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS) — keep them.
- **Middleware** (`src/middleware.ts`) only guards `/dashboard/*` by role. API routes do their own auth — this layered defense is deliberate.
- **Prisma `db push`** (not migrations): if you change the schema, run `npm run db:push` against BOTH local and production DBs (production URL in `.env.production`).
- **Test accounts created during verification must be cleaned up** from the production DB before finishing.
- The `@types/bcryptjs` and `@types/leaflet` packages are in `dependencies` (not dev) — match this if adding type packages.
- `tailwindcss-animate` + `class-variance-authority` are used by UI primitives (cva for variants). Keep the existing variant naming.

---

## 12. Suggested AI-agent task workflows

- **Add a feature**: find the closest existing route/page → mirror its validation, auth, and rate-limiting → update `constants.ts` if new statuses/labels → build → lint → test → commit/push/deploy.
- **Fix a bug in order flow**: read `src/app/api/orders/route.ts` (POST) and `src/app/api/orders/[id]/route.ts` (PATCH) together with `discounts.ts` — the discount/reward logic is tightly coupled.
- **Change the DB**: edit `prisma/schema.prisma` → `npm run db:push` (local + prod) → `npm run db:seed` if needed → verify `npm run build`.
- **Add an admin action**: extend `src/app/api/admin/*` following the existing GET/PATCH patterns; keep 404-on-unauthorized for ID-based endpoints.
