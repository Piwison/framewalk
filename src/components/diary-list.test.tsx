import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { DiaryList } from "./diary-list";
import { allKeepers } from "@/lib/db";
import { MISSIONS } from "@/lib/missions";
import type { Keeper } from "@/lib/types";

/**
 * Component coverage for SPEC-diary-filters (FR-DF1..DF10). Mirrors the mocking style of
 * today-mission.test.tsx / cull-flow.test.tsx: `@/lib/db` is mocked so the filter bar and
 * list narrowing are tested without IndexedDB, and object-URL creation is stubbed for jsdom.
 */

vi.mock("@/lib/db", () => ({
  allKeepers: vi.fn(async () => [] as Keeper[]),
  deleteKeeper: vi.fn(async () => undefined),
}));

const allKeepersMock = vi.mocked(allKeepers);

beforeAll(() => {
  // jsdom lacks object-URL APIs; the component only needs them to not throw.
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});

beforeEach(() => {
  allKeepersMock.mockReset();
});

function K(over: Partial<Keeper> & Pick<Keeper, "id" | "missionId">): Keeper {
  return {
    missionTitle:
      MISSIONS.find((m) => m.id === over.missionId)?.title ?? "Free walk",
    story: "",
    images: [new Blob(["x"], { type: "image/jpeg" })],
    coverIndex: 0,
    createdAt: Date.now(),
    ...over,
  };
}

// Real mission ids spanning ≥2 themes + one people mission (design/spec require the join
// to use MISSIONS, not fixture missions):
//   first-light-edges  -> light, shadow
//   blue-hour-warmth    -> light, colour
//   the-colour-of-the-day -> colour
//   hands-at-work       -> people, hands (involvesPeople: true)
//   negative-space-walk -> composition, stillness
// Plus one free-walk keeper whose missionId has no match in MISSIONS (FR-DF5).
const ABOVE_THRESHOLD_KEEPERS: Keeper[] = [
  K({ id: "k1", missionId: "first-light-edges", createdAt: 1 }),
  K({ id: "k2", missionId: "first-light-edges", createdAt: 2 }),
  K({ id: "k3", missionId: "blue-hour-warmth", createdAt: 3 }),
  K({ id: "k4", missionId: "the-colour-of-the-day", createdAt: 4 }),
  K({ id: "k5", missionId: "hands-at-work", createdAt: 5 }),
  K({ id: "k6", missionId: "negative-space-walk", createdAt: 6 }),
  K({ id: "k7", missionId: "solo-free-walk-not-a-mission", createdAt: 7 }),
];

function cardCount() {
  return screen.getAllByRole("listitem").length;
}

describe("DiaryList filter bar threshold (FR-DF1)", () => {
  it("renders no radiogroup and shows every keeper when below threshold", async () => {
    allKeepersMock.mockResolvedValue([
      K({ id: "a", missionId: "first-light-edges" }),
      K({ id: "b", missionId: "blue-hour-warmth" }),
      K({ id: "c", missionId: "the-colour-of-the-day" }),
    ]);

    render(<DiaryList />);

    await screen.findAllByRole("listitem");
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(cardCount()).toBe(3);
  });
});

