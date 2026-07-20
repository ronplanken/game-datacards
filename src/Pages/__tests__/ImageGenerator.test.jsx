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

vi.mock("../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: { data: [titanicus] } }),
}));
vi.mock("../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: {}, updateSettings: vi.fn() }),
}));
vi.mock("../../Helpers/screenshot.helpers", () => ({ captureToBlob: vi.fn() }));
vi.mock("../../Components/Warhammer40k-10e/CardDisplay", () => ({
  Warhammer40K10eCardDisplay: ({ card, side }) => <div data-testid="card-10e" data-side={side} data-name={card.name} />,
}));

import { ImageGenerator } from "../ImageGenerator";

const selectFaction = (container, name) => {
  fireEvent.mouseDown(container.querySelector(".ant-select-selector"));
  const option = Array.from(document.querySelectorAll(".ant-select-item-option")).find((el) => el.textContent === name);
  fireEvent.click(option);
};

describe("ImageGenerator", () => {
  it("renders datasheets for a faction id that is not in any hardcoded list", () => {
    const { container, getAllByTestId } = render(<ImageGenerator />);
    selectFaction(container, "Adeptus Titanicus");
    // Two datasheets, each rendered front + back.
    const cards = getAllByTestId("card-10e");
    expect(cards).toHaveLength(4);
    expect(cards[0].getAttribute("data-name")).toBe("Warhound Titan");
  });
});
