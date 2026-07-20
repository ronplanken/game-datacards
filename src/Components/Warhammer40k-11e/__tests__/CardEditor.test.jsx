import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockActiveCard = { ref: null };
const mockSettings = { ref: { showCardsAsDoubleSided: false } };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard: mockActiveCard.ref }),
}));
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: mockSettings.ref }),
}));

vi.mock("../UnitCardEditor", () => ({ UnitCardEditor: () => <div data-testid="front" /> }));
vi.mock("../UnitCardBackEditor", () => ({ UnitCardBackEditor: () => <div data-testid="back" /> }));
vi.mock("../UnitCardFullEditor", () => ({ UnitCardFullEditor: () => <div data-testid="full" /> }));
vi.mock("../StratagemEditor", () => ({ StratagemEditor: () => <div data-testid="stratagem" /> }));
vi.mock("../EnhancementEditor", () => ({ EnhancementEditor: () => <div data-testid="enhancement" /> }));
vi.mock("../RuleEditor", () => ({ RuleEditor: () => <div data-testid="rule" /> }));

import { Warhammer40K11eCardEditor } from "../CardEditor";

describe("Warhammer40K11eCardEditor routing", () => {
  beforeEach(() => {
    mockActiveCard.ref = null;
    mockSettings.ref = { showCardsAsDoubleSided: false };
  });

  it("renders nothing without an active card", () => {
    const { container } = render(<Warhammer40K11eCardEditor />);
    expect(container.firstChild).toBeNull();
  });

  it("routes a double-sided DataCard front to the front editor", () => {
    mockActiveCard.ref = { cardType: "DataCard", variant: "double", print_side: "front" };
    render(<Warhammer40K11eCardEditor />);
    expect(screen.getByTestId("front")).toBeInTheDocument();
  });

  it("routes a double-sided DataCard back to the back editor", () => {
    mockActiveCard.ref = { cardType: "DataCard", variant: "double", print_side: "back" };
    render(<Warhammer40K11eCardEditor />);
    expect(screen.getByTestId("back")).toBeInTheDocument();
  });

  it("routes a full variant DataCard to the full editor", () => {
    mockActiveCard.ref = { cardType: "DataCard", variant: "full" };
    render(<Warhammer40K11eCardEditor />);
    expect(screen.getByTestId("full")).toBeInTheDocument();
  });

  it("routes a DataCard to the full editor when settings force double-sided rendering", () => {
    mockSettings.ref = { showCardsAsDoubleSided: true };
    mockActiveCard.ref = { cardType: "DataCard", variant: "double" };
    render(<Warhammer40K11eCardEditor />);
    expect(screen.getByTestId("full")).toBeInTheDocument();
  });

  it("routes stratagem, enhancement and rule card types", () => {
    mockActiveCard.ref = { cardType: "stratagem" };
    const { rerender } = render(<Warhammer40K11eCardEditor />);
    expect(screen.getByTestId("stratagem")).toBeInTheDocument();

    mockActiveCard.ref = { cardType: "enhancement" };
    rerender(<Warhammer40K11eCardEditor />);
    expect(screen.getByTestId("enhancement")).toBeInTheDocument();

    mockActiveCard.ref = { cardType: "rule" };
    rerender(<Warhammer40K11eCardEditor />);
    expect(screen.getByTestId("rule")).toBeInTheDocument();
  });
});
