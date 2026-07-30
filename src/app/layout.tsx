import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrickBuilding - Find & Order Bricks from Local Bhatas",
  description: "Order bricks from the nearest brick kilns. Compare prices, check truck capacity, and get delivery estimates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
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
                color: "#0f172a",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
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
