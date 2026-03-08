"use client";

import { useId, useState } from "react";
type InviteLinkProps = {
  inviteCode: string;
};

export function InviteLink({ inviteCode }: InviteLinkProps) {
  const inputId = useId();
  const [copied, setCopied] = useState(false);
  const invitePath = `/join/${inviteCode}`;
  const inviteUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}${invitePath}`
    : typeof window === "undefined"
      ? invitePath
      : new URL(invitePath, window.location.origin).toString();

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
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          id={inputId}
          aria-label="Invite link"
          type="text"
          readOnly
          value={inviteUrl}
          className="form-input"
          style={{ flex: 1, minWidth: 0, fontSize: "0.9rem" }}
        />
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          className="btn-copy"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p
        style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
        aria-live="polite"
      >
        {copied
          ? "Invite link copied to the clipboard."
          : "Share this link with anyone you want to invite to the group."}
      </p>
    </div>
  );
}
