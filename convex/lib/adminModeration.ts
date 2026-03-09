import type { Doc } from "../_generated/dataModel";

const VALID_MODERATION_STATUSES = [
  "approved",
  "pending_review",
  "rejected",
] as const;

type ModerationStatus = (typeof VALID_MODERATION_STATUSES)[number];

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function getModerationStatus(value: unknown): ModerationStatus | undefined {
  return VALID_MODERATION_STATUSES.find((status) => status === value);
}

export function normalizeReportCount(value: unknown): number {
  const count = getFiniteNumber(value, 0);
  return Math.max(0, Math.trunc(count));
}

export function normalizeReportedDuaRecord(
  dua: Doc<"duas">,
  authorName?: unknown
) {
  return {
    _id: dua._id,
    _creationTime: dua._creationTime,
    text: dua.text,
    name: getOptionalString(dua.name),
    isAnonymous: dua.isAnonymous === true,
    createdAt: getFiniteNumber(dua.createdAt, dua._creationTime),
    ameen: getFiniteNumber(dua.ameen, 0),
    reportCount: normalizeReportCount(dua.reportCount),
    reportReasons: getStringArray(dua.reportReasons),
    moderationStatus: getModerationStatus(dua.moderationStatus),
    authorName: dua.isAnonymous === true ? undefined : getOptionalString(authorName),
    isGuest: dua.authorId === undefined,
  };
}
