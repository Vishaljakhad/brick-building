"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Truck, Users } from "lucide-react";

function MapMockup() {
  return (
    <svg viewBox="0 0 500 360" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mapBg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f1ec" />
          <stop offset="100%" stopColor="#ebe7e0" />
        </linearGradient>
        <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.8" fill="#d6d0c8" opacity="0.4" />
        </pattern>
        <pattern id="dotGridDense" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="0.6" fill="#d6d0c8" opacity="0.3" />
        </pattern>
        <filter id="pinShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#c1440e" floodOpacity="0.3" />
        </filter>
        <filter id="pinShadowSmall">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#c1440e" floodOpacity="0.2" />
        </filter>
      </defs>

      <rect width="500" height="360" rx="12" fill="url(#mapBg2)" />
      <rect width="500" height="360" rx="12" fill="url(#dotGrid)" />

      <rect x="40" y="70" width="70" height="50" rx="8" fill="#dce8d4" opacity="0.5" stroke="#c4d4b8" strokeWidth="0.8" />
      <rect x="320" y="240" width="90" height="55" rx="8" fill="#dce8d4" opacity="0.5" stroke="#c4d4b8" strokeWidth="0.8" />
      <text x="400" y="272" textAnchor="middle" fill="#9aac8c" fontSize="8" fontWeight="600">GREEN PARK</text>

      <rect x="150" y="230" width="55" height="40" rx="4" fill="#e8e4dc" opacity="0.6" stroke="#d6d0c8" strokeWidth="0.8" />
      <rect x="380" y="60" width="45" height="35" rx="4" fill="#e8e4dc" opacity="0.6" stroke="#d6d0c8" strokeWidth="0.8" />

      <rect x="0" y="0" width="500" height="360" rx="12" fill="url(#dotGridDense)" />

      <g transform="translate(200, 130)" filter="url(#pinShadow)">
        <circle cx="0" cy="0" r="26" fill="#c1440e" opacity="0.08" />
        <circle cx="0" cy="0" r="18" fill="#c1440e" opacity="0.15" />
        <circle cx="0" cy="0" r="10" fill="#c1440e" />
        <circle cx="0" cy="0" r="4" fill="white" />
        <rect x="-1" y="10" width="2" height="8" rx="1" fill="#c1440e" />
      </g>

      <rect x="148" y="148" width="100" height="28" rx="6" fill="white" stroke="#e5e0d8" strokeWidth="1" filter="url(#pinShadowSmall)" />
      <text x="198" y="166" textAnchor="middle" fill="#1a1a1a" fontSize="11" fontWeight="600">Rahim Bhata &amp; Bros</text>

      <rect x="78" y="42" width="100" height="26" rx="6" fill="white" stroke="#e5e0d8" strokeWidth="1" />
      <path d="M128 68 L128 78" stroke="#e5e0d8" strokeWidth="1" />
      <circle cx="128" cy="82" r="3" fill="#e5e0d8" />
      <text x="128" y="58" textAnchor="middle" fill="#1a1a1a" fontSize="11" fontWeight="600">Karim Bricks &amp; Tiles</text>

      <g transform="translate(310, 180)" filter="url(#pinShadowSmall)">
        <circle cx="0" cy="0" r="18" fill="#c1440e" opacity="0.08" />
        <circle cx="0" cy="0" r="12" fill="#c1440e" opacity="0.15" />
        <circle cx="0" cy="0" r="6" fill="#c1440e" />
        <circle cx="0" cy="0" r="2.5" fill="white" />
      </g>
      <rect x="268" y="196" width="80" height="20" rx="4" fill="#c1440e" filter="url(#pinShadowSmall)" />
      <text x="308" y="210" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">4.8 km away</text>

      <g transform="translate(370, 80)" filter="url(#pinShadowSmall)">
        <circle cx="0" cy="0" r="14" fill="#c1440e" opacity="0.06" />
        <circle cx="0" cy="0" r="9" fill="#c1440e" opacity="0.12" />
        <circle cx="0" cy="0" r="5" fill="#c1440e" />
        <circle cx="0" cy="0" r="2" fill="white" />
      </g>

      <g transform="translate(100, 190)" filter="url(#pinShadowSmall)">
        <circle cx="0" cy="0" r="14" fill="#c1440e" opacity="0.06" />
        <circle cx="0" cy="0" r="9" fill="#c1440e" opacity="0.12" />
        <circle cx="0" cy="0" r="5" fill="#c1440e" />
        <circle cx="0" cy="0" r="2" fill="white" />
      </g>

      <g transform="translate(20, 300)">
        <rect width="160" height="44" rx="8" fill="white" stroke="#e5e0d8" strokeWidth="1" filter="url(#pinShadowSmall)" />
        <circle cx="28" cy="22" r="10" fill="#c1440e" opacity="0.15" />
        <text x="28" y="26" textAnchor="middle" fill="#c1440e" fontSize="12" fontWeight="bold">+</text>
        <text x="48" y="19" fill="#1a1a1a" fontSize="11" fontWeight="600">4 more kilns nearby</text>
        <text x="48" y="32" fill="#6b6560" fontSize="10">within 25 km radius</text>
      </g>

      <g transform="translate(340, 300)">
        <rect width="140" height="44" rx="8" fill="#c1440e" filter="url(#pinShadow)" />
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
                <Button size="lg" className="bg-primary hover:bg-primary-dark hover:scale-[1.02] text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 text-base px-6 gap-2">
                  <Search className="h-5 w-5" />
                  I&apos;m a Buyer
                </Button>
              </Link>
              <Link href="/register?role=owner">
                <Button variant="outline" size="lg" className="border-2 border-text-secondary hover:border-primary/50 hover:bg-primary-lighter hover:scale-[1.02] transition-all duration-200 text-base px-6 gap-2 text-text-secondary hover:text-primary">
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
            <div className="rounded-2xl border border-border bg-white shadow-lg shadow-black/5 overflow-hidden hover:scale-[1.01] transition-transform duration-300">
              <div className="aspect-[5/3.6] relative">
                <MapMockup />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="absolute top-3 right-3 rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white shadow-lg flex items-center gap-1.5"
                >
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                  LIVE MAP
                  <span className="text-white/60 font-normal text-[10px]">· 2m ago</span>
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-14 left-[108px] z-10"
                >
                  <span className="flex h-3 w-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
                </motion.div>

                <motion.div
                  className="absolute bottom-14 left-[108px] z-0"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                >
                  <span className="flex h-3 w-3 rounded-full bg-primary/30" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl border border-border bg-white p-5 shadow-lg shadow-black/5"
        >
          <AnimatedCounter value="100+" label="Verified Bhatas" icon={<MapPin className="h-4 w-4" />} />
          <AnimatedCounter value="50,000+" label="Bricks Delivered" icon={<Truck className="h-4 w-4" />} />
          <AnimatedCounter value="99%" label="Satisfaction Rate" icon={<Search className="h-4 w-4" />} />
          <AnimatedCounter value="2,500+" label="Happy Builders" icon={<Users className="h-4 w-4" />} />
        </motion.div>
      </div>
    </section>
  );
}
