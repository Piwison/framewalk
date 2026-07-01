import { describe, it, expect, beforeEach } from "vitest";
import { readFavourites, isFavourite, toggleFavourite } from "./favourites";

const KEY = "framewalk.favourites";

describe("favourites store", () => {
  beforeEach(() => localStorage.clear());

  it("starts empty and reads back what was written", () => {
    expect(readFavourites()).toEqual([]);
    expect(isFavourite("a")).toBe(false);
  });

  it("toggles a mission on and off, persisting to localStorage", () => {
    expect(toggleFavourite("a")).toEqual(["a"]);
    expect(isFavourite("a")).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY) ?? "[]")).toEqual(["a"]);

    expect(toggleFavourite("a")).toEqual([]);
    expect(isFavourite("a")).toBe(false);
  });

  it("keeps multiple favourites and removes only the toggled one", () => {
    toggleFavourite("a");
    toggleFavourite("b");
    expect(readFavourites()).toEqual(["a", "b"]);
    toggleFavourite("a");
    expect(readFavourites()).toEqual(["b"]);
  });

  it("is corruption-safe: bad JSON reads as empty (FR-F8)", () => {
    localStorage.setItem(KEY, "{not json");
    expect(readFavourites()).toEqual([]);
    // and a toggle recovers cleanly
    expect(toggleFavourite("a")).toEqual(["a"]);
  });

  it("ignores non-string entries in stored data", () => {
    localStorage.setItem(KEY, JSON.stringify(["a", 2, null, "b"]));
    expect(readFavourites()).toEqual(["a", "b"]);
  });
});
