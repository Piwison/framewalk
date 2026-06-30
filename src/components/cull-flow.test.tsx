import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CullFlow } from "./cull-flow";
import { addKeeper } from "@/lib/db";

// CullFlow reads ?mission= via next/navigation; stub it for the test.
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("mission=one-stranger-one-yes"),
}));

// jsdom can't decode images; thumbnailing is mocked to a deterministic blob.
vi.mock("@/lib/thumbnail", () => ({
  makeThumbnail: vi.fn(async () => new Blob(["thumb"], { type: "image/jpeg" })),
}));

// Persistence is mocked so the cull flow is tested without IndexedDB.
vi.mock("@/lib/db", () => ({
  addKeeper: vi.fn(async () => undefined),
}));

const addKeeperMock = vi.mocked(addKeeper);

function fileNamed(name: string): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "image/jpeg" });
}

function pick(container: HTMLElement, files: File[]) {
  const input = container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { files } });
}

async function keepCurrent() {
  const keep = await screen.findByRole("button", { name: /^keep$/i });
  fireEvent.click(keep);
}

beforeAll(() => {
  // jsdom lacks object-URL APIs; the component only needs them to not throw.
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});

beforeEach(() => {
  addKeeperMock.mockClear();
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
    pick(container, [fileNamed("shot.jpg")]);

    const keep = await screen.findByRole("button", { name: /^keep$/i });
    const letGo = screen.getByRole("button", { name: /let go/i });
    expect(keep).toBeInTheDocument();
    expect(letGo).toBeInTheDocument();
    // Focus advances to the primary action for keyboard users.
    await waitFor(() => expect(keep).toHaveFocus());
  });
});

describe("CullFlow rolls (SPEC-rolls)", () => {
  it("keeping exactly one frame shows no Compose step (FR-R3)", async () => {
    const { container } = render(<CullFlow />);
    pick(container, [fileNamed("only.jpg")]);
    await keepCurrent();

    // Straight to the single story step; no roll-composing choice appears.
    await screen.findByLabelText(/what.s the story/i);
    expect(
      screen.queryByRole("button", { name: /save as one roll/i }),
    ).not.toBeInTheDocument();
  });

  it("keeping ≥2 frames offers one-roll vs each-on-its-own, focusing the heading (FR-R1)", async () => {
    const { container } = render(<CullFlow />);
    pick(container, [fileNamed("a.jpg"), fileNamed("b.jpg")]);
    await keepCurrent(); // keep a
    await keepCurrent(); // keep b -> compose

    const oneRoll = await screen.findByRole("button", {
      name: /save as one roll/i,
    });
    expect(oneRoll).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save each on its own/i }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /2 frames/i })).toHaveFocus(),
    );
  });

  it("saving as one roll writes a single entry holding both frames (FR-R2)", async () => {
    const { container } = render(<CullFlow />);
    pick(container, [fileNamed("a.jpg"), fileNamed("b.jpg")]);
    await keepCurrent();
    await keepCurrent();

    fireEvent.click(
      await screen.findByRole("button", { name: /save as one roll/i }),
    );
    fireEvent.click(await screen.findByRole("button", { name: /save roll/i }));

    await waitFor(() => expect(addKeeperMock).toHaveBeenCalledTimes(1));
    const entry = addKeeperMock.mock.calls[0]?.[0];
    expect(entry?.images).toHaveLength(2);
    expect(entry?.coverIndex).toBe(0);
  });

  it("saving each on its own writes one entry per kept frame", async () => {
    const { container } = render(<CullFlow />);
    pick(container, [fileNamed("a.jpg"), fileNamed("b.jpg")]);
    await keepCurrent();
    await keepCurrent();

    fireEvent.click(
      await screen.findByRole("button", { name: /save each on its own/i }),
    );
    // First frame's story, then the second.
    fireEvent.click(await screen.findByRole("button", { name: /save frame/i }));
    fireEvent.click(await screen.findByRole("button", { name: /save frame/i }));

    await waitFor(() => expect(addKeeperMock).toHaveBeenCalledTimes(2));
    expect(addKeeperMock.mock.calls[0]?.[0].images).toHaveLength(1);
    expect(addKeeperMock.mock.calls[1]?.[0].images).toHaveLength(1);
  });
});
