import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AppInit } from "@/components/app-init";

// Humanist serif for mission prose; clean sans for UI. Exposed as the CSS vars
// that tokens.css consumes (--font-prose / --font-ui).
const prose = Fraunces({
  subsets: ["latin"],
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#161512" },
  ],
  // Let content extend under the notch; tokens.css adds safe-area padding.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${prose.variable} ${ui.variable}`}>
      <body className="min-h-dvh">
        <AppInit />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-paper-raised focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <main id="main" className="mx-auto w-full max-w-xl px-4 pb-28 pt-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

function BottomNav() {
  const items = [
    { href: "/", label: "Today" },
    { href: "/diary", label: "Diary" },
    { href: "/settings", label: "Settings" },
  ];
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {items.map((it) => (
          <li key={it.href} className="flex-1">
            <Link
              href={it.href}
              className="flex flex-col items-center gap-1 px-2 py-3 text-sm text-ink-soft hover:text-ink"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
