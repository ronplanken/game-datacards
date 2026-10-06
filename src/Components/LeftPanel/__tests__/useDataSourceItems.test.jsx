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

  // AoS factions group enhancements in an object of category-keyed arrays, and
  // carry a source ("aos-4e") that no card renderer is keyed on.
  it("flattens an AoS faction's grouped enhancements and routes them to the AoS renderer", () => {
    mockState.settings = { selectedDataSource: "aos" };
    mockState.selectedFaction = {
      warscrolls: [],
      enhancements: { artefacts: [{ name: "Amulet", source: "aos-4e" }], heroicTraits: [], other: [] },
    };
    const { result } = renderHook(() => useDataSourceItems("enhancements", ""));
    expect(result.current).toEqual([
      expect.objectContaining({ name: "Amulet", cardType: "enhancement", source: "aos" }),
    ]);
  });

  it("returns nothing for a faction with no enhancements", () => {
    mockState.settings = { selectedDataSource: "aos" };
    mockState.selectedFaction = { warscrolls: [], enhancements: { artefacts: [], heroicTraits: [], other: [] } };
    const { result } = renderHook(() => useDataSourceItems("enhancements", ""));
    expect(result.current).toEqual([]);
  });
});

describe("useDataSourceItems stratagem detachment grouping", () => {
  const detachmentStrat = (name, detachment) => ({ ...strat(name), detachment });

  it("leaves stratagems in one flat list by default", () => {
    mockState.settings = { selectedDataSource: "40k-11e" };
    mockState.selectedFaction = {
      stratagems: [detachmentStrat("Ere We Go", "Blitz Brigade"), detachmentStrat("Wall of Dakka", "Dread Mob")],
      basicStratagems: [],
    };
    const { result } = renderHook(() => useDataSourceItems("stratagems", ""));
    expect(result.current.some((i) => i.type === "role")).toBe(false);
  });

  it("splits stratagems into collapsible detachment sections when enabled", () => {
    mockState.settings = { selectedDataSource: "40k-11e", groupStratagemsByDetachment: true };
    mockState.selectedFaction = {
      stratagems: [
        detachmentStrat("Ere We Go", "Blitz Brigade"),
        detachmentStrat("Wall of Dakka", "Dread Mob"),
        detachmentStrat("Ramming Speed", "Blitz Brigade"),
      ],
      basicStratagems: [],
    };
    const { result } = renderHook(() => useDataSourceItems("stratagems", ""));
    expect(result.current.map((i) => i.name)).toEqual([
      "Faction stratagems",
      "Blitz Brigade",
      "Ere We Go",
      "Ramming Speed",
      "Dread Mob",
      "Wall of Dakka",
    ]);
  });

  it("leaves core stratagems flat under the Basic section", () => {
    mockState.settings = { selectedDataSource: "40k-11e", groupStratagemsByDetachment: true };
    mockState.selectedFaction = {
      stratagems: [detachmentStrat("Ere We Go", "Blitz Brigade")],
      basicStratagems: [strat("Command Re-roll")],
    };
    const { result } = renderHook(() => useDataSourceItems("stratagems", ""));
    const basicIndex = result.current.findIndex((i) => i.name === "Command Re-roll");
    expect(result.current[basicIndex].type).toBeUndefined();
    expect(result.current[basicIndex - 1].name).toBe("Basic stratagems");
  });
});

describe("useDataSourceItems datasheets section", () => {
  // 11e keywords are language-keyed objects, so role grouping has to match on
  // the canonical English keyword rather than on string equality.
  const sheet11e = (name, ...keywords) => ({ id: name, name, keywords: keywords.map((k) => ({ en: k })) });

  it("groups an 11e faction's datasheets by role", () => {
    mockState.settings = { selectedDataSource: "40k-11e", groupByRole: true };
    mockState.dataSource = { data: [] };
    mockState.selectedFaction = {
      id: "orks",
      name: "Orks",
      datasheets: [sheet11e("Boyz", "Battleline"), sheet11e("Warboss", "Character"), sheet11e("Stompa", "Titanic")],
    };
    const { result } = renderHook(() => useDataSourceItems("datasheets", ""));
    expect(result.current.map((i) => i.name)).toEqual([
      "Character",
      "Warboss",
      "Battleline",
      "Boyz",
      "Dedicated Transport",
      "Other",
      "Stompa",
    ]);
  });

  it("sorts an 11e faction's datasheets alphabetically when grouping is off", () => {
    mockState.settings = { selectedDataSource: "40k-11e" };
    mockState.dataSource = { data: [] };
    mockState.selectedFaction = {
      id: "orks",
      name: "Orks",
      datasheets: [sheet11e("Warboss", "Character"), sheet11e("Boyz", "Battleline")],
    };
    const { result } = renderHook(() => useDataSourceItems("datasheets", ""));
    expect(result.current.filter((i) => !i.type).map((i) => i.name)).toEqual(["Boyz", "Warboss"]);
  });
});
