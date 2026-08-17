import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockState = { params: {}, dataSource: { data: [] } };
const setActiveCard = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => mockState.params,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/viewer", state: null }),
}));

vi.mock("../useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: mockState.dataSource,
    selectedFaction: undefined,
    updateSelectedFaction: vi.fn(),
    clearSelectedFaction: vi.fn(),
  }),
}));

vi.mock("../useCardStorage", () => ({
  useCardStorage: () => ({ activeCard: undefined, setActiveCard }),
}));

vi.mock("../useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: {} }),
}));

import { useViewerNavigation } from "../useViewerNavigation";

describe("useViewerNavigation enhancement route", () => {
  beforeEach(() => {
    setActiveCard.mockClear();
  });

  it("opens a 40K faction's enhancement", () => {
    mockState.params = { faction: "space-marines", enhancement: "artificer-armour" };
    mockState.dataSource = {
      data: [{ id: "SM", name: "Space Marines", datasheets: [], enhancements: [{ name: "Artificer Armour" }] }],
    };

    renderHook(() => useViewerNavigation());

    expect(setActiveCard).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Artificer Armour", cardType: "enhancement", faction_id: "SM" }),
    );
  });

  // AoS factions group enhancements in an object of category-keyed arrays, so
  // the array-shaped lookup must not run against them.
  it("finds nothing for a faction whose enhancements are grouped by category", () => {
    mockState.params = { faction: "kruleboyz", enhancement: "amulet" };
    mockState.dataSource = {
      data: [
        {
          id: "KRULEBOYZ",
          name: "Kruleboyz",
          warscrolls: [],
          enhancements: { artefacts: [{ name: "Amulet" }], heroicTraits: [], other: [] },
        },
      ],
    };

    renderHook(() => useViewerNavigation());

    expect(setActiveCard).toHaveBeenCalledWith();
  });
});
