import Link from "next/link";
import { getLegalConfig } from "@/lib/legal";

export const metadata = {
  title: "Terms | Ameenly",
  description: "Terms of use for Ameenly.",
};

const legalConfig = getLegalConfig();
const sectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
} as const;

export default function TermsPage() {
  return (
    <main
      id="main-content"
      className="page-container"
      style={{ minHeight: "100vh" }}
    >
      <div
        style={{
          maxWidth: "768px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <Link href="/" className="top-bar-link">
          ← Back to Home
        </Link>
        <header style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1 className="page-title" style={{ fontSize: "1.75rem" }}>
            Terms of Use
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Last updated March 8, 2026.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Use Ameenly respectfully. Do not submit unlawful, abusive, or
            private information you do not have the right to share.
          </p>
        </header>

        <div className="glass-panel" style={sectionStyle}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Acceptable Use
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Public wall posts are visible to anyone visiting the site. Do not
            post confidential information, medical details, identifying
            information for other people, unlawful content, harassment, or
            material you do not have permission to share.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Guests can post 1 public dua every 24 hours by IP-based rate limit.
            Signed-in users can post up to 50 duas per hour and use private
            groups.
          </p>
        </div>

        <div className="glass-panel" style={sectionStyle}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Accounts And Private Groups
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Private groups are limited to invited members, but group
            administrators are responsible for who they invite and for
            moderating the content shared inside their groups.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            You must be at least 13 years old to use Ameenly. If you create an
            account or join a group, you are responsible for keeping your
            authentication method secure and for activity that occurs through
            your account.
          </p>
        </div>

        <div className="glass-panel" style={sectionStyle}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Content Moderation And Service Operation
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            The site owner may remove content, suspend access, rotate invite
            links, or limit abusive activity to protect the service and its
            users.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Ameenly is provided on an as-available basis. Features may change,
            pause, or stop if required for maintenance, security, or legal
            compliance.
          </p>
        </div>

        <div className="glass-panel" style={sectionStyle}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Privacy And Consumer Information
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Your use of Ameenly is also governed by the{" "}
            <Link href="/privacy">Privacy Policy</Link>, which explains how
            personal data is collected, used, and retained.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Operator: {legalConfig.legalEntityName}
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Postal address:{" "}
            {legalConfig.postalAddress ??
              "Set NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS before production deployment."}
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Support contact:{" "}
            <a href={legalConfig.supportHref}>
              {legalConfig.contactEmail ?? "Set NEXT_PUBLIC_CONTACT_EMAIL before production deployment."}
            </a>
          </p>
        </div>

        <div className="glass-panel" style={sectionStyle}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Applicable Law
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            These terms are governed by the laws that apply to the operator's
            principal place of business, except where mandatory consumer or
            privacy law in your place of residence provides otherwise.
          </p>
        </div>
      </div>
    </main>
  );
}
