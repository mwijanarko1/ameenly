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
};

export function MembersList({
  groupId,
  members,
  currentUserId,
}: MembersListProps) {
  const removeMember = useMutation(api.groups.removeMember);

  async function handleRemove(userId: Id<"users">) {
    if (!confirm("Remove this member from the group?")) return;
    await removeMember({ groupId, userId });
  }

  return (
    <ul className="divide-y divide-emerald-800/40">
      {members.map((m) => (
        <li
          key={m._id}
          className="flex items-center justify-between py-3 first:pt-0"
        >
          <span className="text-emerald-50">
            {m.userName}
            {m.role === "admin" && (
              <span className="ml-2 text-xs text-amber-400/80">admin</span>
            )}
          </span>
          {m.role === "member" && m.userId !== currentUserId && (
            <button
              type="button"
              onClick={() => handleRemove(m.userId)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
