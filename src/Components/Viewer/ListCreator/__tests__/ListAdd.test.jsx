import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

let lists;
const addDatacard = vi.fn();

vi.mock("../../useMobileList", () => ({
  useMobileList: () => ({ lists, selectedList: 0, addDatacard }),
}));

describe("ListAdd", () => {
  let modalRoot;

  beforeEach(() => {
    lists = [{ cards: [] }];
    addDatacard.mockClear();
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

  it("keeps a chosen unit size selected on a list with no detachments", () => {
    activeCard = {
      name: "Intercessor Squad",
      id: "unit-2",
      faction_id: "faction-1",
      source: "40k-11e",
      keywords: [],
      points: [
        { models: 5, cost: 75 },
        { models: 10, cost: 150 },
      ],
    };

    render(<ListAdd isVisible={true} setIsVisible={vi.fn()} />);

    const addButton = screen.getByRole("button", { name: "Add to List" });
    expect(addButton).toBeDisabled();

    fireEvent.click(screen.getByText("5 models").closest("button"));

    expect(addButton).toBeEnabled();
  });

  it("clears the chosen unit size when the sheet stays open on a different card", () => {
    activeCard = {
      name: "Intercessor Squad",
      id: "unit-2",
      faction_id: "faction-1",
      source: "40k-11e",
      keywords: [],
      points: [
        { models: 5, cost: 75 },
        { models: 10, cost: 150 },
      ],
    };

    const { rerender } = render(<ListAdd isVisible={true} setIsVisible={vi.fn()} />);
    fireEvent.click(screen.getByText("10 models").closest("button"));
    expect(screen.getByRole("button", { name: "Add to List" })).toBeEnabled();

    activeCard = {
      name: "Hellblaster Squad",
      id: "unit-3",
      faction_id: "faction-1",
      source: "40k-11e",
      keywords: [],
      points: [
        { models: 5, cost: 110 },
        { models: 10, cost: 220 },
      ],
    };
    rerender(<ListAdd isVisible={true} setIsVisible={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Add to List" })).toBeDisabled();
  });

  it("moves the chosen unit size to the price that applies when the army changes", () => {
    activeCard = {
      name: "Intercessor Squad",
      id: "unit-2",
      faction_id: "faction-1",
      source: "40k-11e",
      keywords: [],
      points: [
        { models: 5, cost: 75 },
        { models: 5, cost: 80, detachment: "Gladius Task Force" },
        { models: 10, cost: 150 },
      ],
    };
    lists = [{ cards: [], detachments: [{ name: "Gladius Task Force" }] }];

    const { rerender } = render(<ListAdd isVisible={true} setIsVisible={vi.fn()} />);
    fireEvent.click(screen.getByText("5 models").closest("button"));
    expect(screen.getByText("80 pts")).toBeInTheDocument();

    lists = [{ cards: [] }];
    rerender(<ListAdd isVisible={true} setIsVisible={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add to List" }));

    expect(addDatacard).toHaveBeenCalledWith(
      activeCard,
      expect.objectContaining({ models: 5, cost: 75 }),
      undefined,
      false,
    );
  });
});
