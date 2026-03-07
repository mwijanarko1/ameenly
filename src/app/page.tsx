import { Hero } from "@/components/Hero";
import { SubmitDuaForm } from "@/components/SubmitDuaForm";
import { DuaWall } from "@/components/DuaWall";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-950">
      <header className="sticky top-0 z-40 border-b border-emerald-800/30 bg-emerald-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-50">
            Ameenly
          </Link>
          <nav className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-500">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/groups"
                className="text-sm text-emerald-200 hover:text-emerald-50"
              >
                My groups
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      <Hero />

      <section className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <h2 className="mb-6 text-xl font-semibold text-emerald-50">
          Public wall
        </h2>
        <div className="mb-10 rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-6">
          <SubmitDuaForm mode="public" />
        </div>
        <DuaWall mode="public" />
      </section>
    </div>
  );
}
