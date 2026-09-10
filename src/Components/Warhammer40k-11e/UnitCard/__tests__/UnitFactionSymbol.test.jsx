import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const getFactionSymbolUrl = vi.fn();

vi.mock("../../../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({ getFactionSymbolUrl, isReady: true }),
}));

vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: { data: [{ id: "faction-uuid", name: "Chaos Space Marines" }] },
  }),
}));

vi.mock("../../../Icons/FactionIcon", () => ({
  FactionIcon: ({ factionId }) => <div data-testid="faction-icon" data-candidates={[].concat(factionId).join(",")} />,
}));

import { UnitFactionSymbol } from "../UnitFactionSymbol";

const unit = {
  uuid: "card-uuid",
  faction_id: "faction-uuid",
  factions: ["Chaos", "Heretic Astartes"],
};

describe("UnitFactionSymbol (11e)", () => {
  beforeEach(() => {
    getFactionSymbolUrl.mockReset();
    global.URL.createObjectURL = vi.fn(() => "blob:symbol");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("resolves the default symbol from the faction keyword and the faction name", () => {
    render(<UnitFactionSymbol unit={unit} />);
    expect(screen.getByTestId("faction-icon").dataset.candidates).toBe("CSM");
  });

  it("does not pass the faction uuid to the icon (it is not a symbol code)", () => {
    render(<UnitFactionSymbol unit={{ ...unit, factions: [] }} />);
    expect(screen.getByTestId("faction-icon").dataset.candidates).toBe("CSM");
  });

  it("renders an uploaded custom symbol instead of the default one", async () => {
    getFactionSymbolUrl.mockResolvedValue("blob:symbol");
    const { container } = render(<UnitFactionSymbol unit={{ ...unit, hasCustomFactionSymbol: true }} />);

    await waitFor(() => expect(container.querySelector(".faction > div")).toBeTruthy());
    expect(screen.queryByTestId("faction-icon")).toBeNull();
    expect(getFactionSymbolUrl).toHaveBeenCalledWith("card-uuid");
  });

  it("renders an external custom symbol without an upload", () => {
    render(
      <UnitFactionSymbol
        unit={{ ...unit, hasCustomFactionSymbol: true, externalFactionSymbol: "https://example.test/s.svg" }}
      />,
    );
    expect(screen.queryByTestId("faction-icon")).toBeNull();
  });

  it("falls back to the default symbol when the custom symbol is enabled but empty", () => {
    render(<UnitFactionSymbol unit={{ ...unit, hasCustomFactionSymbol: true }} />);
    expect(screen.getByTestId("faction-icon").dataset.candidates).toBe("CSM");
  });
});
