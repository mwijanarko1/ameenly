import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

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
      </div>
    </main>
  );
}
