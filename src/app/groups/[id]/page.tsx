"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { SubmitDuaForm } from "@/components/SubmitDuaForm";
import { DuaWall } from "@/components/DuaWall";

export default function GroupWallPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as Id<"groups">;
  const data = useQuery(api.groups.getGroupWithMembership, { groupId });
  const deleteGroupDua = useMutation(api.groupDuas.deleteGroupDua);

  useEffect(() => {
    if (data === null) {
      router.replace("/groups");
    }
  }, [data, router]);

  if (data === undefined) {
    return (
      <div className="loading-screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="loading-screen">
        <p>Redirecting…</p>
      </div>
    );
  }

  const { group, membership } = data;
  const isAdmin = membership.role === "admin";

  async function handleDeleteDua(duaId: Id<"duas">) {
    await deleteGroupDua({ groupId, duaId });
  }

  return (
    <main id="main-content" className="page-container">
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h1 className="page-title">{group.name}</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/groups" className="top-bar-link">
              ← All Groups
            </Link>
            {isAdmin && (
              <Link
                href={`/groups/${groupId}/members`}
                className="top-bar-link"
              >
                Members
              </Link>
            )}
          </div>
        </div>
        {group.description && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {group.description}
          </p>
        )}
      </div>

      <div className="glass-panel" style={{ marginBottom: "32px" }}>
        <SubmitDuaForm mode="group" groupId={groupId} />
      </div>

      <DuaWall
        mode="group"
        groupId={groupId}
        canDelete={isAdmin}
        onDeleteDua={(duaId) => {
          void handleDeleteDua(duaId);
        }}
      />
    </main>
  );
}
