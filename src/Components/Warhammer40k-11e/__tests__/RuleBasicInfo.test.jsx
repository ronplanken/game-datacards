import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
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
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: {
      data: [
        {
          id: "f1",
          detachments: [
            { name: "A", forceDispositions: [{ name: { en: "Take and Hold" } }, { name: { en: "Disruption" } }] },
            { name: "B", forceDisposition: { name: { en: "Disruption" } } },
          ],
        },
      ],
    },
  }),
}));

vi.mock("../FactionSelect", () => ({
  FactionSelect: () => <div data-testid="faction-select" />,
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

import { RuleBasicInfo } from "../RuleEditor/RuleBasicInfo";

const selectors = (container) => [...container.querySelectorAll(".ant-select-selector")];

describe("11e rule basic info", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCard = undefined;
  });

  it("hides the detachment fields on an army rule", () => {
    mockActiveCard.ref = { name: "Rule", ruleType: "army" };
    render(<RuleBasicInfo />);
    expect(screen.queryByText("Detachment Points")).not.toBeInTheDocument();
    expect(screen.queryByText("Force dispositions")).not.toBeInTheDocument();
  });

  it("shows 1 DP when a detachment rule has no cost yet", () => {
    mockActiveCard.ref = { name: "Rule", ruleType: "detachment", detachment: "Wrath" };
    const { container } = render(<RuleBasicInfo />);
    expect(screen.getByText("Detachment Points")).toBeInTheDocument();
    expect(container.querySelectorAll(".ant-select-selection-item")[1].textContent).toBe("1 DP");
  });

  it("stores the chosen Detachment Points as a number", () => {
    mockActiveCard.ref = { name: "Rule", ruleType: "detachment", detachment: "Wrath" };
    const { container } = render(<RuleBasicInfo />);
    fireEvent.mouseDown(selectors(container)[1]);
    fireEvent.click(screen.getByTitle("3 DP"));
    expect(capturedCard.detachmentPoints).toBe(3);
  });

  it("offers the force dispositions used by the datasource", () => {
    mockActiveCard.ref = { name: "Rule", ruleType: "detachment", detachment: "Wrath" };
    const { container } = render(<RuleBasicInfo />);
    fireEvent.mouseDown(selectors(container)[2]);
    const options = [...document.querySelectorAll(".ant-select-item-option-content")].map((o) => o.textContent);
    expect(options).toEqual(["Disruption", "Take and Hold"]);
  });

  it("stores picked force dispositions as a list", () => {
    mockActiveCard.ref = { name: "Rule", ruleType: "detachment", detachment: "Wrath" };
    const { container } = render(<RuleBasicInfo />);
    fireEvent.mouseDown(selectors(container)[2]);
    fireEvent.click(screen.getByTitle("Disruption"));
    expect(capturedCard.forceDispositions).toEqual([{ name: "Disruption" }]);
  });

  it("shows the stored force dispositions and clears the field when all are removed", () => {
    mockActiveCard.ref = {
      name: "Rule",
      ruleType: "detachment",
      detachment: "Wrath",
      forceDispositions: [{ name: "Purge the Foe" }],
      forceDisposition: { name: "Purge the Foe" },
    };
    const { container } = render(<RuleBasicInfo />);
    expect(screen.getByText("Purge the Foe")).toBeInTheDocument();
    fireEvent.click(container.querySelector(".ant-select-selection-item-remove"));
    expect(capturedCard.forceDispositions).toBeUndefined();
    expect(capturedCard.forceDisposition).toBeUndefined();
  });
});
