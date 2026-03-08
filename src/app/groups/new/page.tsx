"use client";

import { use } from "react";
import Link from "next/link";
import { CreateGroupForm } from "@/components/CreateGroupForm";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function NewGroupPage({ searchParams }: Props) {
  use(searchParams);
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
        <h1 className="page-title">Create a Group</h1>
        <Link href="/groups" className="top-bar-link">
          ← Back
        </Link>
      </div>
      <div className="glass-panel">
        <CreateGroupForm />
      </div>
    </main>
  );
}
