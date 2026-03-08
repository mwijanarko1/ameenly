"use client";

import Link from "next/link";
import { CreateGroupForm } from "@/components/CreateGroupForm";

export default function NewGroupPage() {
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
