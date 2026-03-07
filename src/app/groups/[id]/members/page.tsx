"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
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

  if (membershipData === undefined || members === undefined) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <p className="text-emerald-300/70">Loading...</p>
      </div>
    );
  }

  if (membershipData === null) {
    router.push("/groups");
    return null;
  }

  if (members === null || membershipData.membership.role !== "admin") {
    router.push(`/groups/${groupId}`);
    return null;
  }

  const { group } = membershipData;

  return (
    <div className="min-h-screen bg-emerald-950">
      <header className="sticky top-0 z-40 border-b border-emerald-800/30 bg-emerald-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-50">
            Ameenly
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href={`/groups/${groupId}`}
              className="text-sm text-emerald-200 hover:text-emerald-50"
            >
              Back to group
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-emerald-50">
          Manage members — {group.name}
        </h1>

        <div className="mb-10 rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-6">
          <InviteLink groupId={groupId} inviteCode={group.inviteCode} />
        </div>

        <div className="rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-6">
          <h2 className="mb-4 text-lg font-semibold text-emerald-50">
            Members
          </h2>
          <MembersList
            groupId={groupId}
            members={members}
            currentUserId={membershipData.membership.userId}
          />
        </div>
      </main>
    </div>
  );
}
