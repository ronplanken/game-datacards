import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

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

const activeCard = {
  points: [{ models: "1", cost: "405", keyword: { en: "Imperium", de: "Imperium-DE" } }],
  additionalCost: { cost: "20", afterSelections: 1 },
};
const updateActiveCard = vi.fn();

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard, updateActiveCard }),
}));
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "de" } }),
}));

import { UnitPoints } from "../UnitCardEditor/UnitPoints";

describe("UnitPoints editor (11e)", () => {
  it("shows the keyword in the active card language", () => {
    const { container } = render(<UnitPoints />);
    const inputs = Array.from(container.querySelectorAll("input"));
    expect(inputs.some((i) => i.value === "Imperium-DE")).toBe(true);
  });

  it("merges keyword edits into the active language only", () => {
    updateActiveCard.mockClear();
    const { container } = render(<UnitPoints />);
    const keywordInput = Array.from(container.querySelectorAll("input")).find((i) => i.value === "Imperium-DE");
    fireEvent.change(keywordInput, { target: { value: "Neu" } });

    const updater = updateActiveCard.mock.calls[0][0];
    const nextCard = typeof updater === "function" ? updater() : updater;
    expect(nextCard.points[0].keyword).toEqual({ en: "Imperium", de: "Neu" });
  });
});
