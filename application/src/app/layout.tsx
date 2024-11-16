// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import "@/styles/globals.css";
import { AnimatePresence } from 'framer-motion';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Abay Bektursun",
  description: "Portfolio and Blog",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-white text-gray-700 antialiased ${inter.className}`}>
        <Header />
        <main className="py-14">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
          <GoogleAnalytics gaId="G-E2WDH18DG3" />
        </main>
      </body>
    </html>
  );
}