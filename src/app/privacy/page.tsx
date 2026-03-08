import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Ameenly",
  description: "Privacy information for Ameenly.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="page-container" style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: "768px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        <Link href="/" className="top-bar-link">
          ← Back to Home
        </Link>
        <header style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1 className="page-title" style={{ fontSize: "1.75rem" }}>Privacy Policy</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Ameenly stores the information needed to publish duas, manage private groups, and secure the service.
          </p>
        </header>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)" }}>What Is Collected</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Public wall submissions include the dua text and an optional display name. Private groups store account
            details provided by Clerk, group membership, and group dua posts.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            To protect the public wall from abuse, the server stores a hashed representation of the submitting IP
            address for rate limiting.
          </p>
        </div>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)" }}>How Data Is Used</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Submission data is used to display duas, allow invited members to collaborate in private groups, and keep
            the service secure.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Authentication is handled by Clerk. Real-time application data is stored in Convex.
          </p>
        </div>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)" }}>Your Choices</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Only include a name on the public wall if you want it shown publicly. Group owners can remove members from
            private groups, and administrators can delete group duas.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            If you operate this deployment, publish a contact method so users can request access, correction, or
            deletion of their personal data.
          </p>
        </div>
      </div>
    </main>
  );
}
