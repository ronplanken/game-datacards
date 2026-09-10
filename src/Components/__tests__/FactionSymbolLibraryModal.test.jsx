import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const listFactionSymbols = vi.fn();

vi.mock("../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({ listFactionSymbols, isReady: true }),
}));

import { FactionSymbolLibraryModal, dedupeSymbols } from "../FactionSymbolLibraryModal";

const symbol = (overrides) => ({
  id: "faction-a",
  cardUuid: "a",
  image: new Blob(["<svg />"], { type: "image/svg+xml" }),
  filename: "chapter.svg",
  size: 1024,
  type: "image/svg+xml",
  uploadedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("dedupeSymbols", () => {
  it("collapses the same symbol stored against several cards", () => {
    const result = dedupeSymbols([symbol(), symbol({ id: "faction-b", cardUuid: "b" })]);
    expect(result).toHaveLength(1);
    expect(result[0].usedOnCards).toBe(2);
  });

  it("keeps symbols that differ in name, size or type apart", () => {
    const result = dedupeSymbols([
      symbol(),
      symbol({ id: "faction-b", filename: "other.svg" }),
      symbol({ id: "faction-c", size: 2048 }),
      symbol({ id: "faction-d", type: "image/png" }),
    ]);
    expect(result).toHaveLength(4);
    expect(result.every((entry) => entry.usedOnCards === 1)).toBe(true);
  });

  it("tolerates an empty library", () => {
    expect(dedupeSymbols()).toEqual([]);
  });
});

describe("FactionSymbolLibraryModal", () => {
  beforeEach(() => {
    listFactionSymbols.mockReset();
    global.URL.createObjectURL = vi.fn(() => "blob:preview");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("lists the stored symbols and hands the picked one back", async () => {
    listFactionSymbols.mockResolvedValue([symbol(), symbol({ id: "faction-b", filename: "badge.png" })]);
    const onSelect = vi.fn();
    render(<FactionSymbolLibraryModal open onCancel={vi.fn()} onSelect={onSelect} />);

    await waitFor(() => expect(screen.getByText("chapter.svg")).toBeInTheDocument());
    expect(screen.getByText("badge.png")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("chapter.svg"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ filename: "chapter.svg" }));
  });

  it("explains itself when nothing has been uploaded yet", async () => {
    listFactionSymbols.mockResolvedValue([]);
    render(<FactionSymbolLibraryModal open onCancel={vi.fn()} onSelect={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("You have not uploaded any faction symbols yet")).toBeInTheDocument());
  });

  it("does not read the library while it is closed", () => {
    render(<FactionSymbolLibraryModal open={false} onCancel={vi.fn()} onSelect={vi.fn()} />);
    expect(listFactionSymbols).not.toHaveBeenCalled();
  });

  it("creates no preview urls when it closes while the library is loading", async () => {
    let resolveList;
    listFactionSymbols.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    const { unmount } = render(<FactionSymbolLibraryModal open onCancel={vi.fn()} onSelect={vi.fn()} />);
    unmount();
    resolveList([symbol()]);
    await waitFor(() => expect(listFactionSymbols).toHaveBeenCalled());

    // Cleanup has already run, so a url made now would never be revoked.
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("releases the preview urls it created when it closes", async () => {
    listFactionSymbols.mockResolvedValue([symbol()]);
    const { unmount } = render(<FactionSymbolLibraryModal open onCancel={vi.fn()} onSelect={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("chapter.svg")).toBeInTheDocument());
    unmount();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
});
