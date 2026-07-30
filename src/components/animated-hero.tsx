"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { BrickIcon, StackedBricks, AnimatedBricks } from "@/components/brick-icon";

export function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <AnimatedBricks />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-orange-700 shadow-sm"
            >
              <BrickIcon size={18} animate={false} />
              India&apos;s Brick Marketplace
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
            >
              Build Your Dreams{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                Brick by Brick
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-lg text-gray-600 sm:text-xl max-w-xl"
            >
              Find the nearest brick kilns (bhatas), compare prices, check truck
              capacity, and get your bricks delivered on time. No middlemen, fair prices.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="text-base bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <Search className="h-5 w-5" />
                  Find Bricks Now
                </Button>
              </Link>
              <Link href="/bhatas">
                <Button variant="outline" size="lg" className="text-base border-2 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200">
                  <MapPin className="h-5 w-5" />
                  Browse Bhatas
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-6 text-sm text-gray-400"
            >
              <span className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                100+ Bhatas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                50K+ Bricks Delivered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                99% Satisfaction
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 1, -1, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 z-10"
              >
                <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 p-4 shadow-xl shadow-orange-300">
                  <BrickIcon size={32} />
                </div>
              </motion.div>

              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-2 shadow-xl">
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='5' y='35' width='90' height='30' rx='2' fill='%23c2410c' opacity='0.3'/%3E%3C/svg%3E")`,
                    backgroundSize: "60px 60px"
                  }} />
                  <div className="text-center relative z-10">
                    <StackedBricks count={4} size={36} />
                    <motion.p
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                      className="mt-4 text-3xl font-bold text-orange-800"
                    >
                      50,000+
                    </motion.p>
                    <p className="text-orange-600 font-medium">Bricks Delivered</p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="absolute -bottom-4 -left-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-white shadow-xl shadow-orange-300"
              >
                <p className="text-sm font-semibold">Trusted by 100s of builders</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="absolute -top-3 -left-3 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg"
              >
                LIVE
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
