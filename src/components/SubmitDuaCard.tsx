"use client";

import { submitPublicDua } from "@/app/actions/duas";
import { SubmitDuaCardClient } from "@/components/SubmitDuaCardClient";

export function SubmitDuaCard() {
  return <SubmitDuaCardClient submitDua={submitPublicDua} />;
}
