// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import "@/styles/globals.css";
import { AnimatePresence } from 'framer-motion';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://abay.tech";
const SITE_DESC = "ML, systems, and writing by Abay Bektursun.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Abay Bektursun",
    template: "%s — abay.tech",
  },
  description: SITE_DESC,
  openGraph: {
    title: "Abay Bektursun",
    description: SITE_DESC,
    url: SITE_URL,
    siteName: "abay.tech",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abay Bektursun",
    description: SITE_DESC,
    creator: "@abaybektursun",
  },
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
        <main className="py-8">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
          <GoogleAnalytics gaId="G-Z50F6SX483" />
        </main>
      </body>
    </html>
  );
}