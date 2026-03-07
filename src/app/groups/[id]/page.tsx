"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { SubmitDuaForm } from "@/components/SubmitDuaForm";
import { DuaWall } from "@/components/DuaWall";

export default function GroupWallPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as Id<"groups">;
  const data = useQuery(api.groups.getGroupWithMembership, { groupId });
  const deleteGroupDua = useMutation(api.groupDuas.deleteGroupDua);

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <p className="text-emerald-300/70">Loading...</p>
      </div>
    );
  }

  if (data === null) {
    router.push("/groups");
    return null;
  }

  const { group, membership } = data;
  const isAdmin = membership.role === "admin";

  async function handleDeleteDua(duaId: Id<"duas">) {
    await deleteGroupDua({ groupId, duaId });
  }

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
            {isAdmin && (
              <Link
                href={`/groups/${groupId}/members`}
                className="text-sm text-emerald-200 hover:text-emerald-50"
              >
                Members
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-emerald-50">
          {group.name}
        </h1>
        {group.description && (
          <p className="mb-8 text-emerald-200/80">{group.description}</p>
        )}

        <div className="mb-10 rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-6">
          <SubmitDuaForm mode="group" groupId={groupId} />
        </div>

        <DuaWall
          mode="group"
          groupId={groupId}
          canDelete={isAdmin}
          onDeleteDua={handleDeleteDua}
        />
      </main>
    </div>
  );
}
