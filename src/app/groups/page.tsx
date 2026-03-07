"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { GroupCard } from "@/components/GroupCard";

export default function GroupsPage() {
  const groups = useQuery(api.groups.getMyGroups);

  return (
    <div className="min-h-screen bg-emerald-950">
      <header className="sticky top-0 z-40 border-b border-emerald-800/30 bg-emerald-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-50">
            Ameenly
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-emerald-200 hover:text-emerald-50"
            >
              Public wall
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-50">My groups</h1>
          <Link
            href="/groups/new"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-500"
          >
            Create group
          </Link>
        </div>

        {groups === undefined ? (
          <p className="text-emerald-300/70">Loading...</p>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-8 text-center">
            <p className="text-emerald-200/80 mb-4">
              You haven&apos;t joined any groups yet.
            </p>
            <Link
              href="/groups/new"
              className="inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-500"
            >
              Create your first group
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((group) =>
              group ? <GroupCard key={group._id} group={group} /> : null
            )}
          </div>
        )}
      </main>
    </div>
  );
}
