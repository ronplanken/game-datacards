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
  enhancements: [{ id: "enh-1", name: "Artificer Armour", cardType: "enhancement" }],
};

const mockDataSource = {
  schema: {
    cardTypes: [
      { key: "unit", baseType: "unit", label: "Units" },
      { key: "stratagem", baseType: "stratagem", label: "Stratagems" },
      { key: "enhancement", baseType: "enhancement", label: "Enhancements" },
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
    expect(screen.getByText("4")).toBeTruthy(); // 2 units + 1 stratagem + 1 enhancement
  });

  it("generates sections from schema.cardTypes", () => {
    render(<MobileCustomFaction />);
    expect(screen.getByText("Units")).toBeTruthy();
    expect(screen.getByText("Stratagems")).toBeTruthy();
    expect(screen.getByText("Enhancements")).toBeTruthy();
  });

  it("lists cards per section", () => {
    render(<MobileCustomFaction />);
    expect(screen.getByText("Alpha Unit")).toBeTruthy();
    expect(screen.getByText("Beta Unit")).toBeTruthy();
    expect(screen.getByText("Surprise Attack")).toBeTruthy();
    expect(screen.getByText("Artificer Armour")).toBeTruthy();
  });

  it("navigates to units page on Browse All Cards click", () => {
    render(<MobileCustomFaction />);
    fireEvent.click(screen.getByText("Browse All Cards"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction/units");
  });

  it("navigates to unit card on card click", () => {
    render(<MobileCustomFaction />);
    fireEvent.click(screen.getByText("Alpha Unit"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction/alpha-unit");
  });

  it("navigates to stratagem card with type segment", () => {
    render(<MobileCustomFaction />);
    fireEvent.click(screen.getByText("Surprise Attack"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction/stratagem/surprise-attack");
  });

  it("navigates to enhancement card with type segment", () => {
    render(<MobileCustomFaction />);
    fireEvent.click(screen.getByText("Artificer Armour"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction/enhancement/artificer-armour");
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
    // 2 units + 1 stratagem + 1 enhancement section counts
    const twos = screen.getAllByText("2");
    const ones = screen.getAllByText("1");
    expect(twos).toHaveLength(1); // Units section
    expect(ones).toHaveLength(2); // Stratagems + Enhancements sections
  });
});
