import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const mockState = {
  dataSource: {},
  selectedFaction: {},
  settings: {},
};

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: mockState.dataSource, selectedFaction: mockState.selectedFaction }),
}));
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: mockState.settings }),
}));

import { useDataSourceItems } from "../useDataSourceItems";

const strat = (name) => ({ name, cardType: "stratagem" });

describe("useDataSourceItems stratagems section", () => {
  it("renders Basic and Faction sections when core stratagems exist (10e)", () => {
    mockState.settings = { selectedDataSource: "40k-10e" };
    mockState.selectedFaction = {
      stratagems: [strat("Faction Strat")],
      basicStratagems: [strat("Command Re-roll")],
    };
    const { result } = renderHook(() => useDataSourceItems("stratagems", ""));
    const headers = result.current.filter((i) => i.type === "header").map((i) => i.name);
    expect(headers).toEqual(["Basic stratagems", "Faction stratagems"]);
  });

  it("skips the empty Basic section when a datasource ships no core stratagems (11e)", () => {
    mockState.settings = { selectedDataSource: "40k-11e" };
    mockState.selectedFaction = {
      stratagems: [strat("Adaptive Tactics")],
      basicStratagems: [],
    };
    const { result } = renderHook(() => useDataSourceItems("stratagems", ""));
    const headers = result.current.filter((i) => i.type === "header").map((i) => i.name);
    expect(headers).toEqual(["Faction stratagems"]);
    expect(result.current.some((i) => i.name === "Adaptive Tactics")).toBe(true);
  });

  it("returns only faction stratagems when basic stratagems are hidden", () => {
    mockState.settings = { selectedDataSource: "40k-10e", hideBasicStratagems: true };
    mockState.selectedFaction = {
      stratagems: [strat("Faction Strat")],
      basicStratagems: [strat("Command Re-roll")],
    };
    const { result } = renderHook(() => useDataSourceItems("stratagems", ""));
    expect(result.current.every((i) => i.type !== "header")).toBe(true);
    expect(result.current.map((i) => i.name)).toEqual(["Faction Strat"]);
  });
});

describe("useDataSourceItems enhancements section", () => {
  it("lists a 40K faction's enhancements", () => {
    mockState.settings = { selectedDataSource: "40k-10e" };
    mockState.selectedFaction = { enhancements: [{ name: "Artificer Armour" }] };
    const { result } = renderHook(() => useDataSourceItems("enhancements", ""));
    expect(result.current.map((i) => i.name)).toEqual(["Artificer Armour"]);
    expect(result.current[0].cardType).toBe("enhancement");
  });

  // AoS factions group enhancements in an object of category-keyed arrays, which
  // this 40K-shaped list cannot read.
  it("returns nothing for a faction whose enhancements are grouped by category", () => {
    mockState.settings = { selectedDataSource: "aos" };
    mockState.selectedFaction = { enhancements: { artefacts: [{ name: "Amulet" }], heroicTraits: [], other: [] } };
    const { result } = renderHook(() => useDataSourceItems("enhancements", ""));
    expect(result.current).toEqual([]);
  });
});
