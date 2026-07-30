"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Truck, TrendingUp, Shield, Clock } from "lucide-react";
import { BrickIcon, StackedBricks } from "@/components/brick-icon";

function KilnScene() {
  return (
    <svg viewBox="0 0 500 380" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f5f2" />
          <stop offset="100%" stopColor="#f0ede8" />
        </linearGradient>
        <linearGradient id="kiln" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c1440e" />
          <stop offset="100%" stopColor="#9a3308" />
        </linearGradient>
        <linearGradient id="brickGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c1440e" />
          <stop offset="50%" stopColor="#e86b2a" />
          <stop offset="100%" stopColor="#9a3308" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e5e0d8" />
          <stop offset="100%" stopColor="#d6d0c8" />
        </linearGradient>
        <linearGradient id="smoke" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#d6d0c8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f0ede8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="500" height="380" fill="url(#sky)" rx="16" />
      <rect y="280" width="500" height="100" fill="url(#ground)" rx="0" />
      <rect y="280" width="500" height="4" fill="#d6d0c8" />

      <path d="M100 280l40-140h120l40 140" fill="url(#kiln)" opacity="0.85" />
      <rect x="105" y="200" width="150" height="80" rx="6" fill="url(#brickGrad)" />
      <rect x="105" y="200" width="150" height="80" rx="6" fill="rgba(0,0,0,0.05)" />
      <path d="M120 220h120M120 240h120M120 260h120" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <path d="M175 200v80" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <path d="M105 280h150v8H105z" fill="#7a2806" opacity="0.5" />
      <rect x="170" y="188" width="20" height="12" rx="3" fill="#7a2806" opacity="0.6" />

      <rect x="290" y="240" width="60" height="40" rx="3" fill="url(#brickGrad)" />
      <rect x="294" y="248" width="24" height="14" rx="1" fill="rgba(255,255,255,0.06)" />
      <rect x="322" y="248" width="24" height="14" rx="1" fill="rgba(255,255,255,0.06)" />
      <rect x="294" y="264" width="24" height="14" rx="1" fill="rgba(255,255,255,0.06)" />
      <rect x="322" y="264" width="24" height="14" rx="1" fill="rgba(255,255,255,0.06)" />

      <rect x="370" y="245" width="55" height="35" rx="3" fill="url(#brickGrad)" />
      <rect x="374" y="253" width="22" height="12" rx="1" fill="rgba(255,255,255,0.06)" />
      <rect x="400" y="253" width="22" height="12" rx="1" fill="rgba(255,255,255,0.06)" />

      <rect x="40" y="255" width="50" height="25" rx="3" fill="url(#brickGrad)" />
      <rect x="44" y="261" width="20" height="10" rx="1" fill="rgba(255,255,255,0.06)" />
      <rect x="68" y="261" width="20" height="10" rx="1" fill="rgba(255,255,255,0.06)" />
      <rect x="120" y="275" width="120" height="5" rx="1" fill="#7a2806" opacity="0.3" />

      <path d="M140 170c-6-3-15-2-20 2-4 3-6 8-4 12" stroke="url(#smoke)" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M155 160c-5-4-14-4-20 0-4 3-5 8-3 12" stroke="url(#smoke)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.3" />

      <rect x="220" y="270" width="60" height="10" rx="2" fill="#7a2806" opacity="0.4" />

      <circle cx="60" cy="260" r="3" fill="#c1440e" opacity="0.15" />
      <circle cx="440" cy="255" r="3" fill="#c1440e" opacity="0.15" />
      <circle cx="420" cy="260" r="2" fill="#c1440e" opacity="0.1" />
      <circle cx="80" cy="258" r="2" fill="#c1440e" opacity="0.1" />
    </svg>
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
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 text-base px-6 animate-glow gap-2">
                  <Search className="h-5 w-5" />
                  Source Bricks Now
                </Button>
              </Link>
              <Link href="/bhatas">
                <Button variant="outline" size="lg" className="border-2 border-border hover:border-primary/40 hover:bg-primary-lighter transition-all duration-200 text-base px-6 gap-2 text-text-secondary hover:text-primary">
                  <MapPin className="h-5 w-5" />
                  Browse Kilns
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-5 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-lighter">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <span className="text-text-secondary"><strong className="text-text">10,000+</strong> loads delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-lighter">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span className="text-text-secondary"><strong className="text-text">Verified</strong> suppliers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-lighter">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span className="text-text-secondary"><strong className="text-text">Same-day</strong> delivery</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-white shadow-xl shadow-black/5 overflow-hidden">
              <div className="aspect-[5/4] relative">
                <KilnScene />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="absolute -top-2 -right-2 rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                >
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-300" />
                  LIVE
                </motion.div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                <div className="px-4 py-3.5 text-center">
                  <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Bhatas</p>
                  <p className="text-xl font-bold text-text" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>100+</p>
                </div>
                <div className="px-4 py-3.5 text-center">
                  <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Delivered</p>
                  <p className="text-xl font-bold text-text" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>50K+</p>
                </div>
                <div className="px-4 py-3.5 text-center">
                  <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Satisfaction</p>
                  <p className="text-xl font-bold text-text" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>99%</p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="absolute -bottom-3 -left-3 rounded-xl bg-white border border-border px-5 py-2.5 shadow-lg hidden lg:flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-white">S</div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-dark text-[10px] font-bold text-white ring-2 ring-white">R</div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-white ring-2 ring-white">A</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-text">Trusted by builders</p>
                <p className="text-[11px] text-text-tertiary">across India</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
