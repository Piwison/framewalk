import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CullFlow } from "./cull-flow";

// CullFlow reads ?mission= via next/navigation; stub it for the test.
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("mission=one-stranger-one-yes"),
}));

beforeAll(() => {
  // jsdom lacks object-URL APIs; the component only needs them to not throw.
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});

describe("CullFlow accessibility (grill fix B4)", () => {
  it("imports without forcing the camera (camera-roll, not capture)", () => {
    const { container } = render(<CullFlow />);
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect(input?.getAttribute("accept")).toBe("image/*");
    // capture would force the camera and break 'import from camera roll'.
    expect(input?.hasAttribute("capture")).toBe(false);
    expect(input).toHaveAttribute("multiple");
  });

  it("exposes keep/let-go as labeled buttons and focuses Keep", async () => {
    const { container } = render(<CullFlow />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File([new Uint8Array([1, 2, 3])], "shot.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(input, { target: { files: [file] } });

    const keep = await screen.findByRole("button", { name: /keep/i });
    const letGo = screen.getByRole("button", { name: /let go/i });
    expect(keep).toBeInTheDocument();
    expect(letGo).toBeInTheDocument();
    // Focus advances to the primary action for keyboard users.
    await waitFor(() => expect(keep).toHaveFocus());
  });
});
