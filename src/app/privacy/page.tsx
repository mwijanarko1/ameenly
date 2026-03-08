import Link from "next/link";
import { getLegalConfig } from "@/lib/legal";

export const metadata = {
  title: "Privacy Policy | Ameenly",
  description: "Privacy information for Ameenly.",
};

const legalConfig = getLegalConfig();
const sectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
} as const;
const tableCellStyle = {
  padding: "12px 14px",
  borderBottom: "1px solid var(--border-subtle)",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  color: "var(--text-secondary)",
  fontSize: "0.92rem",
  lineHeight: 1.5,
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Last updated March 8, 2026.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            This policy explains what information Ameenly processes, why it is
            processed, which providers help run the service, and how to request
            access, correction, deletion, or other privacy rights.
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
            What We Collect
          </h2>
          <ul
            style={{
              color: "var(--text-secondary)",
              paddingLeft: "1.25rem",
              display: "grid",
              gap: "10px",
            }}
          >
            <li>
              Public and private dua content, optional display names, and
              anonymous posting choices.
            </li>
            <li>
              Account, group membership, and profile information supplied
              through Clerk when you sign in or join a private group.
            </li>
            <li>
              A hashed representation of a guest IP address for abuse
              prevention and rate limiting on public submissions.
            </li>
            <li>
              Essential session, authentication, and synchronization data used
              by Clerk and Convex to keep the app working.
            </li>
          </ul>
        </div>

        <div className="glass-panel" style={sectionStyle}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Why We Process It
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We process account and submission data to provide the service you
            request, including publishing duas, operating private groups,
            authenticating accounts, and syncing updates across devices.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            We also process limited technical data to protect the service,
            prevent abuse, investigate misuse, and enforce rate limits. Where
            local law applies, the legal bases are performance of a contract,
            legitimate interests in running a secure service, and your consent
            when you choose to submit content or contact us.
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
            Service Providers And Third Parties
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Clerk provides authentication and account session management. Convex
            stores application data and powers real-time updates. These
            providers only receive the data needed to deliver their part of the
            service.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Ameenly does not include a marketing or advertising tracker in this
            codebase. If that changes, this policy and any required consent
            controls must be updated before the tracker is enabled.
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
            Data Retention
          </h2>
          <ul
            style={{
              color: "var(--text-secondary)",
              paddingLeft: "1.25rem",
              display: "grid",
              gap: "10px",
            }}
          >
            <li>
              Public and group duas are retained until they are deleted by the
              poster, a group admin, or the site operator.
            </li>
            <li>
              Account and group membership records are retained while an account
              or group remains active and for a short period afterward to
              complete support, security, and deletion workflows.
            </li>
            <li>
              Guest IP hashes used for public-wall rate limiting are retained
              only for the period needed to enforce the 24-hour guest submission
              limit.
            </li>
            <li>
              Provider-side logs may be retained longer under Clerk, Convex, or
              hosting-provider security settings.
            </li>
          </ul>
        </div>

        <div className="glass-panel" style={sectionStyle}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Cookies And Essential Technologies
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Ameenly currently uses only essential authentication and application
            state technologies. No separate analytics or advertising cookie tool
            is configured in this repository.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "540px",
              }}
            >
              <thead>
                <tr>
                  <th style={tableCellStyle}>Provider</th>
                  <th style={tableCellStyle}>Type</th>
                  <th style={tableCellStyle}>Purpose</th>
                  <th style={tableCellStyle}>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tableCellStyle}>Clerk</td>
                  <td style={tableCellStyle}>Strictly necessary</td>
                  <td style={tableCellStyle}>
                    Maintains sign-in state, session security, and account
                    protection features.
                  </td>
                  <td style={tableCellStyle}>
                    Session length or Clerk-configured authentication lifetime.
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>Convex</td>
                  <td style={tableCellStyle}>Strictly necessary</td>
                  <td style={tableCellStyle}>
                    Keeps app data synchronized and maintains the real-time
                    application connection.
                  </td>
                  <td style={tableCellStyle}>
                    Active browser session or until the connection is closed.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel" style={sectionStyle}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Your Privacy Rights
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Depending on where you live, you may have rights to request access,
            correction, deletion, restriction, portability, or objection to the
            processing of your personal data.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            To make a request, contact{" "}
            <a href={legalConfig.privacyHref}>{legalConfig.privacyEmail ?? "the site operator"}</a>{" "}
            with enough detail for us to verify the request and locate the
            relevant account, group, or submission. We will respond within the
            timeframe required by applicable law.
          </p>
        </div>

        <div className="glass-panel" style={sectionStyle} id="us-privacy-rights">
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            U.S. State Privacy Notice
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            This codebase is designed without advertising pixels, data-broker
            integrations, or cross-context behavioral advertising features.
            Ameenly does not sell personal information for money based on the
            current implementation.
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            California and other U.S. residents may still request to know,
            access, correct, or delete personal information and may contact{" "}
            <a href={legalConfig.privacyHref}>{legalConfig.privacyEmail ?? "the site operator"}</a>{" "}
            to exercise those rights. If sale or sharing behavior is added in
            the future, this section and the footer privacy-choices link must be
            updated before launch.
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
            Children&apos;s Privacy
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Ameenly is not intended for children under 13. Do not create an
            account, join groups, or submit personal information if you are
            under 13. If you believe a child under 13 has provided personal
            information, contact us so we can review and remove it.
          </p>
        </div>

        <div className="glass-panel" style={sectionStyle} id="contact-us">
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Contact Us
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Legal entity: {legalConfig.legalEntityName}
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Postal address:{" "}
            {legalConfig.postalAddress ??
              "Set NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS before production deployment."}
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            Privacy contact:{" "}
            <a href={legalConfig.privacyHref}>
              {legalConfig.privacyEmail ?? "Set NEXT_PUBLIC_PRIVACY_EMAIL before production deployment."}
            </a>
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            General support:{" "}
            <a href={legalConfig.supportHref}>
              {legalConfig.contactEmail ?? "Use the privacy contact until a dedicated support email is configured."}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
