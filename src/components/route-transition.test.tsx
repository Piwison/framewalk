import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { RouteTransition } from "./route-transition";

let pathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

// Regression coverage for a real bug: keying the wrapper on pathname (so the
// .route-settle animation replays on navigation) tears down whatever had
// focus a moment ago — usually the very link that was just clicked — which
// otherwise drops focus to <body> on every navigation.
describe("RouteTransition focus management", () => {
  it("does not steal focus on the very first mount", async () => {
    pathname = "/";
    render(
      <RouteTransition>
        <button type="button">content</button>
      </RouteTransition>,
    );
    await waitFor(() => expect(document.activeElement).toBe(document.body));
  });

  it("moves focus into the new route's content on a pathname change", async () => {
    pathname = "/";
    const { rerender } = render(
      <RouteTransition>
        <button type="button">content</button>
      </RouteTransition>,
    );
    expect(document.activeElement).toBe(document.body);

    pathname = "/diary";
    rerender(
      <RouteTransition>
        <button type="button">content</button>
      </RouteTransition>,
    );

    await waitFor(() => {
      expect(document.activeElement?.getAttribute("tabindex")).toBe("-1");
    });
  });
});
