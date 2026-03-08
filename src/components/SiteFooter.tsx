import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <nav aria-label="Legal and site links">
        <Link href="/">Home</Link>
        <span className="site-footer-sep" aria-hidden="true">
          ·
        </span>
        <Link href="/privacy">Privacy Policy</Link>
        <span className="site-footer-sep" aria-hidden="true">
          ·
        </span>
        <Link href="/terms">Terms of Use</Link>
      </nav>
    </footer>
  );
}
