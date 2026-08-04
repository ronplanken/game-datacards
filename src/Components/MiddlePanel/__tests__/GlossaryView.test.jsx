import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlossaryView } from "../GlossaryView";

const mockSelectedFaction = { id: "f", name: "Faction", colours: { header: "#333", banner: "#666" } };

let mockDataSource = {
  schema: {
    keywordGlossary: [
      { key: "one-shot", name: "One Shot", description: "Once per battle.", appliesTo: ["weapons"] },
      { key: "anti", name: "Anti-", description: "Critical wound.", matchType: "prefix", appliesTo: ["weapons"] },
    ],
  },
};

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: mockDataSource,
    selectedFaction: mockSelectedFaction,
  }),
}));

describe("GlossaryView", () => {
  it("renders the header with the entry count and the shared list", () => {
    render(<GlossaryView />);
    expect(screen.getByText("Keyword Glossary")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("One Shot")).toBeTruthy();
    expect(screen.getByPlaceholderText("Search keywords")).toBeTruthy();
  });

  it("renders gracefully when the datasource has no glossary", () => {
    mockDataSource = { schema: {} };
    render(<GlossaryView />);
    expect(screen.getByText("Keyword Glossary")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("This datasource has no glossary entries yet.")).toBeTruthy();
    mockDataSource = {
      schema: {
        keywordGlossary: [
          { key: "one-shot", name: "One Shot", description: "Once per battle.", appliesTo: ["weapons"] },
        ],
      },
    };
  });
});
