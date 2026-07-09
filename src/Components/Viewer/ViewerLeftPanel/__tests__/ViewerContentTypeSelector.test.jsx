import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewerContentTypeSelector } from "../ViewerContentTypeSelector";

let mockSelectedFaction = null;
let mockDataSource = null;
let mockIsCustomDatasource = false;

vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    selectedFaction: mockSelectedFaction,
    dataSource: mockDataSource,
    isCustomDatasource: mockIsCustomDatasource,
  }),
}));

const openDropdown = (container) => {
  fireEvent.click(container.querySelector(".viewer-content-type-trigger"));
};

describe("ViewerContentTypeSelector (custom datasource)", () => {
  beforeEach(() => {
    mockIsCustomDatasource = true;
    mockSelectedFaction = {
      id: "faction-1",
      name: "Test Faction",
      datasheets: [
        { id: "a", name: "Alpha", cardType: "infantry" },
        { id: "b", name: "Beta", cardType: "elite" },
      ],
    };
    mockDataSource = {
      id: "ds-1",
      schema: {
        cardTypes: [
          { key: "infantry", baseType: "unit", label: "Infantry" },
          { key: "elite", baseType: "unit", label: "Elite" },
          { key: "empty", baseType: "stratagem", label: "Empty Type" },
        ],
      },
    };
  });

  it("lists custom card types that have cards (regression: dropdown was empty)", () => {
    const { container } = render(
      <ViewerContentTypeSelector selectedContentType="infantry" setSelectedContentType={() => {}} />,
    );
    openDropdown(container);
    const options = container.querySelectorAll(".viewer-content-type-option");
    const labels = Array.from(options).map((o) => o.textContent);
    expect(labels).toContain("Infantry");
    expect(labels).toContain("Elite");
  });

  it("hides custom card types that have no cards", () => {
    const { container } = render(
      <ViewerContentTypeSelector selectedContentType="infantry" setSelectedContentType={() => {}} />,
    );
    openDropdown(container);
    expect(screen.queryByText("Empty Type")).toBeFalsy();
  });

  it("renders nothing when no faction is selected", () => {
    mockSelectedFaction = null;
    const { container } = render(
      <ViewerContentTypeSelector selectedContentType="infantry" setSelectedContentType={() => {}} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
