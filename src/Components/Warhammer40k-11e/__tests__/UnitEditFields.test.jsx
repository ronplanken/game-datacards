import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// The active card is mutated per-test via this ref so each editor sees the shape
// it needs. updateActiveCard accepts either the next card object or an updater
// thunk; like the real hook it resolves the thunk synchronously (while the
// change event is still fresh) and records the resulting card.
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

// Edit in German so we can assert English siblings are preserved.
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "de" } }),
}));

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: { data: [] } }),
}));

// The markdown editor is replaced with a plain textarea so jsdom can render it
// and onChange returns a plain string just like the real component.
vi.mock("../../CustomMarkdownEditor", () => ({
  CustomMarkdownEditor: ({ value, onChange }) => (
    <textarea data-testid="md" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
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

import { StratagemBasicInfo } from "../StratagemEditor/StratagemBasicInfo";
import { UnitDamageTable } from "../UnitCardEditor/UnitDamageTable";
import { UnitInvulnerableSave } from "../UnitCardEditor/UnitInvulnerableSave";

const lastCard = () => capturedCard;

describe("11e edit-in-place localisation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCard = undefined;
  });

  it("merges a localised name into the active language and preserves siblings", () => {
    mockActiveCard.ref = { name: { en: "Original", de: "Vorher" }, cost: "1", phase: [] };
    const { container } = render(<StratagemBasicInfo />);
    const nameInput = [...container.querySelectorAll("input.ant-input")].find((i) => i.value === "Vorher");
    fireEvent.change(nameInput, { target: { value: "Nachher" } });
    expect(lastCard().name).toEqual({ en: "Original", de: "Nachher" });
  });

  it("keeps a plain scalar field plain (cost is not localised)", () => {
    mockActiveCard.ref = { name: { en: "N" }, cost: "1", phase: [] };
    const { container } = render(<StratagemBasicInfo />);
    const costInput = [...container.querySelectorAll("input.ant-input")].find((i) => i.value === "1");
    fireEvent.change(costInput, { target: { value: "2" } });
    expect(lastCard().cost).toBe("2");
  });

  it("merges the damaged range into the active language, preserving English", () => {
    mockActiveCard.ref = { abilities: { damaged: { range: { en: "1-5", de: "1-5" }, description: { en: "" } } } };
    const { container } = render(<UnitDamageTable />);
    const rangeInput = container.querySelector("input.ant-input");
    fireEvent.change(rangeInput, { target: { value: "1-4" } });
    expect(lastCard().abilities.damaged.range).toEqual({ en: "1-5", de: "1-4" });
  });

  it("writes the invulnerable save value as a plain string", () => {
    mockActiveCard.ref = { abilities: { invul: { value: "4+" } } };
    const { container } = render(<UnitInvulnerableSave />);
    const valueInput = container.querySelector("input.ant-input");
    fireEvent.change(valueInput, { target: { value: "5+" } });
    expect(lastCard().abilities.invul.value).toBe("5+");
  });
});
