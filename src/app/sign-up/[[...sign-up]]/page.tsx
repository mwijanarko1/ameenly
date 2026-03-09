import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign Up | Ameenly",
  description: "Create an Ameenly account to join groups and manage your duas.",
};

export default function SignUpPage() {
  return (
    <main id="main-content" className="page-container auth-page-shell">
      <div className="auth-clerk-wrapper">
        <div className="auth-clerk-center">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/profile"
          />
        </div>
        <p className="auth-agree-text">
          By signing up, you agree to our{" "}
          <Link href="/terms">Terms of Use</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
