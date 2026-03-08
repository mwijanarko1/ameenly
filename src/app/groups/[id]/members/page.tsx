"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { InviteLink } from "@/components/InviteLink";
import { MembersList } from "@/components/MembersList";

export default function GroupMembersPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as Id<"groups">;
  const membershipData = useQuery(api.groups.getGroupWithMembership, {
    groupId,
  });
  const members = useQuery(api.groups.getGroupMembers, { groupId });

  useEffect(() => {
    if (membershipData === null) {
      router.replace("/groups");
      return;
    }

    if (
      membershipData &&
      (members === null || membershipData.membership.role !== "admin")
    ) {
      router.replace(`/groups/${groupId}`);
    }
  }, [groupId, members, membershipData, router]);

  if (membershipData === undefined || members === undefined) {
    return (
      <div className="loading-screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (membershipData === null) {
    return (
      <div className="loading-screen">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (members === null || membershipData.membership.role !== "admin") {
    return (
      <div className="loading-screen">
        <p>Redirecting…</p>
      </div>
    );
  }

  const { group } = membershipData;

  return (
    <main id="main-content" className="page-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <h1 className="page-title">Manage Members</h1>
        <Link href={`/groups/${groupId}`} className="top-bar-link">
          ← Back to {group.name}
        </Link>
      </div>

      <div className="glass-panel" style={{ marginBottom: "24px" }}>
        <InviteLink groupId={groupId} inviteCode={group.inviteCode} />
      </div>

      <div className="glass-panel">
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "16px",
          }}
        >
          Members
        </h2>
        <MembersList
          groupId={groupId}
          members={members}
          currentUserId={membershipData.membership.userId}
        />
      </div>
    </main>
  );
}
