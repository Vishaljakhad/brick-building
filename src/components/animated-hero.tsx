"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Truck, ChevronRight } from "lucide-react";

function MapMockup() {
  return (
    <svg viewBox="0 0 500 360" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="360" rx="12" fill="#f7f5f2" />
      <rect width="500" height="360" rx="12" fill="url(#mapBg)" />

      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0L0 0 0 30" fill="none" stroke="#e5e0d8" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="mapBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f5f2" />
          <stop offset="100%" stopColor="#f0ede8" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e5e0d8" stopOpacity="0" />
          <stop offset="50%" stopColor="#d6d0c8" />
          <stop offset="100%" stopColor="#e5e0d8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="500" height="360" fill="url(#grid)" opacity="0.5" />

      <path d="M0 180h500" stroke="url(#road)" strokeWidth="4" />
      <path d="M250 0v360" stroke="url(#road)" strokeWidth="3" />

      <path d="M0 120h80q10 0 10 10v10q0 10 10 10h20" stroke="#d6d0c8" strokeWidth="2" fill="none" />
      <path d="M500 240h-60q-10 0-10-10v-20" stroke="#d6d0c8" strokeWidth="2" fill="none" />
      <path d="M120 0v40q0 10 10 10h30" stroke="#d6d0c8" strokeWidth="1.5" fill="none" />
      <path d="M380 360v-50q0-10 10-10h20" stroke="#d6d0c8" strokeWidth="1.5" fill="none" />

      <rect x="60" y="60" width="32" height="24" rx="4" fill="#e86b2a" opacity="0.3" />
      <rect x="320" y="100" width="28" height="20" rx="3" fill="#e86b2a" opacity="0.25" />
      <rect x="80" y="240" width="30" height="22" rx="4" fill="#e86b2a" opacity="0.2" />
      <rect x="380" y="260" width="24" height="18" rx="3" fill="#e86b2a" opacity="0.3" />

      <g transform="translate(200, 130)">
        <circle cx="0" cy="0" r="22" fill="#c1440e" opacity="0.12" />
        <circle cx="0" cy="0" r="14" fill="#c1440e" opacity="0.2" />
        <circle cx="0" cy="0" r="8" fill="#c1440e" />
        <circle cx="0" cy="0" r="3" fill="white" />
      </g>

      <g transform="translate(130, 80)">
        <circle cx="0" cy="0" r="16" fill="#c1440e" opacity="0.1" />
        <circle cx="0" cy="0" r="10" fill="#c1440e" opacity="0.18" />
        <circle cx="0" cy="0" r="5" fill="#c1440e" />
        <circle cx="0" cy="0" r="2" fill="white" />
      </g>

      <g transform="translate(310, 180)">
        <circle cx="0" cy="0" r="16" fill="#c1440e" opacity="0.1" />
        <circle cx="0" cy="0" r="10" fill="#c1440e" opacity="0.18" />
        <circle cx="0" cy="0" r="5" fill="#c1440e" />
        <circle cx="0" cy="0" r="2" fill="white" />
      </g>

      <g transform="translate(370, 80)">
        <circle cx="0" cy="0" r="16" fill="#c1440e" opacity="0.1" />
        <circle cx="0" cy="0" r="10" fill="#c1440e" opacity="0.18" />
        <circle cx="0" cy="0" r="5" fill="#c1440e" />
        <circle cx="0" cy="0" r="2" fill="white" />
      </g>

      <g transform="translate(100, 190)">
        <circle cx="0" cy="0" r="16" fill="#c1440e" opacity="0.1" />
        <circle cx="0" cy="0" r="10" fill="#c1440e" opacity="0.18" />
        <circle cx="0" cy="0" r="5" fill="#c1440e" />
        <circle cx="0" cy="0" r="2" fill="white" />
      </g>

      <rect x="148" y="146" width="100" height="28" rx="6" fill="white" stroke="#e5e0d8" strokeWidth="1" />
      <text x="198" y="164" textAnchor="middle" fill="#6b6560" fontSize="11" fontWeight="600">Rahim Bhata &amp; Bros</text>

      <rect x="78" y="58" width="95" height="28" rx="6" fill="white" stroke="#e5e0d8" strokeWidth="1" />
      <text x="125" y="76" textAnchor="middle" fill="#6b6560" fontSize="11" fontWeight="600">Karim Bricks &amp; Tiles</text>

      <rect x="325" y="198" width="90" height="20" rx="4" fill="#c1440e" />
      <text x="370" y="212" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">5.2 km away</text>

      <g transform="translate(20, 300)">
        <rect width="160" height="44" rx="8" fill="white" stroke="#e5e0d8" strokeWidth="1" />
        <circle cx="28" cy="22" r="10" fill="#c1440e" opacity="0.15" />
        <text x="28" y="26" textAnchor="middle" fill="#c1440e" fontSize="12" fontWeight="bold">+</text>
        <text x="48" y="19" fill="#1a1a1a" fontSize="11" fontWeight="600">4 more kilns nearby</text>
        <text x="48" y="32" fill="#6b6560" fontSize="10">within 25 km radius</text>
      </g>

      <g transform="translate(340, 300)">
        <rect width="140" height="44" rx="8" fill="#c1440e" />
        <text x="70" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">Find Bhatas Near Me</text>
        <text x="70" y="36" textAnchor="middle" fill="white" fontSize="9" opacity="0.8">Use my location</text>
      </g>

      <rect x="0" y="0" width="500" height="360" rx="12" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  );
}

function AnimatedCounter({ value, suffix = "", label, icon }: { value: string; label: string; icon: React.ReactNode; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary-lighter text-primary mb-2">
        {icon}
      </div>
      <p className="text-xl font-bold text-text" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>
        {value}
      </p>
      <p className="text-xs text-text-tertiary font-medium mt-0.5">{label}</p>
    </div>
  );
}

export function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-secondary"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              India&apos;s B2B Brick Marketplace
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]"
              style={{ fontFamily: "var(--font-sora), system-ui, sans-serif", color: "#1a1a1a" }}
            >
              Source Bricks Directly{" "}
              <span className="text-primary">From Verified Kilns</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-lg text-text-secondary leading-relaxed max-w-xl"
            >
              Find the nearest brick kilns, compare prices across suppliers, calculate truck loads, and schedule deliveries — all from one dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 text-base px-6 gap-2">
                  <Search className="h-5 w-5" />
                  I&apos;m a Buyer
                </Button>
              </Link>
              <Link href="/register?role=owner">
                <Button variant="outline" size="lg" className="border-2 border-border hover:border-primary/40 hover:bg-primary-lighter transition-all duration-200 text-base px-6 gap-2 text-text-secondary hover:text-primary">
                  <Truck className="h-5 w-5" />
                  I Own a Bhata
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-white shadow-xl shadow-black/5 overflow-hidden">
              <div className="aspect-[5/3.6] relative">
                <MapMockup />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                >
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-300" />
                  LIVE MAP
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl border border-border bg-surface p-5"
        >
          <AnimatedCounter value="100+" label="Verified Bhatas" icon={<MapPin className="h-4 w-4" />} />
          <AnimatedCounter value="50,000+" label="Bricks Delivered" icon={<Truck className="h-4 w-4" />} />
          <AnimatedCounter value="99%" label="Satisfaction Rate" icon={<Search className="h-4 w-4" />} />
          <AnimatedCounter value="2,500+" label="Happy Builders" icon={<ChevronRight className="h-4 w-4" />} />
        </motion.div>
      </div>
    </section>
  );
}
