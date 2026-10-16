import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockUpdateActiveCard = vi.fn();
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

import { UnitKeywords } from "../UnitCardEditor/UnitKeywords";
import { UnitModelKeywords } from "../UnitCardEditor/UnitModelKeywords";

const heroes = () => ({
  keywords: [{ en: "Infantry" }, { en: "Tacticus" }, { en: "Character" }],
  modelKeywords: [{ name: { en: "Ancient" }, keywords: [{ en: "Character" }] }],
});

const lastUpdate = () => {
  const arg = mockUpdateActiveCard.mock.calls.at(-1)[0];
  return typeof arg === "function" ? arg(mockActiveCard.ref) : arg;
};

describe("11e keyword editors with model keywords", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveCard.ref = heroes();
  });

  it("lists only the shared keywords in the keywords editor", () => {
    render(<UnitKeywords type="keywords" localized />);
    expect(screen.getByText("Keywords (all models)")).toBeInTheDocument();
    expect(screen.getByText("Infantry")).toBeInTheDocument();
    expect(screen.queryByText("Character")).not.toBeInTheDocument();
  });

  it("keeps model keywords in the full list when a shared keyword is removed", () => {
    const { container } = render(<UnitKeywords type="keywords" localized />);
    fireEvent.click(container.querySelector(".keyword_container button"));
    expect(lastUpdate().keywords).toEqual([{ en: "Tacticus" }, { en: "Character" }]);
  });

  it("drops a model keyword from the full list when it is removed from the model", () => {
    render(<UnitModelKeywords />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Character" }));
    expect(lastUpdate()).toMatchObject({
      keywords: [{ en: "Infantry" }, { en: "Tacticus" }],
      modelKeywords: [{ name: { en: "Ancient" }, keywords: [] }],
    });
  });

  it("adds a model to a card from older data without model keywords", () => {
    mockActiveCard.ref = { keywords: [{ en: "Infantry" }] };
    render(<UnitModelKeywords />);
    fireEvent.click(screen.getByRole("button", { name: "Add model" }));
    expect(lastUpdate()).toMatchObject({
      keywords: [{ en: "Infantry" }],
      modelKeywords: [{ name: { en: "Model 1" }, keywords: [] }],
    });
  });

  it("edits keywords as before when the card has no model keywords", () => {
    mockActiveCard.ref = { keywords: [{ en: "Infantry" }] };
    render(<UnitKeywords type="keywords" localized />);
    expect(screen.getByText("Keywords")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add keyword" }));
    expect(lastUpdate().keywords).toEqual([{ en: "Infantry" }, { en: "New keyword 2" }]);
    expect(lastUpdate().modelKeywords).toBeUndefined();
  });
});
