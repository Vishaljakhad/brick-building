"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedHero } from "@/components/animated-hero";
import { BrickIcon } from "@/components/brick-icon";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="16" width="4" height="3" rx="0.5"/>
        <rect x="17" y="16" width="4" height="3" rx="0.5"/>
      </svg>
    ),
    title: "Nearest Bhatas",
    desc: "Find the closest brick kilns near your construction site. Save on transportation costs.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <rect x="1" y="13" width="22" height="7" rx="1.5"/>
        <rect x="4" y="9" width="16" height="4" rx="1"/>
        <rect x="6" y="5" width="12" height="4" rx="1"/>
        <circle cx="5" cy="20" r="2" fill="currentColor" stroke="none"/>
        <circle cx="19" cy="20" r="2" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title: "Truck Capacity Calc",
    desc: "Know exactly how many bricks fit in each truck type. Plan your delivery efficiently.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" strokeLinejoin="round"/>
        <rect x="8.5" y="10" width="7" height="4" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
    title: "Fair Prices",
    desc: "Admin-set base prices with kiln-specific adjustments. No hidden charges or middlemen.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <circle cx="12" cy="12" r="9"/>
        <polyline points="12,7 12,12 16,14"/>
        <rect x="8" y="2" width="8" height="2" rx="0.5"/>
      </svg>
    ),
    title: "Delivery Estimates",
    desc: "Get accurate delivery time estimates based on distance and truck availability.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <rect x="3" y="4" width="18" height="5" rx="1"/>
        <rect x="3" y="11" width="18" height="5" rx="1"/>
        <rect x="3" y="18" width="18" height="3" rx="1"/>
        <rect x="5" y="6" width="4" height="1" opacity="0.4"/>
        <rect x="5" y="13" width="4" height="1" opacity="0.4"/>
      </svg>
    ),
    title: "Multiple Brick Types",
    desc: "Standard bricks, hollow bricks, fly ash bricks, and more. Choose what fits your project.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        <polyline points="2,12 22,12"/>
      </svg>
    ),
    title: "Order Tracking",
    desc: "Track your order from confirmation to delivery. Know exactly when your bricks arrive.",
  },
];

export default function Home() {
  return (
    <div>
      <AnimatedHero />

      <section className="border-t border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              Why Choose BrickBuilding?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-gray-600"
            >
              We make brick ordering simple, transparent, and reliable
            </motion.p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-amber-800 py-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 rotate-12"><BrickIcon size={40} animate={false} /></div>
          <div className="absolute bottom-10 right-20 -rotate-6"><BrickIcon size={32} animate={false} /></div>
          <div className="absolute top-1/2 right-10 rotate-45"><BrickIcon size={24} animate={false} /></div>
          <div className="absolute bottom-20 left-1/4 -rotate-12"><BrickIcon size={28} animate={false} /></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Ready to Start Building?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto"
          >
            Join BrickBuilding today — whether you are a buyer looking for bricks or a
            kiln owner wanting to reach more customers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex justify-center gap-4 flex-wrap"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-orange-700 hover:bg-orange-50 shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 font-semibold"
              >
                I Want to Buy Bricks
              </Button>
            </Link>
            <Link href="/register?role=owner">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/80 text-white hover:bg-white/10 hover:border-white shadow-xl shadow-black/10 transition-all duration-200 font-semibold"
              >
                I Own a Bhata
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <BrickIcon size={28} animate={false} />
              <span className="text-lg font-bold text-gray-900">
                Brick<span className="text-orange-600">Building</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2026 BrickBuilding. Building India, brick by brick.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -top-6 -right-6 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
        <BrickIcon size={60} animate={false} />
      </div>
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">{title}</h3>
        <p className="mt-2 text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
