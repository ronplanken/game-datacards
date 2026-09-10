import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListAdd } from "../ListAdd";

// Age of Sigmar factions group enhancements in an object of category-keyed
// arrays; 40K factions use a flat array. ListAdd stays mounted behind every
// mobile card, so an AoS warscroll used to take the whole page down with
// "enhancements.filter is not a function" before it could bail out.
const aosFaction = {
  id: "KRULEBOYZ",
  name: "Kruleboyz",
  enhancements: { artefacts: [], heroicTraits: [], other: [] },
};

const k40Faction = {
  id: "faction-1",
  name: "Space Marines",
  detachments: [{ name: "Gladius Task Force" }],
  enhancements: [{ name: "Artificer Armour", cost: 15, keywords: ["Adeptus Astartes"] }],
};

let activeCard;

vi.mock("../../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard }),
}));

vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: { data: [aosFaction, k40Faction] } }),
}));

vi.mock("../../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: {}, updateSettings: vi.fn() }),
}));

vi.mock("../../../../Hooks/useUmami", () => ({
  useUmami: () => ({ trackEvent: vi.fn() }),
}));

vi.mock("../../useMobileList", () => ({
  useMobileList: () => ({ lists: [{ cards: [] }], selectedList: 0, addDatacard: vi.fn() }),
}));

describe("ListAdd", () => {
  let modalRoot;

  beforeEach(() => {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
    document.body.style.overflow = "";
  });

  it("renders nothing for an AoS warscroll instead of crashing on grouped enhancements", () => {
    activeCard = {
      name: "Killaboss on Great Gnashtoof",
      id: "warscroll-1",
      faction_id: "KRULEBOYZ",
      cardType: "warscroll",
      source: "aos",
      keywords: ["Hero", "Character"],
      points: 170,
    };

    const { container } = render(<ListAdd isVisible={false} setIsVisible={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("offers a 40K unit's eligible enhancements", () => {
    activeCard = {
      name: "Captain",
      id: "unit-1",
      faction_id: "faction-1",
      source: "40k-10e",
      keywords: ["Character"],
      factions: ["Adeptus Astartes"],
      points: [{ models: 1, cost: 80, active: true }],
    };

    render(<ListAdd isVisible={true} setIsVisible={vi.fn()} />);
    expect(screen.getByText("Add Captain")).toBeInTheDocument();
    expect(screen.getByText("Artificer Armour")).toBeInTheDocument();
  });
});
