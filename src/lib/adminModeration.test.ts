import { describe, expect, it } from "vitest";
import {
  normalizeReportCount,
  normalizeReportedDuaRecord,
} from "../../convex/lib/adminModeration";

describe("admin moderation normalization", () => {
  it("coerces invalid report counts to zero", () => {
    expect(normalizeReportCount(undefined)).toBe(0);
    expect(normalizeReportCount(null)).toBe(0);
    expect(normalizeReportCount(-4)).toBe(0);
    expect(normalizeReportCount(2.9)).toBe(2);
    expect(normalizeReportCount("3")).toBe(0);
  });

  it("filters malformed legacy report fields before returning reported duas", () => {
    const normalized = normalizeReportedDuaRecord(
      {
        _id: "dua_1",
        _creationTime: 1710000000000,
        text: "Please make dua for me.",
        name: null,
        isAnonymous: "false",
        createdAt: Number.NaN,
        ameen: undefined,
        moderationStatus: "flagged",
        reportCount: 3.8,
        reportReasons: ["spam", 42, null, "other"],
        authorId: "user_1",
      } as never,
      1234
    );

    expect(normalized).toEqual({
      _id: "dua_1",
      _creationTime: 1710000000000,
      text: "Please make dua for me.",
      name: undefined,
      isAnonymous: false,
      createdAt: 1710000000000,
      ameen: 0,
      reportCount: 3,
      reportReasons: ["spam", "other"],
      moderationStatus: undefined,
      authorName: undefined,
      isGuest: false,
    });
  });
});
