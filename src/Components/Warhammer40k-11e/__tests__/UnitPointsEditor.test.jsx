import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";

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

// Keep drag-and-drop out of the way; we only exercise the field wiring.
vi.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) => children({ droppableProps: {}, innerRef: vi.fn(), placeholder: null }),
  Draggable: ({ children }) => children({ draggableProps: {}, dragHandleProps: {}, innerRef: vi.fn() }),
}));

const baseCard = () => ({
  points: [{ models: "1", cost: "405", keyword: { en: "Imperium", de: "Imperium-DE" } }],
  additionalCost: { cost: "20", afterSelections: 1 },
});
const mockActiveCard = { ref: baseCard() };
const updateActiveCard = vi.fn();

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard: mockActiveCard.ref, updateActiveCard }),
}));
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "de" } }),
}));

import { UnitPoints } from "../UnitCardEditor/UnitPoints";

const nextCardFrom = (call) => (typeof call[0] === "function" ? call[0]() : call[0]);
const inputAfterLabel = (container, label) => {
  const item = Array.from(container.querySelectorAll(".ant-form-item")).find((el) => el.textContent.includes(label));
  return item.querySelector("input");
};

describe("UnitPoints editor (11e)", () => {
  beforeEach(() => {
    mockActiveCard.ref = baseCard();
    updateActiveCard.mockClear();
  });

  it("shows the keyword in the active card language", () => {
    const { container } = render(<UnitPoints />);
    const inputs = Array.from(container.querySelectorAll("input"));
    expect(inputs.some((i) => i.value === "Imperium-DE")).toBe(true);
  });

  it("merges keyword edits into the active language only", () => {
    const { container } = render(<UnitPoints />);
    const keywordInput = Array.from(container.querySelectorAll("input")).find((i) => i.value === "Imperium-DE");
    fireEvent.change(keywordInput, { target: { value: "Neu" } });

    expect(nextCardFrom(updateActiveCard.mock.calls[0]).points[0].keyword).toEqual({ en: "Imperium", de: "Neu" });
  });
});

// A tier can be priced for one detachment or one faction; unrestricted tiers
// store null, the shape the source data uses.
describe("UnitPoints editor tier restrictions (11e)", () => {
  beforeEach(() => {
    mockActiveCard.ref = baseCard();
    updateActiveCard.mockClear();
  });

  it("starts a language-keyed value for a tier that had no restriction", () => {
    const { container } = render(<UnitPoints />);
    fireEvent.change(inputAfterLabel(container, "Detachment"), { target: { value: "Pantheon of Woe" } });

    expect(nextCardFrom(updateActiveCard.mock.calls[0]).points[0].detachment).toEqual({ de: "Pantheon of Woe" });
  });

  it("merges into the active language when a restriction already exists", () => {
    mockActiveCard.ref.points[0].faction = { en: "Blood Angels" };
    const { container } = render(<UnitPoints />);
    fireEvent.change(inputAfterLabel(container, "Faction"), { target: { value: "Blutengel" } });

    expect(nextCardFrom(updateActiveCard.mock.calls[0]).points[0].faction).toEqual({
      en: "Blood Angels",
      de: "Blutengel",
    });
  });

  it("clears an emptied restriction back to null", () => {
    mockActiveCard.ref.points[0].detachment = { en: "Pantheon of Woe" };
    const { container } = render(<UnitPoints />);
    fireEvent.change(inputAfterLabel(container, "Detachment"), { target: { value: "  " } });

    expect(nextCardFrom(updateActiveCard.mock.calls[0]).points[0].detachment).toBeNull();
  });

  it("shows an existing restriction in the active card language", () => {
    mockActiveCard.ref.points[0].faction = { en: "Blood Angels", de: "Blutengel" };
    const { container } = render(<UnitPoints />);
    expect(inputAfterLabel(container, "Faction").value).toBe("Blutengel");
  });

  it("allows only one restriction per tier", () => {
    mockActiveCard.ref.points[0].faction = { en: "Blood Angels" };
    const { container } = render(<UnitPoints />);
    expect(inputAfterLabel(container, "Detachment").disabled).toBe(true);
    expect(inputAfterLabel(container, "Faction").disabled).toBe(false);
  });

  it("adds new tiers without a restriction", () => {
    const { getByText } = render(<UnitPoints />);
    fireEvent.click(getByText("Add points"));

    const added = nextCardFrom(updateActiveCard.mock.calls[0]).points[1];
    expect(added.detachment).toBeUndefined();
    expect(added.faction).toBeUndefined();
  });
});
