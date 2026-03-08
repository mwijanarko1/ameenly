"use client";

import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type Member = {
  _id: Id<"groupMembers">;
  userId: Id<"users">;
  role: "admin" | "member";
  userName: string;
};

type MembersListProps = {
  groupId: Id<"groups">;
  members: Member[];
  currentUserId: Id<"users">;
  canRemove?: boolean;
  canPromote?: boolean;
};

export function MembersList({
  groupId,
  members,
  currentUserId,
  canRemove = false,
  canPromote = false,
}: MembersListProps) {
  const removeMember = useMutation(api.groups.removeMember);
  const promoteToAdmin = useMutation(api.groups.promoteToAdmin);

  async function handleRemove(userId: Id<"users">) {
    if (!confirm("Remove this member from the group?")) return;
    await removeMember({ groupId, userId });
  }

  async function handlePromote(userId: Id<"users">) {
    if (!confirm("Make this member an admin? They will be able to approve requests and manage members."))
      return;
    await promoteToAdmin({ groupId, userId });
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {members.map((m, i) => (
        <li
          key={m._id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 0",
            borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>
            {m.userName}
            {m.role === "admin" && (
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "0.7rem",
                  color: "var(--text-accent)",
                  fontWeight: 500,
                }}
              >
                admin
              </span>
            )}
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {canPromote && m.role === "member" && m.userId !== currentUserId && (
              <button
                type="button"
                onClick={() => {
                  void handlePromote(m.userId);
                }}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-accent)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
                aria-label={`Promote ${m.userName} to admin`}
              >
                Make admin
              </button>
            )}
            {canRemove && m.role === "member" && m.userId !== currentUserId && (
              <button
                type="button"
                onClick={() => {
                  void handleRemove(m.userId);
                }}
                className="text-error"
                style={{
                  fontSize: "0.75rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
                aria-label={`Remove ${m.userName} from the group`}
              >
                Remove
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
