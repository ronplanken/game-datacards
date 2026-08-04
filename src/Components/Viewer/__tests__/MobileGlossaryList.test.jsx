import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileGlossaryList } from "../MobileGlossaryList";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockSelectedFaction = {
  id: "test-faction",
  name: "Test Faction",
  colours: { header: "#333", banner: "#666" },
};

const mockDataSource = {
  schema: {
    keywordGlossary: [
      {
        key: "one-shot",
        name: "One Shot",
        description: "The bearer can only shoot with this weapon once per battle.",
        matchType: "exact",
        appliesTo: ["weapons"],
      },
      {
        key: "anti",
        name: "Anti-",
        description: "An unmodified Wound roll of 'x+' scores a Critical Wound.",
        matchType: "prefix",
        appliesTo: ["weapons", "abilities"],
      },
    ],
  },
};

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: mockDataSource,
    selectedFaction: mockSelectedFaction,
  }),
}));

describe("MobileGlossaryList", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the glossary header with entry count", () => {
    render(<MobileGlossaryList />);
    expect(screen.getByText("Keyword Glossary")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("renders the shared glossary list content", () => {
    render(<MobileGlossaryList />);
    expect(screen.getByText("One Shot")).toBeTruthy();
    expect(screen.getByText(/Anti-/)).toBeTruthy();
    expect(screen.getByPlaceholderText("Search keywords")).toBeTruthy();
  });

  it("navigates back to the faction overview", () => {
    const { container } = render(<MobileGlossaryList />);
    fireEvent.click(container.querySelector(".mobile-glossary-back"));
    expect(mockNavigate).toHaveBeenCalledWith("/mobile/test-faction");
  });
});
