import React from "react";
import { render, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const getFactionSymbolUrl = vi.fn();

vi.mock("../../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({ getFactionSymbolUrl, isReady: true }),
}));

import { CustomFactionSymbol, useCustomFactionSymbolUrl } from "../CustomFactionSymbol";

const Probe = ({ card }) => {
  const url = useCustomFactionSymbolUrl(card);
  return <div data-testid="url">{url || "none"}</div>;
};

describe("useCustomFactionSymbolUrl", () => {
  beforeEach(() => {
    getFactionSymbolUrl.mockReset();
    global.URL.revokeObjectURL = vi.fn();
  });

  it("re-reads the stored symbol when it is replaced on the same card", async () => {
    // Regression: uploading over an existing symbol changes neither the card
    // uuid nor the enabled flag, so the preview kept showing the old image
    // until the switch was toggled off and on again.
    getFactionSymbolUrl.mockResolvedValueOnce("blob:first").mockResolvedValueOnce("blob:second");
    const card = { uuid: "card-1", hasCustomFactionSymbol: true, factionSymbolUpdatedAt: 1 };

    const { getByTestId, rerender } = render(<Probe card={card} />);
    await waitFor(() => expect(getByTestId("url").textContent).toBe("blob:first"));

    rerender(<Probe card={{ ...card, factionSymbolUpdatedAt: 2 }} />);
    await waitFor(() => expect(getByTestId("url").textContent).toBe("blob:second"));
    expect(getFactionSymbolUrl).toHaveBeenCalledTimes(2);
  });

  it("does not re-read when nothing about the symbol changed", async () => {
    getFactionSymbolUrl.mockResolvedValue("blob:first");
    const card = { uuid: "card-1", hasCustomFactionSymbol: true, factionSymbolUpdatedAt: 1 };

    const { getByTestId, rerender } = render(<Probe card={card} />);
    await waitFor(() => expect(getByTestId("url").textContent).toBe("blob:first"));

    rerender(<Probe card={{ ...card, factionSymbolScale: 1.2 }} />);
    expect(getFactionSymbolUrl).toHaveBeenCalledTimes(1);
  });

  it("reads nothing while the custom symbol is switched off", async () => {
    const { getByTestId } = render(<Probe card={{ uuid: "card-1", hasCustomFactionSymbol: false }} />);
    await waitFor(() => expect(getByTestId("url").textContent).toBe("none"));
    expect(getFactionSymbolUrl).not.toHaveBeenCalled();
  });
});

describe("CustomFactionSymbol", () => {
  it("flattens the symbol to black by default", () => {
    const { container } = render(<CustomFactionSymbol card={{}} imageUrl="blob:s" />);
    expect(getComputedStyle(container.firstChild).filter).toContain("saturate(0%)");
  });

  it("keeps the symbol's own colours when the card asks for them", () => {
    const { container } = render(<CustomFactionSymbol card={{ keepFactionSymbolColours: true }} imageUrl="blob:s" />);
    expect(getComputedStyle(container.firstChild).filter).toBe("none");
  });
});
