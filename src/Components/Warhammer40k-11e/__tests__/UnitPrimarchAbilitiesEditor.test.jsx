import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

let capturedCard;
const mockUpdateActiveCard = vi.fn((arg) => {
  capturedCard = typeof arg === "function" ? arg() : arg;
});
const mockActiveCard = { ref: {} };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

// Edit in German so we can assert English siblings survive the merge.
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "de" } }),
}));

vi.mock("../../CustomMarkdownEditor", () => ({
  CustomMarkdownEditor: ({ value, onChange }) => (
    <textarea data-testid="md" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

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

import { UnitPrimarchAbilities } from "../UnitCardEditor/UnitPrimarchAbilities";

const lastCard = () => capturedCard;

const cardWithGroup = () => ({
  abilities: {
    primarch: [
      {
        name: { en: "Author of the Codex", de: "Verfasser des Kodex" },
        abilities: [
          {
            name: { en: "Master of Battle", de: "Meister der Schlacht" },
            description: { en: "Select a second enemy unit.", de: "Wahle eine zweite feindliche Einheit." },
          },
        ],
      },
    ],
  },
});

describe("11e UnitPrimarchAbilities editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCard = undefined;
    mockActiveCard.ref = {};
  });

  it("renders group and sub-ability names in the active language", () => {
    mockActiveCard.ref = cardWithGroup();
    const { getByText } = render(<UnitPrimarchAbilities />);
    expect(getByText("Verfasser des Kodex")).toBeInTheDocument();
    expect(getByText("Meister der Schlacht")).toBeInTheDocument();
  });

  it("renders without crashing when the card has no primarch abilities", () => {
    mockActiveCard.ref = { abilities: {} };
    const { getByText } = render(<UnitPrimarchAbilities />);
    expect(getByText("Add Primarch ability")).toBeInTheDocument();
  });

  it("adds a group with a name keyed to the active language", () => {
    mockActiveCard.ref = { abilities: {} };
    const { getByText } = render(<UnitPrimarchAbilities />);
    fireEvent.click(getByText("Add Primarch ability"));
    expect(lastCard().abilities.primarch).toHaveLength(1);
    expect(lastCard().abilities.primarch[0]).toEqual({
      name: { de: "New Primarch ability 1" },
      abilities: [],
    });
  });

  it("adds a sub-ability to the group it was triggered from", () => {
    mockActiveCard.ref = cardWithGroup();
    const { getByText } = render(<UnitPrimarchAbilities />);
    fireEvent.click(getByText("Add ability"));
    const abilities = lastCard().abilities.primarch[0].abilities;
    expect(abilities).toHaveLength(2);
    expect(abilities[1]).toEqual({ name: { de: "New ability 2" }, description: { de: "" } });
  });

  it("merges a sub-ability description into the active language, preserving English", () => {
    mockActiveCard.ref = cardWithGroup();
    const { getByTestId } = render(<UnitPrimarchAbilities />);
    fireEvent.change(getByTestId("md"), { target: { value: "Neuer Text." } });
    expect(lastCard().abilities.primarch[0].abilities[0].description).toEqual({
      en: "Select a second enemy unit.",
      de: "Neuer Text.",
    });
  });

  it("leaves the original card untouched when adding a sub-ability", () => {
    mockActiveCard.ref = cardWithGroup();
    const { getByText } = render(<UnitPrimarchAbilities />);
    fireEvent.click(getByText("Add ability"));
    expect(mockActiveCard.ref.abilities.primarch[0].abilities).toHaveLength(1);
  });
});
