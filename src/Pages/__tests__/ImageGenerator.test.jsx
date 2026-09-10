import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// antd's Grid/Row subscribe to matchMedia, which jsdom lacks.
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

// The faction id "AT" (Adeptus Titanicus) is deliberately one that was never in
// the generator's old hardcoded ref maps: rendering its datasheets used to
// crash with "can't access property 0, cardsFrontRef.current['AT'] is
// undefined". Buckets are data-driven now, so any faction id must work.
const titanicus = {
  id: "AT",
  name: "Adeptus Titanicus",
  colours: { banner: "#111", header: "#222" },
  datasheets: [
    { name: "Warhound Titan", cardType: "DataCard", source: "40k-10e", faction_id: "AT" },
    { name: "Reaver Titan", cardType: "DataCard", source: "40k-10e", faction_id: "AT" },
  ],
  stratagems: [],
};

// 11th edition faction shape: uuid ids and shared core stratagems stamped with
// source "40k-11e" (see get40k11eData).
const astartes = {
  id: "01623188-9470-4441-96b0-e06eb2572bb5",
  name: "Adeptus Astartes",
  colours: { banner: "#333", header: "#444" },
  datasheets: [{ name: "Intercessor Squad", cardType: "DataCard", source: "40k-11e", faction_id: "01623188" }],
  stratagems: [],
  basicStratagems: [{ name: "Command Re-roll", cardType: "stratagem", source: "40k-11e" }],
};

let mockData = [titanicus];
vi.mock("../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: { data: mockData } }),
}));
vi.mock("../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: {}, updateSettings: vi.fn() }),
}));
vi.mock("../../Helpers/screenshot.helpers", () => ({ captureToBlob: vi.fn() }));
vi.mock("../../Components/Warhammer40k-10e/CardDisplay", () => ({
  Warhammer40K10eCardDisplay: ({ card, side }) => <div data-testid="card-10e" data-side={side} data-name={card.name} />,
}));
vi.mock("../../Components/Warhammer40k-11e/CardDisplay", () => ({
  Warhammer40K11eCardDisplay: ({ card, side }) => <div data-testid="card-11e" data-side={side} data-name={card.name} />,
}));

import { ImageGenerator } from "../ImageGenerator";

// The page has two selects (edition picker + faction multi-select); target the
// faction one explicitly.
const selectFaction = (container, name) => {
  fireEvent.mouseDown(container.querySelector(".ant-select-multiple .ant-select-selector"));
  const option = Array.from(document.querySelectorAll(".ant-select-item-option")).find((el) => el.textContent === name);
  fireEvent.click(option);
};

describe("ImageGenerator", () => {
  it("renders datasheets for a faction id that is not in any hardcoded list", () => {
    mockData = [titanicus];
    const { container, getAllByTestId } = render(<ImageGenerator />);
    selectFaction(container, "Adeptus Titanicus");
    // Two datasheets, each rendered front + back.
    const cards = getAllByTestId("card-10e");
    expect(cards).toHaveLength(4);
    expect(cards[0].getAttribute("data-name")).toBe("Warhound Titan");
  });

  it("renders 11th edition datasheets and core stratagems", () => {
    mockData = [astartes];
    const { container, getAllByTestId, getByText } = render(<ImageGenerator />);
    selectFaction(container, "Adeptus Astartes");
    fireEvent.click(getByText("Stratagems"));

    const cards = getAllByTestId("card-11e");
    const names = cards.map((c) => c.getAttribute("data-name"));
    expect(names).toContain("Intercessor Squad");
    // Core stratagems carry source 40k-11e and must render through the 11e
    // display, not silently produce an empty capture node.
    expect(names).toContain("Command Re-roll");
  });
});
