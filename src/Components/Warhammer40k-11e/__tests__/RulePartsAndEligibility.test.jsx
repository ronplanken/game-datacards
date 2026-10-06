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

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "de" } }),
}));

vi.mock("../../CustomMarkdownEditor", () => ({
  CustomMarkdownEditor: ({ value, onChange }) => (
    <textarea className="md-editor" value={value} onChange={(e) => onChange(e.target.value)} />
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

import { RuleCardInfo } from "../RuleEditor/RuleCardInfo";
import { EnhancementEligibility } from "../EnhancementEditor/EnhancementEligibility";

// The datasource ships `quote` and `textItalic` parts (rulebook examples) that
// the card deliberately skips. The editor used to offer text/header/accordion
// only, so opening the type dropdown on such a part and picking anything turned
// it into body text with no way back.
describe("11e rule part types", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCard = undefined;
  });

  it("keeps a quote part's own type selected", () => {
    mockActiveCard.ref = { rules: [{ order: 0, type: "quote", text: { de: "Beispiel" } }] };
    const { container } = render(<RuleCardInfo />);

    expect(container.querySelector(".ant-select-selection-item").textContent).toBe("Quote (not shown on card)");
  });

  it("offers the non-rendering types alongside the rendering ones", () => {
    mockActiveCard.ref = { rules: [{ order: 0, type: "text", text: { de: "Text" } }] };
    const { container } = render(<RuleCardInfo />);

    fireEvent.mouseDown(container.querySelector(".ant-select-selector"));

    const options = [...document.querySelectorAll(".ant-select-item-option-content")].map((o) => o.textContent);
    expect(options).toEqual([
      "Text",
      "Header",
      "Accordion (bulleted)",
      "Quote (not shown on card)",
      "Example (not shown on card)",
    ]);
  });
});

// `keywords` / `excludes` / `equipableByNonCharacter` decide which units may take
// an enhancement in the list builder (isUnitEnhancementEligible). They were
// carried along on every edit but could not be set.
describe("11e enhancement list eligibility editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCard = undefined;
    mockActiveCard.ref = { name: { en: "Ironskein" }, keywords: ["Kâhl"], excludes: [] };
  });

  it("shows the required keywords", () => {
    const { getByText } = render(<EnhancementEligibility />);

    expect(getByText("Kâhl")).toBeInTheDocument();
  });

  it("adds a keyword as a plain string, since matching is on English", () => {
    const { getByText } = render(<EnhancementEligibility />);

    fireEvent.click(getByText("Add required keyword"));

    expect(capturedCard.keywords).toEqual(["Kâhl", "New keyword 2"]);
  });

  it("adds excluded keywords to their own list", () => {
    const { getByText } = render(<EnhancementEligibility />);

    fireEvent.click(getByText("Add excluded keyword"));

    expect(capturedCard.excludes).toEqual(["New keyword 1"]);
    expect(capturedCard.keywords).toEqual(["Kâhl"]);
  });

  it("removes a keyword", () => {
    const { container } = render(<EnhancementEligibility />);

    const entry = [...container.querySelectorAll(".keyword_container")].find((row) => row.textContent.includes("Kâhl"));
    fireEvent.click(entry.querySelector("button.ant-btn-text"));

    expect(capturedCard.keywords).toEqual([]);
  });

  it("marks an enhancement as an Upgrade", () => {
    const { container } = render(<EnhancementEligibility />);

    fireEvent.click(container.querySelector("button.ant-switch"));

    expect(capturedCard.equipableByNonCharacter).toBe(true);
  });

  it("reads an existing Upgrade flag", () => {
    mockActiveCard.ref = { equipableByNonCharacter: true, keywords: [] };
    const { container } = render(<EnhancementEligibility />);

    expect(container.querySelector("button.ant-switch").className).toContain("ant-switch-checked");
  });
});
