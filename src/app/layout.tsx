import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import SupportWidget from "@/components/SupportWidget";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://finallypeace.com"),
  title: "Finally Peace — A subscription for what comes next.",
  description:
    "End-of-life planning, rebuilt as one simple $15/month subscription. Customize your funeral, transportation, and legal documents in your secure profile — so your family never has to plan on the worst week of their life.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Finally Peace — $15 a month. For what comes next.",
    description:
      "End-of-life planning, rebuilt as one simple subscription. Funeral, transportation, and legal documents — saved in your secure profile.",
    type: "website",
    url: "https://finally-peace.com",
    siteName: "Finally Peace",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Finally Peace",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1837",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full">
        {children}
        <SupportWidget />
        {/* Lottie web component player (free, no API key required) */}
        <Script
          src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js"
          type="module"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
