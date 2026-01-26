/**
 * @file layout.tsx
 * @description Root layout for The Tech Deputies application.
 * Provides consistent header, footer, and skip links for accessibility.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/components/atoms";
import { Header, Footer } from "@/components/organisms";
import { SessionProvider } from "@/components/organisms/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Tech Deputies - Tech Education & Support",
    template: "%s | The Tech Deputies",
  },
  description:
    "Your trusted partners for tech education and support. Book sessions, purchase subscriptions, and learn technology with confidence.",
  keywords: [
    "tech support",
    "tech education",
    "computer help",
    "technology training",
    "IT support",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <SessionProvider>
          {/* Accessibility: Skip to main content link */}
          <SkipLink targetId="main-content" />

          {/* Header with navigation */}
          <Header />

          {/* Main content area */}
          <main
            id="main-content"
            className="flex-1"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

