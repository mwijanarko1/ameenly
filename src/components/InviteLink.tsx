"use client";

import { useId, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type InviteLinkProps = {
  groupId: Id<"groups">;
  inviteCode: string;
};

export function InviteLink({ groupId, inviteCode }: InviteLinkProps) {
  const inputId = useId();
  const [copied, setCopied] = useState(false);
  const generateNewCode = useMutation(api.groups.generateNewInviteCode);
  const invitePath = `/join/${inviteCode}`;
  const inviteUrl =
    process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}${invitePath}`
      : invitePath;

  async function handleCopy() {
    const shareUrl =
      typeof window !== "undefined"
        ? new URL(invitePath, window.location.origin).toString()
        : inviteUrl;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
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
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <label
        htmlFor={inputId}
        style={{
          display: "block",
          fontSize: "0.85rem",
          fontWeight: 500,
          color: "var(--text-secondary)",
        }}
      >
        Invite link
      </label>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          id={inputId}
          aria-label="Invite link"
          type="text"
          readOnly
          value={inviteUrl}
          className="form-input"
          style={{ flex: 1, fontSize: "0.8rem" }}
        />
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          className="btn-ameen"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          void handleRegenerate();
        }}
        style={{
          fontSize: "0.75rem",
          color: "var(--text-accent)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
          opacity: 0.8,
        }}
      >
        Regenerate link
      </button>
      <p
        style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
        aria-live="polite"
      >
        {copied
          ? "Invite link copied to the clipboard."
          : "Only invited members can use this link."}
      </p>
    </div>
  );
}
