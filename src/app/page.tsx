"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedHero } from "@/components/animated-hero";
import { BrickIcon } from "@/components/brick-icon";
import {
  MapPin, Truck, Shield, Clock, LayoutGrid, Package, Star,
  Search, ChevronRight, Building2, Users, ExternalLink, ArrowRight
} from "lucide-react";

const features = [
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Nearest Bhatas",
    desc: "Find the closest brick kilns near your construction site and save on transportation costs.",
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Truck Capacity Calc",
    desc: "Know exactly how many bricks fit in each truck type and plan your delivery efficiently.",
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
    desc: "Track your order from confirmation to delivery and know exactly when your bricks arrive.",
  },
];

const howItWorks = [
  {
    step: 1,
    icon: <Search className="h-6 w-6" />,
    title: "Search Bhatas",
    desc: "Browse verified brick kilns near your construction site. Filter by location, brick type, and price range.",
  },
  {
    step: 2,
    icon: <LayoutGrid className="h-6 w-6" />,
    title: "Compare & Calculate",
    desc: "Compare prices across kilns. Use our truck calculator to determine exact load sizes and costs.",
  },
  {
    step: 3,
    icon: <Package className="h-6 w-6" />,
    title: "Order & Track",
    desc: "Place your order with a few taps. Track delivery in real-time from kiln to your site.",
  },
];

const testimonials = [
  {
    name: "Sunil Verma",
    role: "Builder, Mumbai",
    text: "Saved hours of calling around. Compared prices across 5 kilns and placed an order in 10 minutes.",
    rating: 5,
    gradient: "from-primary to-primary-dark",
  },
  {
    name: "Rajesh Patel",
    role: "Contractor, Ahmedabad",
    text: "The truck capacity calculator is brilliant. Ordered exactly the right load — no shortage, no wastage.",
    rating: 5,
    gradient: "from-amber-600 to-orange-600",
  },
  {
    name: "Anita Desai",
    role: "Architect, Pune",
    text: "Finally a platform that brings transparency to brick sourcing. The delivery tracking is a game changer.",
    rating: 5,
    gradient: "from-primary-dark to-primary",
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

      <section className="bg-white py-20 sm:py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="How It Works"
            subtitle="Three simple steps to get your bricks delivered"
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-3 relative">
            <div className="hidden sm:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-border" />
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 relative z-10">
                  {item.icon}
                </div>
                <div className="mt-2 mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-lighter text-primary text-xs font-bold">
                  {item.step}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-text">{item.title}</h3>
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                className="group relative rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
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

      <section className="bg-white py-20 sm:py-24 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Trusted by builders across India"
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
                className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white shadow-sm`}>
                    {t.name.split(" ").map(n => n[0]).join("")}
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

      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Join the right side"
            subtitle="Whether you're buying or selling, BrickBuilding works for you"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="group relative rounded-xl border-2 border-border bg-white p-8 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-lighter text-primary mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-text" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>
                I&apos;m a Buyer
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Find verified kilns near you, compare prices, and get your bricks delivered on time. No middlemen, fair rates.
              </p>
              <ul className="mt-4 space-y-2">
                {["Browse 100+ verified kilns", "Compare prices in one view", "Track delivery in real-time"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button className="mt-6 w-full bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 gap-2">
                  Get Started as Buyer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative rounded-xl border-2 border-border bg-white p-8 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-lighter text-primary mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-text" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>
                I Own a Bhata
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                List your kiln, set your prices, and reach thousands of builders looking for quality bricks.
              </p>
              <ul className="mt-4 space-y-2">
                {["Reach more customers online", "Set your own prices & stock", "Manage orders from one dashboard"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register?role=owner">
                <Button variant="outline" className="mt-6 w-full border-2 border-border hover:border-primary/40 hover:bg-primary-lighter transition-all duration-200 gap-2 text-text-secondary hover:text-primary">
                  Register Your Bhata
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <BrickIcon size={24} animate={false} />
                <span className="text-base font-bold" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>
                  Brick<span className="text-primary">Building</span>
                </span>
              </div>
              <p className="text-sm text-text-tertiary leading-relaxed max-w-xs">
                India&apos;s B2B marketplace connecting builders directly with verified brick kilns.
              </p>
              <div className="flex items-center gap-3 mt-4">
                {[
                  { icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>, href: "#" },
                  { icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>, href: "#" },
                  { icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>, href: "#" },
                ].map((social, i) => (
                  <Link key={i} href={social.href} className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-tertiary hover:bg-primary hover:text-white transition-all duration-200">
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text mb-4">Company</h4>
              <ul className="space-y-2.5">
                {["About", "Contact", "Careers", "Blog"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-text-tertiary hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text mb-4">Product</h4>
              <ul className="space-y-2.5">
                {["Features", "Pricing", "How It Works", "FAQ"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-text-tertiary hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text mb-4">Trust & Safety</h4>
              <div className="space-y-3">
                {[
                  { label: "Verified Kilns", desc: "All kilns are manually verified" },
                  { label: "Secure Payments", desc: "Protected transactions" },
                  { label: "Fair Pricing", desc: "Admin-monitored rates" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50">
                      <Shield className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text">{item.label}</p>
                      <p className="text-[11px] text-text-tertiary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-text-tertiary">
              &copy; 2026 BrickBuilding. Building India, brick by brick.
            </p>
            <div className="flex gap-4 text-xs text-text-tertiary">
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