describe("DiaryList filter bar above threshold (FR-DF2, DF3, DF4, DF5, DF6, DF7)", () => {
  it("renders the radiogroup with All selected and shows every keeper by default", async () => {
    allKeepersMock.mockResolvedValue(ABOVE_THRESHOLD_KEEPERS);

    render(<DiaryList />);

    const group = await screen.findByRole("radiogroup", {
      name: /filter diary/i,
    });
    const allChip = within(group).getByRole("radio", {
      name: /show all keepers/i,
    });
    expect(allChip).toHaveAttribute("aria-checked", "true");

    // 7 keepers seeded, all visible under "All" (incl. the free-walk keeper, FR-DF6).
    expect(cardCount()).toBe(7);
  });

  it("selecting a theme chip narrows the visible keeper cards (FR-DF3) and excludes the free walk (FR-DF5)", async () => {
    allKeepersMock.mockResolvedValue(ABOVE_THRESHOLD_KEEPERS);

    render(<DiaryList />);
    const group = await screen.findByRole("radiogroup", {
      name: /filter diary/i,
    });

    // "light" is carried by first-light-edges (x2) + blue-hour-warmth (x1) = 3 keepers,
    // and is the top-count theme so it's the first theme chip after "All".
    const lightChip = within(group).getByRole("radio", {
      name: /show keepers themed light/i,
    });
    fireEvent.click(lightChip);

    await waitFor(() =>
      expect(lightChip).toHaveAttribute("aria-checked", "true"),
    );
    const allChip = within(group).getByRole("radio", {
      name: /show all keepers/i,
    });
    expect(allChip).toHaveAttribute("aria-checked", "false");

    await waitFor(() => expect(cardCount()).toBe(3));
    // The free-walk keeper (no matching mission) never appears under a theme filter.
    expect(screen.queryByText(/free walk/i)).not.toBeInTheDocument();
  });

  it('selecting "With people" narrows to people missions (FR-DF4)', async () => {
    allKeepersMock.mockResolvedValue(ABOVE_THRESHOLD_KEEPERS);

    render(<DiaryList />);
    const group = await screen.findByRole("radiogroup", {
      name: /filter diary/i,
    });

    const peopleChip = within(group).getByRole("radio", {
      name: /show keepers with people/i,
    });
    fireEvent.click(peopleChip);

    await waitFor(() =>
      expect(peopleChip).toHaveAttribute("aria-checked", "true"),
    );
    // Only hands-at-work (involvesPeople: true) is in the seeded set.
    await waitFor(() => expect(cardCount()).toBe(1));
    expect(screen.getByText(/hands at work/i)).toBeInTheDocument();
  });

  it('shows the calm empty line and keeps the bar when "With people" has no matches', async () => {
    // No people mission in this set at all.
    allKeepersMock.mockResolvedValue([
      K({ id: "k1", missionId: "first-light-edges", createdAt: 1 }),
      K({ id: "k2", missionId: "first-light-edges", createdAt: 2 }),
      K({ id: "k3", missionId: "blue-hour-warmth", createdAt: 3 }),
      K({ id: "k4", missionId: "the-colour-of-the-day", createdAt: 4 }),
      K({ id: "k5", missionId: "negative-space-walk", createdAt: 5 }),
      K({ id: "k6", missionId: "negative-space-walk", createdAt: 6 }),
    ]);

    render(<DiaryList />);
    const group = await screen.findByRole("radiogroup", {
      name: /filter diary/i,
    });

    const peopleChip = within(group).getByRole("radio", {
      name: /show keepers with people/i,
    });
    fireEvent.click(peopleChip);

    await waitFor(() =>
      expect(peopleChip).toHaveAttribute("aria-checked", "true"),
    );
    // Bar stays visible (still in the document) alongside the empty-state line.
    expect(
      screen.getByRole("radiogroup", { name: /filter diary/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByText(/no frames with people yet/i)).toBeInTheDocument();
  });

  it("shows the theme empty-state copy (not the people copy) when a selected theme loses its last keeper (FR-DF7)", async () => {
    // "shadow" is carried only by first-light-edges, so removing k1 empties that theme
    // while ≥6 keepers / ≥2 themes remain — the bar stays, the filter is now empty.
    allKeepersMock.mockResolvedValue([
      K({ id: "k1", missionId: "first-light-edges", createdAt: 1 }), // sole "shadow"
      K({ id: "k2", missionId: "blue-hour-warmth", createdAt: 2 }),
      K({ id: "k3", missionId: "blue-hour-warmth", createdAt: 3 }),
      K({ id: "k4", missionId: "the-colour-of-the-day", createdAt: 4 }),
      K({ id: "k5", missionId: "negative-space-walk", createdAt: 5 }),
      K({ id: "k6", missionId: "negative-space-walk", createdAt: 6 }),
      K({ id: "k7", missionId: "the-colour-of-the-day", createdAt: 7 }),
    ]);

    render(<DiaryList />);
    const group = await screen.findByRole("radiogroup", {
      name: /filter diary/i,
    });

    const shadowChip = within(group).getByRole("radio", {
      name: /show keepers themed shadow/i,
    });
    fireEvent.click(shadowChip);
    await waitFor(() => expect(cardCount()).toBe(1));

    // Remove the sole shadow keeper → the active theme filter now matches nothing.
    fireEvent.click(screen.getByRole("button", { name: /remove keeper/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/nothing under this thread just now/i),
      ).toBeInTheDocument(),
    );
    // The people-specific copy must NOT be shown for a theme filter (the P1 bug).
    expect(
      screen.queryByText(/no frames with people yet/i),
    ).not.toBeInTheDocument();
    // Bar stays so the user can return to "All".
    expect(
      screen.getByRole("radiogroup", { name: /filter diary/i }),
    ).toBeInTheDocument();
  });

  it('"All" restores the full list after a theme narrows it', async () => {
    allKeepersMock.mockResolvedValue(ABOVE_THRESHOLD_KEEPERS);

    render(<DiaryList />);
    const group = await screen.findByRole("radiogroup", {
      name: /filter diary/i,
    });

    const lightChip = within(group).getByRole("radio", {
      name: /show keepers themed light/i,
    });
    fireEvent.click(lightChip);
    await waitFor(() => expect(cardCount()).toBe(3));

    const allChip = within(group).getByRole("radio", {
      name: /show all keepers/i,
    });
    fireEvent.click(allChip);

    await waitFor(() =>
      expect(allChip).toHaveAttribute("aria-checked", "true"),
    );
    await waitFor(() => expect(cardCount()).toBe(7));
  });

  it("shows the free-walk keeper under All but hides it under any theme chip", async () => {
    allKeepersMock.mockResolvedValue(ABOVE_THRESHOLD_KEEPERS);

    render(<DiaryList />);
    const group = await screen.findByRole("radiogroup", {
      name: /filter diary/i,
    });

    // Under "All": the free-walk row renders with its fallback mission title.
    await waitFor(() => expect(cardCount()).toBe(7));
    expect(screen.getByText(/free walk/i)).toBeInTheDocument();

    // Any theme chip must exclude it (FR-DF5) — try "colour".
    const colourChip = within(group).getByRole("radio", {
      name: /show keepers themed colour/i,
    });
    fireEvent.click(colourChip);

    await waitFor(() =>
      expect(colourChip).toHaveAttribute("aria-checked", "true"),
    );
    expect(screen.queryByText(/free walk/i)).not.toBeInTheDocument();
    // blue-hour-warmth + the-colour-of-the-day both carry "colour".
    await waitFor(() => expect(cardCount()).toBe(2));
  });
});
