"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { SubmitDuaForm } from "@/components/SubmitDuaForm";
import { DuaDeck } from "@/components/DuaDeck";

type Props = {
  params: Promise<{ inviteCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function GroupWallPage({ params, searchParams }: Props) {
  const { inviteCode } = use(params);
  use(searchParams);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"duas" | "submit">("duas");
  const data = useQuery(api.groups.getGroupWithMembershipByInviteCode, {
    inviteCode,
  });

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

  const { group } = data;
  const groupId = group._id;

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
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/groups" className="nav-btn">
              ← All Groups
            </Link>
            <Link
              href={`/groups/${group.inviteCode}/members`}
              className="nav-btn"
            >
              Members
            </Link>
          </div>
        </div>
        {group.description && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {group.description}
          </p>
        )}
      </div>

      {/* Tab Bar */}
      <div
        role="tablist"
        aria-label="Group view"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "duas"}
          aria-controls="group-duas-panel"
          id="group-duas-tab"
          onClick={() => setActiveTab("duas")}
          style={{
            padding: "12px 16px",
            fontSize: "0.85rem",
            fontWeight: activeTab === "duas" ? 600 : 400,
            color:
              activeTab === "duas"
                ? "var(--text-accent)"
                : "var(--text-secondary)",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "duas"
                ? "2px solid var(--text-accent)"
                : "2px solid transparent",
            cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
            marginBottom: "-1px",
          }}
        >
          Duas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "submit"}
          aria-controls="group-submit-panel"
          id="group-submit-tab"
          onClick={() => setActiveTab("submit")}
          style={{
            padding: "12px 16px",
            fontSize: "0.85rem",
            fontWeight: activeTab === "submit" ? 600 : 400,
            color:
              activeTab === "submit"
                ? "var(--text-accent)"
                : "var(--text-secondary)",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "submit"
                ? "2px solid var(--text-accent)"
                : "2px solid transparent",
            cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
            marginBottom: "-1px",
          }}
        >
          Submit
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "duas" && (
        <div
          id="group-duas-panel"
          role="tabpanel"
          aria-labelledby="group-duas-tab"
        >
          <DuaDeck mode="group" groupId={groupId} />
        </div>
      )}
      {activeTab === "submit" && (
        <div
          id="group-submit-panel"
          role="tabpanel"
          aria-labelledby="group-submit-tab"
        >
          <div className="glass-panel">
            <SubmitDuaForm mode="group" groupId={groupId} />
          </div>
        </div>
      )}
    </main>
  );
}
