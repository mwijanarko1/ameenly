import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwipeCardDeck } from "./SwipeCardDeck";

describe("SwipeCardDeck", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 0)
    );
    vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
      window.clearTimeout(handle)
    );

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps the previous card staged during a back swipe", () => {
    render(
      <SwipeCardDeck>
        {[
          <div key="card-1">Card 1</div>,
          <div key="card-2">Card 2</div>,
          <div key="card-3">Card 3</div>,
        ]}
      </SwipeCardDeck>
    );

    const deck = screen.getByRole("region", { name: /swipeable dua cards/i });

    fireEvent.mouseDown(deck, { clientX: 280 });
    fireEvent.mouseMove(window, { clientX: 120 });
    act(() => {
      vi.advanceTimersByTime(1);
    });
    fireEvent.mouseUp(window);
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText("Card 2").closest(".swipe-card")).toHaveAttribute(
      "aria-hidden",
      "false"
    );

    fireEvent.mouseDown(deck, { clientX: 120 });
    fireEvent.mouseMove(window, { clientX: 260 });
    act(() => {
      vi.advanceTimersByTime(1);
    });

    const previousCard = screen.getByText("Card 1").closest(".swipe-card");

    expect(previousCard).not.toHaveStyle({ opacity: "0" });
    expect(previousCard?.getAttribute("style")).not.toContain(
      "translateX(-200%)"
    );
    expect(previousCard?.getAttribute("style")).not.toContain("translateY");
    expect(previousCard?.getAttribute("style")).not.toContain("scale");

    fireEvent.mouseUp(window);
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText("Card 1").closest(".swipe-card")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
  });
});
