"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { InviteLink } from "@/components/InviteLink";
import { MembersList } from "@/components/MembersList";

type Props = {
  params: Promise<{ inviteCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function GroupMembersPage({ params, searchParams }: Props) {
  const { inviteCode } = use(params);
  use(searchParams);
  const router = useRouter();
  const membershipData = useQuery(api.groups.getGroupWithMembershipByInviteCode, {
    inviteCode,
  });
  const members = useQuery(
    api.groups.getGroupMembers,
    membershipData?.group ? { groupId: membershipData.group._id } : "skip"
  );

  useEffect(() => {
    if (membershipData === null) {
      router.replace("/groups");
    }
  }, [membershipData, router]);

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

  if (members === null) {
    return (
      <div className="loading-screen">
        <p>Redirecting…</p>
      </div>
    );
  }

  const { group, membership } = membershipData;
  const groupId = group._id;
  const isAdmin = membership.role === "admin";

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
        <h1 className="page-title">
          {isAdmin ? "Manage Members" : "Members"}
        </h1>
        <Link href={`/groups/${group.inviteCode}`} className="top-bar-link">
          ← Back to {group.name}
        </Link>
      </div>

      <div className="glass-panel" style={{ marginBottom: "24px" }}>
        <InviteLink inviteCode={group.inviteCode} />
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
          currentUserId={membership.userId}
          canRemove={isAdmin}
          canPromote={isAdmin}
        />
      </div>
    </main>
  );
}
