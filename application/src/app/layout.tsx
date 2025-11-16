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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
        <main>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
          <GoogleAnalytics gaId="G-Z50F6SX483" />
        </main>
      </body>
    </html>
  );
}