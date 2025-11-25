import localFont from "next/font/local";

export const GeistSans = localFont({
  src: "../../public/fonts/GeistMono-Regular.woff", // Update path to your Geist Sans font file
  variable: "--font-geist-sans",
  display: "swap",
});

export const GeistMono = localFont({
  src: "../../public/fonts/GeistMono-Regular.woff", // Update path to your Geist Mono font file
  variable: "--font-geist-mono",
  display: "swap",
});
