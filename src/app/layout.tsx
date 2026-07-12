import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppInit } from "@/components/app-init";
import { BottomNav } from "@/components/bottom-nav";
import { RouteTransition } from "@/components/route-transition";

/* Monograph plate face: high-contrast garalde for titles and invitations.
 * 500 is the workhorse (400 is too frail on screen); 600 carries plate titles. */
const prose = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-prose",
  display: "swap",
});
const ui = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FrameWalk",
  description:
    "A calm photo-walk companion. A reason to go shoot, gentle approach coaching, a fast cull, and a private story diary. On-device, no account.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "FrameWalk" },
};

export const viewport: Viewport = {
  // Mirrors --paper in src/styles/tokens.css (meta tags can't read CSS vars);
  // update both together, plus public/manifest.webmanifest.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1b19" },
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

const themeInit =
  "try{var t=localStorage.getItem('framewalk-theme');" +
  "if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${prose.variable} ${ui.variable}`}
    >
      <body className="min-h-dvh">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <AppInit />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-paper-raised focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {/* Desktop widens the stage to an open-book spread; the cull section's
            negative margins mirror px-4/lg:px-8 — change them together. */}
        <main
          id="main"
          className="mx-auto w-full max-w-xl px-4 pb-28 pt-6 lg:max-w-4xl lg:px-8 lg:pt-10"
        >
          <RouteTransition>{children}</RouteTransition>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
