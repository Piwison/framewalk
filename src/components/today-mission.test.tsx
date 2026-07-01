import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodayMission } from "./today-mission";

// TodayMission reads/writes the URL-free client state; it only needs router/searchParams
// stubbed because next/navigation throws outside a Next request context.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Persistence is mocked so favouriting is tested without IndexedDB.
vi.mock("@/lib/db", () => ({
  servedLog: vi.fn(async () => []),
  recordServed: vi.fn(async () => undefined),
}));

const FAVOURITES_KEY = "framewalk.favourites";

async function findFavouriteToggle() {
  // Accessible name flips between the two states; match either.
  return screen.findByRole("button", {
    name: /save this mission|saved — tap to remove/i,
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe("TodayMission favourite toggle (SPEC-mission-favouriting FR-F1/F2/F6)", () => {
  it("renders the favourite toggle once a mission is shown, starting unmarked", async () => {
    render(<TodayMission />);

    const toggle = await findFavouriteToggle();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAccessibleName("Save this mission");
  });

  it("activating the toggle marks it, persists the mission id, and toggling again unmarks it", async () => {
    render(<TodayMission />);

    const toggle = await findFavouriteToggle();
    const title = await screen.findByRole("heading", { level: 2 });
    const missionTitle = title.textContent;

    fireEvent.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"));
    expect(toggle).toHaveAccessibleName("Saved — tap to remove");

    // FR-F1: persisted on-device, keyed by mission id, no network involved.
    const stored = JSON.parse(localStorage.getItem(FAVOURITES_KEY) ?? "[]");
    expect(Array.isArray(stored)).toBe(true);
    expect(stored).toHaveLength(1);
    expect(typeof stored[0]).toBe("string");

    // Toggling never blanks/replaces the current card (design spec §2 "selection coupling").
    const titleAfterMark = await screen.findByRole("heading", { level: 2 });
    expect(titleAfterMark.textContent).toBe(missionTitle);

    // FR-F2: activating again removes it and updates state immediately.
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(toggle).toHaveAttribute("aria-pressed", "false"),
    );
    expect(toggle).toHaveAccessibleName("Save this mission");
    expect(JSON.parse(localStorage.getItem(FAVOURITES_KEY) ?? "[]")).toEqual(
      [],
    );

    // Still the same mission on screen after the round trip.
    const titleAfterUnmark = await screen.findByRole("heading", { level: 2 });
    expect(titleAfterUnmark.textContent).toBe(missionTitle);
  });

  it("prefers a pre-saved favourite for the initial mission (FR-F3, ref→selection wiring)", async () => {
    // `small-life-at-home` is eligible at every time of day, so once it's the only
    // favourite the preference must surface it regardless of when the test runs.
    // This exercises the favIdsRef → missionOfTheDay path at the component level,
    // not just the pure selection unit — the integration code review flagged.
    localStorage.setItem(
      FAVOURITES_KEY,
      JSON.stringify(["small-life-at-home"]),
    );

    render(<TodayMission />);

    const title = await screen.findByRole("heading", { level: 2 });
    expect(title.textContent).toBe("The room you stopped seeing");
    // The shown mission is the favourite, so its toggle is already marked on load.
    const toggle = await findFavouriteToggle();
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});
