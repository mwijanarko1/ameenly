import { describe, expect, it } from "vitest";
import { normalizeInviteCode } from "./inviteCodes";

describe("normalizeInviteCode", () => {
  it("returns a raw invite code unchanged", () => {
    expect(normalizeInviteCode("abc123_XY")).toBe("abc123_XY");
  });

  it("extracts the code from a full invite URL", () => {
    expect(normalizeInviteCode("https://ameenly.app/join/abc123_XY?ref=share")).toBe(
      "abc123_XY"
    );
  });

  it("extracts the code from a relative invite path", () => {
    expect(normalizeInviteCode("/join/abc123_XY")).toBe("abc123_XY");
  });

  it("rejects invalid input", () => {
    expect(normalizeInviteCode("join/us with us")).toBeNull();
    expect(normalizeInviteCode("")).toBeNull();
  });
});
