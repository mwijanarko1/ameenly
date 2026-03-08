"use client";

import Link from "next/link";
import type { Doc } from "convex/_generated/dataModel";

type GroupCardProps = {
  group: Doc<"groups">;
};

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link
      href={`/groups/${group.inviteCode}`}
      className="group-card"
    >
      <h3 style={{ fontWeight: 600, color: "var(--text-primary)" }}>{group.name}</h3>
      {group.description && (
        <p
          style={{
            marginTop: "6px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {group.description}
        </p>
      )}
      <p style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--text-accent)" }}>
        View duas →
      </p>
    </Link>
  );
}
