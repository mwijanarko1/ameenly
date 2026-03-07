"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type InviteLinkProps = {
  groupId: Id<"groups">;
  inviteCode: string;
};

export function InviteLink({ groupId, inviteCode }: InviteLinkProps) {
  const [copied, setCopied] = useState(false);
  const generateNewCode = useMutation(api.groups.generateNewInviteCode);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${inviteCode}`
      : `https://example.com/join/${inviteCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleRegenerate() {
    await generateNewCode({ groupId });
    setCopied(false);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-emerald-200">
        Invite link
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 rounded-lg border border-emerald-700/50 bg-emerald-950/50 px-4 py-2 text-emerald-50 text-sm"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-500 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button
        type="button"
        onClick={handleRegenerate}
        className="text-xs text-amber-400/80 hover:text-amber-300"
      >
        Regenerate link
      </button>
    </div>
  );
}
