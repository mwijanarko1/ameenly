import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SubmitDuaCardClient } from "./SubmitDuaCardClient";

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    isSignedIn: false,
    user: null,
  }),
}));

describe("SubmitDuaCard", () => {
  it("shows the submit form with all fields", () => {
    render(<SubmitDuaCardClient submitDua={vi.fn()} />);

    expect(screen.getByRole("region", { name: /submit your dua/i })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /post anonymously/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /your name/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /your dua/i })).toBeInTheDocument();
  });

  it("hides the guest name field when anonymous posting is enabled", () => {
    render(<SubmitDuaCardClient submitDua={vi.fn()} />);

    fireEvent.click(screen.getByRole("switch", { name: /post anonymously/i }));

    expect(screen.queryByRole("textbox", { name: /your name/i })).not.toBeInTheDocument();
  });
});
