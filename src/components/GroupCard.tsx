"use client";

import Link from "next/link";
import type { Doc } from "convex/_generated/dataModel";

type GroupCardProps = {
  group: Doc<"groups">;
};

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link
      href={`/groups/${group._id}`}
      className="block rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-4 sm:p-5 backdrop-blur hover:border-amber-600/50 hover:bg-emerald-950/50 transition-colors"
    >
      <h3 className="font-semibold text-emerald-50">{group.name}</h3>
      {group.description && (
        <p className="mt-1 text-sm text-emerald-300/70 line-clamp-2">
          {group.description}
        </p>
      )}
      <p className="mt-2 text-xs text-emerald-400/60">
        View duas →
      </p>
    </Link>
  );
}
