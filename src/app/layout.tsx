import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Providers from "@/app/providers";
import { getEnv } from "@/lib/env";
import { FloatingTabBar } from "@/components/FloatingTabBar";

const { NEXT_PUBLIC_APP_URL } = getEnv();
const appUrl = NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const siteDescription =
  "Ameenly is the free online dua wall where Muslims share duas and say Ameen for each other. Submit a prayer request, receive duas from the community, and join private dua circles. The dua wall you've been looking for — also known as DuaWall.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${appUrl}/#website`,
      url: appUrl,
      name: "Ameenly",
      alternateName: ["Dua Wall", "DuaWall", "Ameenly Dua Wall", "Online Dua Wall"],
      description: siteDescription,
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${appUrl}/#organization`,
      name: "Ameenly",
      alternateName: ["DuaWall", "Dua Wall"],
      url: appUrl,
      logo: {
        "@type": "ImageObject",
        url: `${appUrl}/logo.png`,
      },
      sameAs: [],
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FBFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1724" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Ameenly — The Online Dua Wall",
    template: "%s | Ameenly",
  },
  description: siteDescription,
  keywords: [
    "ameenly",
    "dua wall",
    "duawall",
    "online dua wall",
    "dua",
    "duas",
    "Islamic prayer",
    "Muslim dua",
    "share dua",
    "say ameen",
    "dua request",
    "Ramadan dua",
    "dua for others",
    "Islamic prayer wall",
    "Muslim prayer wall",
    "dua circle",
    "private dua group",
    "Muslim prayer",
    "prayer wall",
    "prayer request",
    "ameen",
  ],
  authors: [{ name: "Ameenly" }],
  creator: "Ameenly",
  publisher: "Ameenly",
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: "Ameenly — The Online Dua Wall",
    description: siteDescription,
    url: appUrl,
    siteName: "Ameenly",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${appUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "Ameenly — The Online Dua Wall",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ameenly — The Online Dua Wall",
    description: siteDescription,
    images: [`${appUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ClerkProvider
          afterSignOutUrl="/"
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          dynamic
        >
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

            <div
              className="main-content-wrapper"
              style={{ position: "relative", zIndex: 1 }}
            >
              {children}
            </div>

            <FloatingTabBar />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
