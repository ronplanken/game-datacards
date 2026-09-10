import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// The active card is swapped per test; updateActiveCard resolves an updater
// thunk synchronously, like the real hook, and records the resulting card.
let capturedCard;
const mockUpdateActiveCard = vi.fn((arg) => {
  capturedCard = typeof arg === "function" ? arg() : arg;
});
const mockActiveCard = { ref: {} };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard: mockActiveCard.ref, updateActiveCard: mockUpdateActiveCard }),
}));

// Edit in German so we can assert English siblings survive.
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "de" } }),
}));

vi.mock("../../CustomMarkdownEditor", () => ({
  CustomMarkdownEditor: ({ value, onChange }) => (
    <textarea data-testid="md" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) => children({ droppableProps: {}, innerRef: vi.fn(), placeholder: null }),
  Draggable: ({ children }) => children({ draggableProps: {}, dragHandleProps: {}, innerRef: vi.fn() }),
}));

// antd Form.Item renders an internal Row which subscribes to matchMedia.
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

import { UnitWargearOptions } from "../UnitCardEditor/UnitWargearOptions";

const card = (over = {}) => ({
  wargear: [],
  wargearOptions: [
    {
      instruction: { en: "Replace the grav-cannon:", de: "Ersetze die Grav-Kanone:" },
      options: [{ name: { en: "Twin lascannon", de: "Doppel-Laserkanone" }, cost: "5" }],
    },
  ],
  ...over,
});

// Option rows are a plain two-column list, not labelled form rows, so they are
// found by their aria-label.
const byLabel = (container, label) => container.querySelector(`[aria-label="${label}"]`);

const buttonNamed = (getAllByText, text) => getAllByText(text)[0].closest("button");

describe("11e wargear options editor", () => {
  beforeEach(() => {
    capturedCard = undefined;
    mockUpdateActiveCard.mockClear();
    mockActiveCard.ref = card();
  });

  it("shows instructions, option names and costs in the active card language", () => {
    const { container } = render(<UnitWargearOptions />);
    const values = Array.from(container.querySelectorAll("input, textarea")).map((el) => el.value);
    expect(values).toContain("Ersetze die Grav-Kanone:");
    expect(values).toContain("Doppel-Laserkanone");
    expect(values).toContain("5");
  });

  it("merges instruction edits into the active language only", () => {
    const { container } = render(<UnitWargearOptions />);
    const textarea = container.querySelector("textarea.ant-input");
    fireEvent.change(textarea, { target: { value: "Neue Anweisung" } });
    expect(capturedCard.wargearOptions[0].instruction).toEqual({
      en: "Replace the grav-cannon:",
      de: "Neue Anweisung",
    });
  });

  it("merges option name edits into the active language only", () => {
    const { container } = render(<UnitWargearOptions />);
    const nameInput = Array.from(container.querySelectorAll("input")).find((i) => i.value === "Doppel-Laserkanone");
    fireEvent.change(nameInput, { target: { value: "Plasmakanone" } });
    expect(capturedCard.wargearOptions[0].options[0].name).toEqual({
      en: "Twin lascannon",
      de: "Plasmakanone",
    });
  });

  it("stores the cost as the string the datasource uses", () => {
    const { container } = render(<UnitWargearOptions />);
    const costInput = Array.from(container.querySelectorAll("input")).find((i) => i.value === "5");
    fireEvent.change(costInput, { target: { value: "15" } });
    expect(capturedCard.wargearOptions[0].options[0].cost).toBe("15");
  });

  it("adds an option to a group, priced at nothing until edited", () => {
    const { getAllByText, container } = render(<UnitWargearOptions />);
    fireEvent.click(buttonNamed(getAllByText, "Add option"));
    expect(capturedCard.wargearOptions[0].options).toHaveLength(2);
    expect(capturedCard.wargearOptions[0].options[1]).toEqual({ name: { de: "" }, cost: "0" });
    expect(byLabel(container, "Option 1")).toBeTruthy();
  });

  it("adds an empty group", () => {
    const { getAllByText } = render(<UnitWargearOptions />);
    fireEvent.click(buttonNamed(getAllByText, "Add wargear option"));
    expect(capturedCard.wargearOptions).toHaveLength(2);
    expect(capturedCard.wargearOptions[1]).toEqual({ instruction: { de: "" }, options: [] });
  });

  it("removes an option without touching the rest of the group", () => {
    mockActiveCard.ref = card({
      wargearOptions: [
        {
          instruction: { en: "Replace:" },
          options: [
            { name: { en: "Axe" }, cost: "0" },
            { name: { en: "Hammer" }, cost: "5" },
          ],
        },
      ],
    });
    const { container } = render(<UnitWargearOptions />);
    // Each option row ends in its own remove button.
    fireEvent.click(byLabel(container, "Option 1").querySelector("button"));
    expect(capturedCard.wargearOptions[0].options).toEqual([{ name: { en: "Hammer" }, cost: "5" }]);
  });

  it("leaves the card's stored groups untouched when editing", () => {
    const original = mockActiveCard.ref.wargearOptions;
    const { getAllByText } = render(<UnitWargearOptions />);
    fireEvent.click(buttonNamed(getAllByText, "Add option"));
    expect(original[0].options).toHaveLength(1);
  });

  // Only one wargear editor is ever on screen: the structured groups while the
  // card has any, the flat sentences otherwise.
  it("hides the flat wargear text while the card has structured groups", () => {
    mockActiveCard.ref = card({ wargear: [{ en: "None" }] });
    const { queryByTestId } = render(<UnitWargearOptions />);
    expect(queryByTestId("md")).toBeNull();
  });

  it("edits the flat wargear text on a card without structured groups", () => {
    mockActiveCard.ref = card({ wargear: [{ en: "None" }], wargearOptions: [] });
    const { getByTestId } = render(<UnitWargearOptions />);
    fireEvent.change(getByTestId("md"), { target: { value: "Nimm eine Plasmapistole." } });
    expect(capturedCard.wargear).toEqual([{ en: "None", de: "Nimm eine Plasmapistole." }]);
  });

  it("can still promote a text-only card to structured options", () => {
    mockActiveCard.ref = card({ wargear: [{ en: "None" }], wargearOptions: [] });
    const { getAllByText } = render(<UnitWargearOptions />);
    fireEvent.click(buttonNamed(getAllByText, "Add wargear option"));
    expect(capturedCard.wargearOptions).toEqual([{ instruction: { de: "" }, options: [] }]);
  });
});
