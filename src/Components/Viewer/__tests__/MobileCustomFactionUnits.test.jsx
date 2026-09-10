import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileCustomFactionUnits } from "../MobileCustomFactionUnits";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

let mockSelectedFaction = null;
let mockDataSource = null;

const mockUpdateSettings = vi.fn();
const mockSettings = { mobileUnitsViewMode: "grouped" };

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: mockDataSource,
    selectedFaction: mockSelectedFaction,
  }),
}));

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({
    settings: mockSettings,
    updateSettings: mockUpdateSettings,
  }),
}));

describe("MobileCustomFactionUnits", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUpdateSettings.mockClear();
    mockSelectedFaction = {
      id: "test-faction",
      name: "Test Faction",
      colours: { header: "#333", banner: "#666" },
      datasheets: [
        { id: "unit-1", name: "Alpha Unit", cardType: "unit" },
        { id: "unit-2", name: "Beta Unit", cardType: "unit" },
        { id: "unit-3", name: "Charlie Unit", cardType: "unit" },
      ],
    };
    mockDataSource = {
      schema: {
        cardTypes: [{ key: "unit", baseType: "unit", label: "Units" }],
      },
    };
  });

  it("renders faction name", () => {
    render(<MobileCustomFactionUnits />);
    expect(screen.getByText("Test Faction")).toBeTruthy();
  });

  it("shows card count", () => {
    render(<MobileCustomFactionUnits />);
    expect(screen.getByText("3 cards")).toBeTruthy();
  });

  it("renders unit names in grouped view", () => {
    render(<MobileCustomFactionUnits />);
    expect(screen.getByText("Alpha Unit")).toBeTruthy();
    expect(screen.getByText("Beta Unit")).toBeTruthy();
    expect(screen.getByText("Charlie Unit")).toBeTruthy();
  });

  it("renders unit names in alphabetical view", () => {
    render(<MobileCustomFactionUnits />);
    fireEvent.click(screen.getByText("A-Z"));
    expect(screen.getByText("Alpha Unit")).toBeTruthy();
    expect(screen.getByText("Beta Unit")).toBeTruthy();
    expect(screen.getByText("Charlie Unit")).toBeTruthy();
  });

  it("shows card type section header with count in grouped view", () => {
    render(<MobileCustomFactionUnits />);
    expect(screen.getByText("Units")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("navigates to card on click", () => {
    render(<MobileCustomFactionUnits />);
    fireEvent.click(screen.getByText("Alpha Unit"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction/alpha-unit");
  });

  it("saves view mode in settings", () => {
    render(<MobileCustomFactionUnits />);
    fireEvent.click(screen.getByText("A-Z"));
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ mobileUnitsViewMode: "alphabetical" }));
  });

  it("groups cards by subcategory within card type when hasSubcategory is enabled", () => {
    mockSelectedFaction = {
      id: "test-faction",
      name: "Test Faction",
      colours: { header: "#333", banner: "#666" },
      datasheets: [
        { id: "unit-1", name: "Alpha Unit", cardType: "unit", subcategory: "Core" },
        { id: "unit-2", name: "Beta Unit", cardType: "unit", subcategory: "Core" },
        { id: "unit-3", name: "Gamma Unit", cardType: "unit", subcategory: "Elite" },
        { id: "unit-4", name: "Delta Unit", cardType: "unit", subcategory: "" },
      ],
    };
    mockDataSource = {
      schema: {
        cardTypes: [{ key: "unit", baseType: "unit", label: "Units", schema: { metadata: { hasSubcategory: true } } }],
      },
    };

    render(<MobileCustomFactionUnits />);
    // Subcategory headers should appear
    expect(screen.getByText("Core")).toBeTruthy();
    expect(screen.getByText("Elite")).toBeTruthy();
    expect(screen.getByText("Uncategorized")).toBeTruthy();
    // Cards should still be present
    expect(screen.getByText("Alpha Unit")).toBeTruthy();
    expect(screen.getByText("Gamma Unit")).toBeTruthy();
    expect(screen.getByText("Delta Unit")).toBeTruthy();
  });

  it("does not show subcategory headers when all cards are uncategorized", () => {
    mockSelectedFaction = {
      id: "test-faction",
      name: "Test Faction",
      colours: { header: "#333", banner: "#666" },
      datasheets: [
        { id: "unit-1", name: "Alpha Unit", cardType: "unit" },
        { id: "unit-2", name: "Beta Unit", cardType: "unit" },
      ],
    };
    mockDataSource = {
      schema: {
        cardTypes: [{ key: "unit", baseType: "unit", label: "Units", schema: { metadata: { hasSubcategory: true } } }],
      },
    };

    render(<MobileCustomFactionUnits />);
    expect(screen.getByText("Alpha Unit")).toBeTruthy();
    expect(screen.getByText("Beta Unit")).toBeTruthy();
    expect(screen.queryByText("Uncategorized")).toBeFalsy();
  });

  it("returns null when no faction is selected", () => {
    mockSelectedFaction = null;
    const { container } = render(<MobileCustomFactionUnits />);
    expect(container.innerHTML).toBe("");
  });
});
