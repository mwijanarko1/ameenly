import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("shows the published success message after a clean guest submission", async () => {
    const submitDua = vi.fn().mockResolvedValue({ status: "published" });
    render(<SubmitDuaCardClient submitDua={submitDua} />);

    fireEvent.change(screen.getByRole("textbox", { name: /your name/i }), {
      target: { value: "Fatima" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /your dua/i }), {
      target: { value: "Please make things easy for my family." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit dua/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/dua submitted\. swipe to see it on the wall\./i)
      ).toBeInTheDocument();
    });
  });

  it("shows the review message when a guest submission is queued", async () => {
    const submitDua = vi.fn().mockResolvedValue({ status: "queued_for_review" });
    render(<SubmitDuaCardClient submitDua={submitDua} />);

    fireEvent.change(screen.getByRole("textbox", { name: /your name/i }), {
      target: { value: "Fatima" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /your dua/i }), {
      target: { value: "Call me at 555-555-5555 about this." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit dua/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/thanks, your submission is under review before it appears on the wall\./i)
      ).toBeInTheDocument();
    });
  });
});
