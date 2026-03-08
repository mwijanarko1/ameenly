import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { LegalLinks } from "@/components/LegalLinks";

export const metadata = {
  title: "Sign In | Ameenly",
  description: "Sign in to join groups, track your duas, and say Ameen.",
};

export default function SignInPage() {
  return (
    <main id="main-content" className="page-container auth-page-shell">
      <div className="auth-clerk-wrapper">
        <div className="auth-clerk-center">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/profile"
          />
        </div>
        <p className="auth-agree-text">
          By signing in, you agree to our{" "}
          <Link href="/terms">Terms of Use</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <div className="profile-legal-section auth-legal-below">
          <h2 className="profile-legal-heading">Legal</h2>
          <nav
            aria-label="Legal"
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            <LegalLinks />
          </nav>
        </div>
      </div>
    </main>
  );
}
