import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Providers from "./providers";

// Initialize the Geist font with Latin subset
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Initialize the Geist Mono font with Latin subset
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

// Define metadata for better SEO
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Ameenly — Share duas, receive duas",
  description: "Submit duas and make duas for others. Ramadan is the month of dua.",
  keywords: ["dua", "Ramadan", "prayer", "Islamic", "Ameenly"],
  authors: [{ name: "Created with Cursor Agent" }],
  creator: "Cursor Agent",
  publisher: "Cursor Agent",
  openGraph: {
    title: "Ameenly — Share duas, receive duas",
    description: "Submit duas and make duas for others. Ramadan is the month of dua.",
    url: "https://nextjs.org/",
    siteName: "Ameenly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ameenly",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ameenly — Share duas, receive duas",
    description: "Submit duas and make duas for others. Ramadan is the month of dua.",
    images: ["/og-image.png"],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <ClerkProvider>
          <Providers>
            <a
              href="#main-content"
              className="absolute -top-12 left-4 z-50 px-4 py-2 bg-emerald-700 text-white rounded-md transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Skip to main content
            </a>
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
