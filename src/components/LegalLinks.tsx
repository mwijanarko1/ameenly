import Link from "next/link";
import { getLegalConfig } from "@/lib/legal";

function LegalChevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ marginLeft: "auto", opacity: 0.4 }}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function LegalLinks() {
  const legalConfig = getLegalConfig();

  return (
    <>
      <Link href="/privacy" className="profile-legal-link">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Privacy Policy</span>
        <LegalChevron />
      </Link>
      <Link href="/terms" className="profile-legal-link">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
        <span>Terms of Use</span>
        <LegalChevron />
      </Link>
      <a href={legalConfig.supportHref} className="profile-legal-link">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92V19a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 3.18 2 2 0 0 1 4.11 1h2.09a2 2 0 0 1 2 1.72l.36 2.57a2 2 0 0 1-.57 1.73L6.7 8.3a16 16 0 0 0 9 9l1.28-1.29a2 2 0 0 1 1.73-.57l2.57.36A2 2 0 0 1 22 16.92z" />
        </svg>
        <span>
          {legalConfig.contactEmail
            ? "Contact Support"
            : "Contact & Data Requests"}
        </span>
        <LegalChevron />
      </a>
    </>
  );
}
