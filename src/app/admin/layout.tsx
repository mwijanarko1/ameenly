import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Ameenly admin dashboard — moderation and site overview.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
