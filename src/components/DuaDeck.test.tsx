import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DuaDeck } from "./DuaDeck";

const loadMore = vi.fn();
let latestOnCardChange: ((index: number) => void) | undefined;

type MockDua = {
  _id: string;
  text: string;
  createdAt: number;
  ameen: number;
};

let mockPublicResults: MockDua[] = [];
let mockPublicStatus:
  | "CanLoadMore"
  | "Exhausted"
  | "LoadingFirstPage"
  | "LoadingMore" = "CanLoadMore";

vi.mock("next/image", () => ({
  default: () => <div data-testid="mock-image" />,
}));

vi.mock("convex/react", () => ({
  usePaginatedQuery: () => ({
    results: mockPublicResults,
    status: mockPublicStatus,
    loadMore,
  }),
}));

vi.mock("convex/_generated/api", () => ({
  api: {
    duas: {
      listPublicDuas: "listPublicDuas",
    },
    groupDuas: {
      listGroupDuas: "listGroupDuas",
    },
  },
}));

vi.mock("@/components/SwipeCardDeck", () => ({
  SwipeCardDeck: ({
    children,
    onCardChange,
  }: {
    children: React.ReactNode[];
    onCardChange?: (index: number) => void;
  }) => {
    latestOnCardChange = onCardChange;
    return <div data-testid="swipe-deck">{children}</div>;
  },
}));

vi.mock("@/components/DuaCardSlide", () => ({
  DuaCardSlide: ({ dua }: { dua: MockDua }) => <div>{dua.text}</div>,
}));

function createDua(id: string): MockDua {
  return {
    _id: id,
    text: `Dua ${id}`,
    createdAt: Date.now(),
    ameen: 0,
  };
}

describe("DuaDeck", () => {
  beforeEach(() => {
    loadMore.mockReset();
    latestOnCardChange = undefined;
    mockPublicStatus = "CanLoadMore";
  });

  it("loads more cards when the visible list shrinks near the end", () => {
    mockPublicResults = [createDua("1"), createDua("2"), createDua("3")];

    const { rerender } = render(<DuaDeck mode="public" />);

    act(() => {
      latestOnCardChange?.(2);
    });

    expect(loadMore).toHaveBeenCalledTimes(1);

    mockPublicResults = [createDua("1"), createDua("2")];
    rerender(<DuaDeck mode="public" />);

    expect(loadMore).toHaveBeenCalledTimes(2);
  });
});
