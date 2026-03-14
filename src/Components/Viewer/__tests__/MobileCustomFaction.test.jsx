import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileCustomFaction } from "../MobileCustomFaction";

// Mock navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock hooks
const mockSelectedFaction = {
  id: "test-faction",
  name: "Test Faction",
  colours: { header: "#333", banner: "#666" },
  datasheets: [
    { id: "unit-1", name: "Alpha Unit", cardType: "unit" },
    { id: "unit-2", name: "Beta Unit", cardType: "unit" },
  ],
  stratagems: [{ id: "strat-1", name: "Surprise Attack", cardType: "stratagem" }],
};

const mockDataSource = {
  schema: {
    cardTypes: [
      { key: "unit", baseType: "unit", label: "Units" },
      { key: "stratagem", baseType: "stratagem", label: "Stratagems" },
    ],
  },
};

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: mockDataSource,
    selectedFaction: mockSelectedFaction,
  }),
}));

describe("MobileCustomFaction", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders faction name", () => {
    render(<MobileCustomFaction />);
    expect(screen.getByText("Test Faction")).toBeTruthy();
  });

  it("renders Browse All Cards button with total card count", () => {
    render(<MobileCustomFaction />);
    expect(screen.getByText("Browse All Cards")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy(); // 2 units + 1 stratagem
  });

  it("generates sections from schema.cardTypes", () => {
    render(<MobileCustomFaction />);
    expect(screen.getByText("Units")).toBeTruthy();
    expect(screen.getByText("Stratagems")).toBeTruthy();
  });

  it("lists cards per section", () => {
    render(<MobileCustomFaction />);
    expect(screen.getByText("Alpha Unit")).toBeTruthy();
    expect(screen.getByText("Beta Unit")).toBeTruthy();
    expect(screen.getByText("Surprise Attack")).toBeTruthy();
  });

  it("navigates to units page on Browse All Cards click", () => {
    render(<MobileCustomFaction />);
    fireEvent.click(screen.getByText("Browse All Cards"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction/units");
  });

  it("navigates to card on card click", () => {
    render(<MobileCustomFaction />);
    fireEvent.click(screen.getByText("Alpha Unit"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction/alpha-unit");
  });

  it("shows section card counts", () => {
    render(<MobileCustomFaction />);
    // 2 units + 1 stratagem section counts
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });
});
