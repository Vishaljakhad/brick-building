"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedHero } from "@/components/animated-hero";
import { BrickIcon } from "@/components/brick-icon";
import { MapPin, Truck, Shield, Clock, LayoutGrid, Package, Star, ChevronRight } from "lucide-react";

const features = [
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Nearest Bhatas",
    desc: "Find the closest brick kilns near your construction site. Save on transportation costs.",
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Truck Capacity Calc",
    desc: "Know exactly how many bricks fit in each truck type. Plan your delivery efficiently.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Fair Prices",
    desc: "Admin-set base prices with kiln-specific adjustments. No hidden charges or middlemen.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Delivery Estimates",
    desc: "Get accurate delivery time estimates based on distance and truck availability.",
  },
  {
    icon: <LayoutGrid className="h-5 w-5" />,
    title: "Multiple Brick Types",
    desc: "Standard bricks, hollow bricks, fly ash bricks, and more. Choose what fits your project.",
  },
  {
    icon: <Package className="h-5 w-5" />,
    title: "Order Tracking",
    desc: "Track your order from confirmation to delivery. Know exactly when your bricks arrive.",
  },
];

const testimonials = [
  {
    name: "Sunil Verma",
    role: "Builder, Mumbai",
    text: "BrickBuilding saved me hours of calling around. Compared prices across 5 kilns and placed an order in 10 minutes.",
    rating: 5,
    initial: "S",
  },
  {
    name: "Rajesh Patel",
    role: "Contractor, Ahmedabad",
    text: "The truck capacity calculator is brilliant. Ordered exactly the right load — no shortage, no wastage.",
    rating: 5,
    initial: "R",
  },
  {
    name: "Anita Desai",
    role: "Architect, Pune",
    text: "Finally a platform that brings transparency to brick sourcing. The delivery tracking is a game changer.",
    rating: 5,
    initial: "A",
  },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold sm:text-4xl leading-tight"
        style={{ fontFamily: "var(--font-sora), system-ui, sans-serif", color: "#1a1a1a" }}
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
        className="mt-3 text-lg text-text-secondary"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <AnimatedHero />

      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Everything you need to source bricks"
            subtitle="A complete procurement platform for construction professionals"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group relative rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-lighter/0 to-primary-lighter/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-lighter text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-text group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-border py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4 items-center">
            <div className="lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Platform Stats</p>
              <h3 className="text-2xl font-bold mt-2 leading-tight" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>
                Growing across India
              </h3>
              <p className="text-sm text-text-secondary mt-2">Trusted by contractors, builders, and architects nationwide.</p>
            </div>
            {[
              { value: "100+", label: "Verified Bhatas", icon: <MapPin className="h-5 w-5" />, suffix: "" },
              { value: "50,000+", label: "Bricks Delivered", icon: <Truck className="h-5 w-5" />, suffix: "" },
              { value: "99%", label: "Satisfaction Rate", icon: <Star className="h-5 w-5" />, suffix: "%" },
              { value: "2,500+", label: "Happy Builders", icon: <Shield className="h-5 w-5" />, suffix: "+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-surface p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary mb-3">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-text" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-xs text-text-secondary font-medium mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Trusted by builders"
            subtitle="Hear from construction professionals using BrickBuilding"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{t.name}</p>
                    <p className="text-xs text-text-tertiary">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-20">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-8 left-10 rotate-12"><BrickIcon size={48} animate={false} /></div>
          <div className="absolute bottom-10 right-20 -rotate-6"><BrickIcon size={40} animate={false} /></div>
          <div className="absolute top-1/3 right-10 rotate-45"><BrickIcon size={28} animate={false} /></div>
          <div className="absolute bottom-16 left-1/4 -rotate-12"><BrickIcon size={32} animate={false} /></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 relative">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white sm:text-4xl leading-tight"
            style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}
          >
            Ready to source your next load?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-3 text-lg text-white/80 max-w-xl mx-auto"
          >
            Join thousands of builders getting better prices and reliable deliveries.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex justify-center gap-3 flex-wrap"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-orange-50 shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 font-semibold text-base px-8"
              >
                I Want to Buy Bricks
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/register?role=owner">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-200 font-semibold text-base px-8"
              >
                I Own a Bhata
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <BrickIcon size={26} animate={false} />
              <span className="text-base font-bold" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>
                Brick<span className="text-primary">Building</span>
              </span>
            </div>
            <p className="text-xs text-text-tertiary">
              &copy; 2026 BrickBuilding. Building India, brick by brick.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
