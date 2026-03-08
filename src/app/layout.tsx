import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Providers from "./providers";
import { getEnv } from "@/lib/env";
import { FloatingTabBar } from "@/components/FloatingTabBar";

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

            <FloatingTabBar />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
