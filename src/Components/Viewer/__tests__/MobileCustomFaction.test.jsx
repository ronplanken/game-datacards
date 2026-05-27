import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileCustomFaction } from "../MobileCustomFaction";

// Mock navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Dynamic mock state
let mockSelectedFaction = {
  id: "test-faction",
  name: "Test Faction",
  colours: { header: "#333", banner: "#666" },
  datasheets: [
    { id: "unit-1", name: "Alpha Unit", cardType: "unit" },
    { id: "unit-2", name: "Beta Unit", cardType: "unit" },
  ],
  stratagems: [{ id: "strat-1", name: "Surprise Attack", cardType: "stratagem" }],
};

let mockDataSource = {
  schema: {
    cardTypes: [
      { key: "unit", baseType: "unit", label: "Units" },
      { key: "stratagem", baseType: "stratagem", label: "Stratagems" },
    ],
    keywordGlossary: [
      { key: "a", name: "A", description: "desc", appliesTo: ["weapons"] },
      { key: "b", name: "B", description: "desc", appliesTo: ["weapons"] },
      { key: "c", name: "C", description: "desc", appliesTo: ["weapons"] },
      { key: "d", name: "D", description: "desc", appliesTo: ["weapons"] },
      { key: "e", name: "E", description: "desc", appliesTo: ["weapons"] },
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

  it("renders Keyword Glossary button with entry count", () => {
    render(<MobileCustomFaction />);
    expect(screen.getByText("Keyword Glossary")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("navigates to glossary page on Keyword Glossary click", () => {
    render(<MobileCustomFaction />);
    fireEvent.click(screen.getByText("Keyword Glossary"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction/glossary");
  });

  it("shows section card counts", () => {
    render(<MobileCustomFaction />);
    // 2 units + 1 stratagem section counts
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("groups cards by subcategory when hasSubcategory is enabled", () => {
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

    render(<MobileCustomFaction />);
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

    render(<MobileCustomFaction />);
    // No subcategory headers, cards rendered directly
    expect(screen.getByText("Alpha Unit")).toBeTruthy();
    expect(screen.getByText("Beta Unit")).toBeTruthy();
    expect(screen.queryByText("Uncategorized")).toBeFalsy();
  });
});
