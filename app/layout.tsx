import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SITE_URL, BASE_KEYWORDS } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "gobench.dev — Go Benchmark Comparisons";
const DEFAULT_DESCRIPTION =
  "Compare the speed of different ways to do the same thing in Go. Interactive benchmark charts for Go performance patterns.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s — gobench.dev",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: BASE_KEYWORDS,
  authors: [{ name: "Marvin Wendt", url: "https://mjw.dev" }],
  creator: "Marvin Wendt",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "gobench.dev",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
