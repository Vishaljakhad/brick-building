import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedHero } from "@/components/animated-hero";

export default function Home() {
  return (
    <div>
      <AnimatedHero />

      <section className="border-t border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose BrickBuilding?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We make brick ordering simple, transparent, and reliable
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="📍"
              title="Nearest Bhatas"
              desc="Find the closest brick kilns near your construction site. Save on transportation costs."
              delay={0}
            />
            <FeatureCard
              icon="🚛"
              title="Truck Capacity Calc"
              desc="Know exactly how many bricks fit in each truck type. Plan your delivery efficiently."
              delay={0.1}
            />
            <FeatureCard
              icon="🛡️"
              title="Fair Prices"
              desc="Admin-set base prices with kiln-specific adjustments. No hidden charges or middlemen."
              delay={0.2}
            />
            <FeatureCard
              icon="⏱️"
              title="Delivery Estimates"
              desc="Get accurate delivery time estimates based on distance and truck availability."
              delay={0.3}
            />
            <FeatureCard
              icon="🧱"
              title="Multiple Brick Types"
              desc="Standard bricks, hollow bricks, fly ash bricks, and more. Choose what fits your project."
              delay={0.4}
            />
            <FeatureCard
              icon="📦"
              title="Order Tracking"
              desc="Track your order from confirmation to delivery. Know exactly when your bricks arrive."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-amber-800 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Start Building?
          </h2>
          <p className="mt-4 text-lg text-orange-100">
            Join BrickBuilding today — whether you are a buyer looking for bricks or a
            kiln owner wanting to reach more customers.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
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
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700">
                <span className="text-white font-bold text-sm">B</span>
              </div>
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

function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 text-xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">{title}</h3>
        <p className="mt-2 text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
