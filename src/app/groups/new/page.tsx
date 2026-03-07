"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { CreateGroupForm } from "@/components/CreateGroupForm";

export default function NewGroupPage() {
  return (
    <div className="min-h-screen bg-emerald-950">
      <header className="sticky top-0 z-40 border-b border-emerald-800/30 bg-emerald-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-50">
            Ameenly
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/groups"
              className="text-sm text-emerald-200 hover:text-emerald-50"
            >
              My groups
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-emerald-50">
          Create a group
        </h1>
        <div className="rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-6">
          <CreateGroupForm />
        </div>
      </main>
    </div>
  );
}
