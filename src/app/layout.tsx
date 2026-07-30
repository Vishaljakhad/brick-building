import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrickBuilding — India's B2B Brick Marketplace",
  description: "Order bricks from verified kilns near you. Compare prices, check truck capacity, and get deliveries on time.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-surface antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                background: "#fff",
                color: "#1a1a1a",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid #e5e0d8",
                fontSize: "14px",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
              },
              success: {
                iconTheme: { primary: "#16a34a", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#dc2626", secondary: "#fff" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
