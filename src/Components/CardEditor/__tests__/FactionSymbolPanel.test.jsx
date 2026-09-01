import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const saveFactionSymbol = vi.fn();
const deleteFactionSymbol = vi.fn();
const getFactionSymbolData = vi.fn();
const updateActiveCard = vi.fn();
const saveActiveCard = vi.fn();

let activeCard = {};

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard, updateActiveCard, saveActiveCard }),
}));

vi.mock("../../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({ saveFactionSymbol, deleteFactionSymbol, getFactionSymbolData, isReady: true }),
}));

vi.mock("../../Toast/message", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("../../FactionSymbolLibraryModal", () => ({
  FactionSymbolLibraryModal: ({ open, onSelect }) =>
    open ? (
      <button
        data-testid="pick-saved"
        onClick={() => onSelect({ image: "stored-blob", filename: "saved.svg", size: 900, type: "image/svg+xml" })}
      />
    ) : null,
}));

// antd's responsive Row needs matchMedia, which jsdom does not provide.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { FactionSymbolPanel } from "../FactionSymbolPanel";

describe("FactionSymbolPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFactionSymbolData.mockResolvedValue(null);
    saveFactionSymbol.mockResolvedValue(undefined);
    deleteFactionSymbol.mockResolvedValue(undefined);
    activeCard = { uuid: "card-1", hasCustomFactionSymbol: true };
  });

  it("stamps the card when a symbol is uploaded so the preview refreshes", async () => {
    render(<FactionSymbolPanel />);
    const file = new File(["x"], "badge.png", { type: "image/png" });

    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });

    await waitFor(() => expect(saveFactionSymbol).toHaveBeenCalledWith("card-1", file));
    const saved = saveActiveCard.mock.calls[0][0];
    expect(saved.hasCustomFactionSymbol).toBe(true);
    expect(saved.customFactionSymbolFilename).toBe("badge.png");
    expect(typeof saved.factionSymbolUpdatedAt).toBe("number");
  });

  it("copies a symbol picked from the library onto this card, keeping its name", async () => {
    render(<FactionSymbolPanel />);
    fireEvent.click(screen.getByRole("button", { name: /saved symbols/i }));
    fireEvent.click(screen.getByTestId("pick-saved"));

    await waitFor(() => expect(saveFactionSymbol).toHaveBeenCalledWith("card-1", "stored-blob", "saved.svg"));
    const saved = saveActiveCard.mock.calls[0][0];
    expect(saved.customFactionSymbolFilename).toBe("saved.svg");
    expect(typeof saved.factionSymbolUpdatedAt).toBe("number");
  });

  it("leaves the panel open after removing a symbol so another can be picked", async () => {
    getFactionSymbolData.mockResolvedValue({ filename: "badge.png", size: 900 });
    render(<FactionSymbolPanel />);

    await waitFor(() => expect(screen.getByText(/badge.png/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => expect(deleteFactionSymbol).toHaveBeenCalledWith("card-1"));
    const saved = saveActiveCard.mock.calls[0][0];
    expect(saved.hasCustomFactionSymbol).toBe(true);
    expect(saved.customFactionSymbolFilename).toBeNull();
  });

  it("toggles the symbol's own colours on the card", () => {
    render(<FactionSymbolPanel />);
    const colourSwitch = screen.getAllByRole("switch")[1];

    fireEvent.click(colourSwitch);

    expect(updateActiveCard).toHaveBeenCalledWith(expect.objectContaining({ keepFactionSymbolColours: true }));
  });

  it("hides the controls while the custom symbol is switched off", () => {
    activeCard = { uuid: "card-1", hasCustomFactionSymbol: false };
    render(<FactionSymbolPanel />);
    expect(screen.queryByRole("button", { name: /saved symbols/i })).toBeNull();
  });
});
