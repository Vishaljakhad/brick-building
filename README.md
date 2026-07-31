# 🧱 BrickBuilding

**India's B2B Brick Marketplace** — a platform that connects builders directly with verified brick kilns (bhatas). Compare prices, calculate truck loads, and track deliveries — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000)

---

## ✨ Features

- **🔍 Nearby Bhatas** — Find brick kilns within a chosen radius (25/50/100/200 km) using your GPS location
- **🗺️ Interactive Map** — Live Leaflet map with kiln markers, distance badges, and location-aware sorting
- **🏷️ Price Comparison** — Compare brick prices across kilns (standard, hollow, fly ash, concrete blocks)
- **🚛 Truck Capacity Calculator** — Estimate how many bricks fit in each truck type
- **📦 Order Management** — Place orders with delivery coordinates, track status from PENDING → DELIVERED
- **🎁 Referral & Rewards** — Unique referral codes (`NAME-XXXX`), 15% off a referred friend's first order, and 5% cash-back rewards (capped ₹500) when their order is delivered
- **🛒 First-Order Discount** — 10% off your first order (15% when referred), capped at ₹500 / ₹750
- **👥 Three Roles** — Admin, Bhata Owner, and Customer dashboards with role-based access control
- **🔐 Secure Auth** — NextAuth.js with bcrypt password hashing and JWT sessions
- **🛡️ Security Hardening** — Configurable rate limiting with exponential backoff, strict input validation, generic error responses (no stack traces leaked), Prisma query timeouts with a circuit breaker, and CDN caching for public endpoints
- **💳 Flexible Payment** — Cash on Delivery (COD) tracking with payment status
- **📊 Admin Panel** — Manage users, verify kilns, and oversee marketplace activity

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.12 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI** | Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Database** | PostgreSQL (Neon) via Prisma 6.6.0 |
| **Auth** | NextAuth.js v5 (Credentials, bcrypt, JWT) |
| **Maps** | Leaflet + React Leaflet |
| **Toasts** | React Hot Toast |
| **Deployment** | Vercel (`vercel --prod`) |

> **No migrations folder** — schema changes are applied with `npm run db:push`.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or [Neon](https://neon.tech) cloud)

### 1. Clone the repository

```bash
git clone https://github.com/Vishaljakhad/brick-building.git
cd brick-building
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@host:5432/brick_building"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
npm run db:push      # Create tables from Prisma schema
npm run db:seed      # Seed with demo data
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔑 Demo Accounts

After seeding locally, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@test.com` | `Demo@12345` |
| **Owner** | `owner@test.com` | `Demo@12345` |
| **Owner 2** | `owner2@test.com` | `Demo@12345` |
| **Customer** | `customer@test.com` | `Demo@12345` |

> **Note:** These are local-development-only credentials. In production, demo accounts use strong randomly generated passwords. Override via `SEED_PASSWORD` env var.

---

## 🎁 Referral & Discount Program

Rules are centralized in `src/lib/constants.ts` (`DISCOUNT_RULES`) and computed in `src/lib/discounts.ts`:

| Rule | Value |
|------|-------|
| First-order discount | 10% off (cap ₹500) |
| First-order discount (referred) | 15% off (cap ₹750) |
| Referrer reward | 5% of the referred order (cap ₹500) |
| Reward granted when | Referred order reaches **DELIVERED** |

- Every user gets a unique referral code like `NAME-XXXX` at registration (`generateReferralCode` in `src/lib/utils.ts`).
- New users can sign up via a shared link (`/register?ref=CODE`) to be linked as a referral.
- Earned rewards are auto-applied as a discount on the next order.
- Rewards are granted exactly once inside a database transaction, guarded by `referralRewardGranted`.

---

## 📂 Project Structure

```
brick-building/
├── AGENTS.md               # Guide for AI agents working on this codebase
├── prisma/
│   ├── schema.prisma       # Database models (User, Bhata, BrickType, Order...)
│   ├── seed.ts             # Seed script (TypeScript source)
│   ├── seed.js             # Compiled seed script
│   └── backfill-referral-codes.js  # One-off backfill for existing users
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page (supports ?ref=CODE)
│   │   ├── bhatas/         # Kiln listing + detail pages
│   │   ├── orders/         # Order detail page
│   │   ├── dashboard/      # Admin / Owner / Customer dashboards
│   │   └── api/            # Next.js API routes (auth, orders, bhatas, admin, referral)
│   ├── components/         # Reusable UI (navbar, hero, cards, map, ui/primitives)
│   └── lib/                # Auth, Prisma, validation, rate-limiting, discounts, utils
└── package.json
```

### Database Models

- **User** — Customers, owners, and admins (role-based), with referral code, referral rewards, and referrer link
- **Bhata** — Brick kilns with location coordinates
- **BrickType** — Catalog (standard, hollow, fly ash, concrete blocks)
- **BrickPrice** — Per-kiln pricing and stock
- **Order / OrderItem** — Orders with items, delivery details, discounts, and payment status

---

## 🧰 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |
| `npm run db:migrate` | Create a new migration |

---

## ☁️ Deployment (Vercel)

1. Push this repo to GitHub
2. Import it in [Vercel](https://vercel.com) (or use `vercel --prod` from CLI)
3. Add environment variables in Vercel → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your production PostgreSQL connection string (Neon) |
| `NEXTAUTH_SECRET` | A random secret |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

4. Deploy — done!

---

## 📄 License

This is a private project for demonstration purposes.
