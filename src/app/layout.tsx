import type { Metadata, Viewport } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import Providers from "./providers";
import { getEnv } from "@/lib/env";
import Link from "next/link";

const { NEXT_PUBLIC_APP_URL } = getEnv();
const appUrl = NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FBFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1724" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Ameenly — Share duas, receive duas",
  description:
    "Submit duas and make duas for others. Ramadan is the month of dua.",
  keywords: ["dua", "Ramadan", "prayer", "Islamic", "Ameenly"],
  authors: [{ name: "Ameenly" }],
  creator: "Ameenly",
  publisher: "Ameenly",
  openGraph: {
    title: "Ameenly — Share duas, receive duas",
    description:
      "Submit duas and make duas for others. Ramadan is the month of dua.",
    url: appUrl,
    siteName: "Ameenly",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ameenly — Share duas, receive duas",
    description:
      "Submit duas and make duas for others. Ramadan is the month of dua.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <ClerkProvider afterSignOutUrl="/">
          {/* ─── Background orbs ─── */}
          <div className="bg-orbs" aria-hidden="true" />

          {/* ─── Top bar ─── */}
          <header className="top-bar">
            <div className="top-bar-inner">
              <Link href="/" className="top-bar-brand">
                Ameen<span>ly</span>
              </Link>
              <nav className="top-bar-nav">
                <Show when="signed-in">
                  <Link href="/profile" className="top-bar-link">
                    My Duas
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link href="/groups" className="top-bar-link">
                    My Groups
                  </Link>
                </Show>
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="btn-ameen"
                      style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.8rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border-glow)",
                        background: "transparent",
                        color: "var(--text-accent)",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </nav>
            </div>
          </header>

          <Providers>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only"
              style={{
                position: "absolute",
                zIndex: 999,
                top: "8px",
                left: "8px",
                padding: "8px 16px",
                background: "var(--btn-bg)",
                color: "var(--btn-text)",
                borderRadius: "8px",
              }}
            >
              Skip to main content
            </a>

            <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

            <footer className="app-footer">
              <div className="app-footer-inner">
                <p>
                  Guests can post 1 public dua every 24 hours by IP. Signed-in
                  users can post up to 50 duas per hour and use private groups.
                </p>
                <nav aria-label="Legal" style={{ display: "flex", gap: "16px" }}>
                  <a href="/privacy">Privacy</a>
                  <a href="/terms">Terms</a>
                </nav>
              </div>
            </footer>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
