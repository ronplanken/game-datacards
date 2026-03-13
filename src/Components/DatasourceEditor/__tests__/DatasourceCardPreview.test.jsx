import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { DatasourceCardPreview } from "../DatasourceCardPreview";

// Mock react-fitty (used by Custom* cards)
vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span>{children}</span>,
}));

// Track TemplateRenderer calls
const mockTemplateRenderer = vi.fn(() => <div data-testid="template-renderer" />);
vi.mock("../../../Premium", () => ({
  TemplateRenderer: (props) => mockTemplateRenderer(props),
}));

const makeSchema = (cardTypes = [], baseSystem = "40k-10e") => ({
  version: "1.0.0",
  baseSystem,
  cardTypes,
});

const unitCardType = {
  key: "unit",
  label: "Unit",
  baseType: "unit",
  schema: {
    stats: { label: "Stats", allowMultipleProfiles: false, fields: [] },
    weaponTypes: { label: "Weapons", allowMultiple: true, types: [] },
    abilities: { label: "Abilities", categories: [] },
    metadata: { hasKeywords: false, hasFactionKeywords: false, hasPoints: false, pointsFormat: "per-model" },
  },
};

const stratagemCardType = {
  key: "stratagem",
  label: "Stratagem",
  baseType: "stratagem",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "description", label: "Description", type: "richtext" },
    ],
  },
};

const makeDatasource = (cardTypes, baseSystem = "40k-10e") => ({
  id: "ds-1",
  name: "Test DS",
  schema: makeSchema(cardTypes, baseSystem),
  data: [
    {
      id: "faction-1",
      name: "Test Faction",
      colours: { header: "#111", banner: "#222" },
    },
  ],
});

describe("DatasourceCardPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when card is null", () => {
    const { container } = render(<DatasourceCardPreview card={null} activeDatasource={makeDatasource([])} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when activeDatasource is null", () => {
    const card = { id: "c1", cardType: "unit", faction_id: "faction-1" };
    const { container } = render(<DatasourceCardPreview card={card} activeDatasource={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows error when no matching card type definition is found", () => {
    const card = { id: "c1", cardType: "unknown-type", faction_id: "faction-1" };
    render(<DatasourceCardPreview card={card} activeDatasource={makeDatasource([])} />);
    expect(screen.getByText(/No matching card type definition/)).toBeTruthy();
  });

  it("renders TemplateRenderer when card has a templateId", () => {
    const card = {
      id: "c1",
      cardType: "unit",
      templateId: "tmpl-123",
      faction_id: "faction-1",
      name: "Test Unit",
    };
    const ds = makeDatasource([unitCardType]);
    render(<DatasourceCardPreview card={card} activeDatasource={ds} />);

    expect(mockTemplateRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: "tmpl-123",
        card,
        faction: ds.data[0],
      }),
    );
    expect(screen.getByTestId("template-renderer")).toBeTruthy();
  });

  it("renders Custom unit card when no templateId and baseType is unit", () => {
    const card = {
      id: "c1",
      cardType: "unit",
      faction_id: "faction-1",
      name: "Test Unit",
      stats: [],
      weapons: {},
      abilities: [],
    };
    const ds = makeDatasource([unitCardType]);
    const { container } = render(<DatasourceCardPreview card={card} activeDatasource={ds} />);

    // TemplateRenderer should NOT have been called
    expect(mockTemplateRenderer).not.toHaveBeenCalled();
    // Should render the custom unit card
    expect(container.querySelector(".custom-unit-card")).toBeTruthy();
  });

  it("renders Custom stratagem card when no templateId and baseType is stratagem", () => {
    const card = {
      id: "c1",
      cardType: "stratagem",
      faction_id: "faction-1",
      name: "Test Stratagem",
      description: "Do something",
    };
    const ds = makeDatasource([stratagemCardType]);
    const { container } = render(<DatasourceCardPreview card={card} activeDatasource={ds} />);

    expect(mockTemplateRenderer).not.toHaveBeenCalled();
    expect(container.querySelector(".custom-stratagem-card")).toBeTruthy();
  });

  it("uses template rendering for AoS-based datasource when templateId present", () => {
    const card = {
      id: "c1",
      cardType: "unit",
      templateId: "aos-tmpl-1",
      faction_id: "faction-1",
      name: "Warscroll Unit",
    };
    const ds = makeDatasource([unitCardType], "aos");
    render(<DatasourceCardPreview card={card} activeDatasource={ds} />);

    expect(mockTemplateRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: "aos-tmpl-1",
      }),
    );
  });

  it("falls back to Custom card for AoS-based datasource without templateId", () => {
    const card = {
      id: "c1",
      cardType: "unit",
      faction_id: "faction-1",
      name: "Warscroll Unit",
      stats: [],
      weapons: {},
      abilities: [],
    };
    const ds = makeDatasource([unitCardType], "aos");
    const { container } = render(<DatasourceCardPreview card={card} activeDatasource={ds} />);

    expect(mockTemplateRenderer).not.toHaveBeenCalled();
    expect(container.querySelector(".custom-unit-card")).toBeTruthy();
  });
});
