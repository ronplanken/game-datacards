import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CardRenderer } from "../CardRenderer";

const settings = { showCardsAsDoubleSided: false };

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ isCustomDatasource: true }),
}));
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings }),
}));
vi.mock("../../Custom/CustomCardDisplay", () => ({
  CustomCardDisplay: ({ side }) => <div data-testid="custom-card">{side}</div>,
}));
vi.mock("../../AgeOfSigmar/CardDisplay", () => ({ AgeOfSigmarCardDisplay: () => null }));
vi.mock("../../Necromunda/CardDisplay", () => ({ NecromundaCardDisplay: () => null }));
vi.mock("../../Warhammer40k-10e/CardDisplay", () => ({ Warhammer40K10eCardDisplay: () => null }));
vi.mock("../../Warhammer40k-11e/CardDisplay", () => ({ Warhammer40K11eCardDisplay: () => null }));
vi.mock("../../Warhammer40k/CardDisplay", () => ({ Warhammer40KCardDisplay: () => null }));

const card = { source: "custom-1", cardType: "unit" };

describe("CardRenderer custom cards", () => {
  beforeEach(() => {
    settings.showCardsAsDoubleSided = false;
  });

  it("passes the printed side to the card", () => {
    render(<CardRenderer card={card} printSide="back" />);
    expect(screen.getByTestId("custom-card").textContent).toBe("back");
  });

  it("uses the forced side from a Front and back entry over the card's own side", () => {
    render(<CardRenderer card={{ ...card, print_side: "back" }} printSide="front" forcePrintSide />);
    expect(screen.getByTestId("custom-card").textContent).toBe("front");
  });

  it("uses the card's own side when nothing forces one", () => {
    render(<CardRenderer card={{ ...card, print_side: "back" }} printSide="front" />);
    expect(screen.getByTestId("custom-card").textContent).toBe("back");
  });

  it("prints both faces with double-sided display on", () => {
    settings.showCardsAsDoubleSided = true;
    render(<CardRenderer card={card} printSide="front" />);
    expect(screen.getByTestId("custom-card").textContent).toBe("frontAndBack");
  });
});
