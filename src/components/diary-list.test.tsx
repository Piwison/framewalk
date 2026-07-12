import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DiaryList } from "./diary-list";
import type { Keeper } from "@/lib/types";

const keeper: Keeper = {
  id: "k1",
  missionId: "m1",
  missionTitle: "Test mission",
  story: "Original story.",
  thumbnail: new Blob(["x"], { type: "image/jpeg" }),
  createdAt: Date.now(),
};

const updateKeeperStory = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/db", () => ({
  allKeepers: () => Promise.resolve([keeper]),
  deleteKeeper: vi.fn().mockResolvedValue(undefined),
  updateKeeperStory: (id: string, story: string) =>
    updateKeeperStory(id, story),
}));

beforeAll(() => {
  // jsdom lacks object-URL APIs; the component only needs them to not throw.
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});

beforeEach(() => {
  updateKeeperStory.mockClear();
});

// Regression coverage for a real bug: the Edit button unmounts the instant
// editing starts (it only renders in the non-editing branch), so its ref is
// gone long before Save/Cancel fire — focusing it there was silently a
// no-op. Fixed via a ref that records which row is closing, read by an
// effect that runs after that row's button has remounted.
describe("DiaryList edit focus", () => {
  it("returns focus to the Edit button after Save", async () => {
    render(<DiaryList />);
    const editBtn = await screen.findByRole("button", { name: /edit story/i });
    fireEvent.click(editBtn);

    const textarea = await screen.findByRole("textbox");
    await waitFor(() => expect(textarea).toHaveFocus());
    fireEvent.change(textarea, { target: { value: "Updated story." } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /edit story/i })).toHaveFocus(),
    );
    expect(updateKeeperStory).toHaveBeenCalledWith("k1", "Updated story.");
  });

  it("returns focus to the Edit button after Cancel, discarding the draft", async () => {
    render(<DiaryList />);
    const editBtn = await screen.findByRole("button", { name: /edit story/i });
    fireEvent.click(editBtn);

    const textarea = await screen.findByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Discarded draft." } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /edit story/i })).toHaveFocus(),
    );
    expect(screen.getByText("Original story.")).toBeInTheDocument();
    expect(updateKeeperStory).not.toHaveBeenCalled();
  });
});
