"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { GroupCard } from "@/components/GroupCard";
import { JoinGroupForm } from "@/components/JoinGroupForm";

type GroupSummary = {
  _id: Id<"groups">;
  _creationTime: number;
  name: string;
  description?: string;
  creatorId: Id<"users">;
  inviteCode: string;
  createdAt: number;
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function GroupsPage({ searchParams }: Props) {
  use(searchParams);
  const groups = useQuery(api.groups.getMyGroups) as GroupSummary[] | undefined;

  return (
    <main id="main-content" className="page-container">
      <div style={{ marginBottom: "24px" }}>
        <h1 className="page-title">My Groups</h1>
        <p className="section-copy">
          Join a private dua circle with an invite, or create one for your family and friends.
        </p>
      </div>

      <div className="group-actions-grid" style={{ marginBottom: "32px" }}>
        <section className="glass-panel action-card">
          <p className="section-eyebrow">Join With an Invite</p>
          <h2 className="section-title">Paste a Link or Code</h2>
          <p className="section-copy">
            Open the invite first so you can confirm the group before joining.
          </p>
          <JoinGroupForm />
        </section>

        <section className="glass-panel action-card">
          <p className="section-eyebrow">Start Your Own</p>
          <h2 className="section-title">Create a Private Group</h2>
          <p className="section-copy">
            Make one place for shared duas, updates, and support from the people you trust.
          </p>
          <Link
            href="/groups/new"
            className="btn-secondary action-link"
            style={{ textDecoration: "none" }}
          >
            Create Group
          </Link>
        </section>
      </div>

      {groups === undefined ? (
        <div className="loading-screen" style={{ minHeight: "30vh" }}>
          <p>Loading…</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <h2 className="section-title" style={{ marginBottom: "8px" }}>
            No Groups Yet
          </h2>
          <p>Your joined groups will show up here once you accept an invite or create one.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "16px" }}>
            <h2 className="section-title">Your Circles</h2>
            <p className="section-copy">Jump back into the groups you already belong to.</p>
          </div>
          <div className="groups-grid">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
