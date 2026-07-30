"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Menu, X, LayoutDashboard, LogOut, Search, ChevronDown } from "lucide-react";
import { BrickIcon } from "@/components/brick-icon";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const links = [
    { href: "/", label: "Home" },
    { href: "/bhatas", label: "Find Bhatas" },
  ];

  const dashboardLink = isLoggedIn
    ? role === "ADMIN"
      ? "/dashboard/admin"
      : role === "OWNER"
      ? "/dashboard/owner"
      : "/dashboard/customer"
    : null;

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-white/95 backdrop-blur-xl shadow-sm"
          : "border-b border-transparent bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.08 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-dark to-primary shadow-md"
            >
              <BrickIcon size={22} animate={false} />
            </motion.div>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}>
              Brick<span className="text-primary">Building</span>
            </span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-text-secondary hover:text-text hover:bg-surface-elevated"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {isLoggedIn ? (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                {dashboardLink && (
                  <Link href={dashboardLink}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-text-secondary">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-1.5 text-text-secondary hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white shadow-sm">
                  {session.user.name?.[0] || session.user.email?.[0] || "U"}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-text-secondary">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-text-secondary hover:bg-surface-elevated transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary-lighter text-primary"
                      : "text-text-secondary hover:bg-surface-elevated"
                  )}
                >
                  {link.label === "Find Bhatas" && <Search className="h-4 w-4" />}
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              {isLoggedIn ? (
                <>
                  {dashboardLink && (
                    <Link
                      href={dashboardLink}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-center bg-primary text-white shadow-sm hover:bg-primary-dark"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
