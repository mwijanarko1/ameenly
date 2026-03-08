import Link from "next/link";

export const metadata = {
  title: "Terms | Ameenly",
  description: "Terms of use for Ameenly.",
};

export default function TermsPage() {
  return (
    <main id="main-content" className="page-container" style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: "768px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        <Link href="/" className="top-bar-link">
          ← Back to Home
        </Link>
        <header style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1 className="page-title" style={{ fontSize: "1.75rem" }}>Terms of Use</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Use Ameenly respectfully. Do not submit unlawful, abusive, or private information you do not have the
            right to share.
          </p>
        </header>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)" }}>Public Wall</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Public wall posts are visible to anyone visiting the site. Do not post confidential information, medical
            details, or identifying information for other people without permission.
          </p>
        </div>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)" }}>Private Groups</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Private groups are limited to invited members, but group administrators are responsible for who they invite
            and for moderating the content shared inside their groups.
          </p>
        </div>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)" }}>Service Operation</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            The site owner may remove content, suspend access, or rotate invite links to protect the service and its
            users.
          </p>
        </div>
      </div>
    </main>
  );
}
