import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const mockState = { dataSource: { data: [] } };

vi.mock("../useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: mockState.dataSource }),
}));

// The real hook debounces by 150ms; searching immediately is what the tests want.
vi.mock("../useDebounce", () => ({
  useDebounce: (value) => value,
}));

import { useGlobalSearch } from "../useGlobalSearch";

describe("useGlobalSearch", () => {
  it("finds a 40K faction's enhancements", () => {
    mockState.dataSource = {
      data: [{ id: "SM", name: "Space Marines", enhancements: [{ name: "Artificer Armour" }] }],
    };

    const { result } = renderHook(() => useGlobalSearch("artificer"));

    expect(result.current.results).toEqual([
      expect.objectContaining({ name: "Artificer Armour", cardType: "enhancement", factionName: "Space Marines" }),
    ]);
  });

  // AoS factions group enhancements by artefact/heroic trait/other, so they used
  // to be missing from search entirely.
  it("finds an AoS faction's grouped enhancements", () => {
    mockState.dataSource = {
      data: [
        {
          id: "STORMCAST_ETERNALS",
          name: "Stormcast Eternals",
          warscrolls: [],
          enhancements: {
            artefacts: [{ name: "Pennant of Azyrite Majesty" }],
            heroicTraits: [{ name: "Staunch Defender" }],
            other: [],
          },
        },
      ],
    };

    const { result } = renderHook(() => useGlobalSearch("staunch"));

    expect(result.current.results).toEqual([
      expect.objectContaining({
        name: "Staunch Defender",
        cardType: "enhancement",
        factionName: "Stormcast Eternals",
        factionId: "STORMCAST_ETERNALS",
      }),
    ]);
  });

  it("needs at least two characters", () => {
    mockState.dataSource = { data: [{ id: "SM", name: "Space Marines", enhancements: [{ name: "Aegis" }] }] };
    const { result } = renderHook(() => useGlobalSearch("a"));
    expect(result.current.results).toEqual([]);
  });
});
