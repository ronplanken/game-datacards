import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UnitLinksSection } from "../sections/UnitLinksSection";
import { resolveEditorSections } from "../editorSchemaResolvers";

const schema = {
  version: "1.0.0",
  baseSystem: "40k-11e",
  cardTypes: [
    {
      key: "unit",
      label: "Unit",
      baseType: "unit",
      schema: {
        stats: { label: "Stats", fields: [] },
        weaponTypes: { label: "Weapons", types: [] },
        abilities: { label: "Abilities", categories: [] },
        unitLinks: {
          groups: [
            { key: "leads", label: "Leader", description: "This unit can lead the following units:" },
            { key: "supports", label: "Support" },
          ],
        },
        metadata: { hasKeywords: false, hasFactionKeywords: false, hasPoints: false, pointsFormat: "per-unit" },
      },
    },
  ],
};

const dataSource = {
  schema,
  data: [
    {
      id: "f1",
      name: "Space Wolves",
      datasheets: [
        { id: "c1", name: "Wolf Lord", cardType: "unit" },
        { id: "c2", name: "Blood Claws", cardType: "unit" },
        { id: "c3", name: "Grey Hunters", cardType: "unit" },
      ],
    },
  ],
};

vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource }),
}));

const config = { groupKey: "leads", description: "This unit can lead the following units:" };

const renderSection = (card, replaceCard = vi.fn()) => {
  render(<UnitLinksSection card={card} config={config} label="Leader" replaceCard={replaceCard} />);
  return replaceCard;
};

describe("mobile unit links section", () => {
  it("adds one editor section per link group for custom unit cards", () => {
    const sections = resolveEditorSections({ name: "Wolf Lord", cardType: "unit" }, "custom-1", schema);
    const linkSections = sections.filter((s) => s.type === "unitLinks");
    expect(linkSections.map((s) => s.label)).toEqual(["Leader", "Support"]);
    expect(linkSections[0].config).toEqual({
      groupKey: "leads",
      description: "This unit can lead the following units:",
    });
  });

  it("does not add link sections when the schema has none", () => {
    const plain = {
      ...schema,
      cardTypes: [{ ...schema.cardTypes[0], schema: { ...schema.cardTypes[0].schema, unitLinks: undefined } }],
    };
    const sections = resolveEditorSections({ name: "Wolf Lord", cardType: "unit" }, "custom-1", plain);
    expect(sections.some((s) => s.type === "unitLinks")).toBe(false);
  });

  it("offers other unit cards, but not the card itself", () => {
    renderSection({ id: "c1", unitLinks: { leads: [{ cardId: "c2", name: "Blood Claws" }] } });
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toContain("Blood Claws (Space Wolves)");
    expect(options).toContain("Grey Hunters (Space Wolves)");
    expect(options).not.toContain("Wolf Lord (Space Wolves)");
    expect(screen.getByRole("combobox")).toHaveValue("c2");
  });

  it("adds a link to the first available card", () => {
    const replaceCard = renderSection({ id: "c1" });
    fireEvent.click(screen.getByText("Add unit"));
    expect(replaceCard).toHaveBeenCalledWith({
      id: "c1",
      unitLinks: { leads: [{ cardId: "c2", name: "Blood Claws" }] },
    });
  });

  it("adds the next card that is not linked yet", () => {
    const replaceCard = renderSection({ id: "c1", unitLinks: { leads: [{ cardId: "c2", name: "Blood Claws" }] } });
    fireEvent.click(screen.getByText("Add unit"));
    expect(replaceCard.mock.calls[0][0].unitLinks.leads[1]).toEqual({ cardId: "c3", name: "Grey Hunters" });
  });

  it("changes the linked card", () => {
    const replaceCard = renderSection({ id: "c1", unitLinks: { leads: [{ cardId: "c2", name: "Blood Claws" }] } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "c3" } });
    expect(replaceCard.mock.calls[0][0].unitLinks.leads).toEqual([{ cardId: "c3", name: "Grey Hunters" }]);
  });

  it("switches to a free-text name", () => {
    const replaceCard = renderSection({ id: "c1", unitLinks: { leads: [{ cardId: "c2", name: "Blood Claws" }] } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "__free_text__" } });
    expect(replaceCard.mock.calls[0][0].unitLinks.leads).toEqual([{ name: "Blood Claws" }]);
  });

  it("removes a link and keeps other groups", () => {
    const replaceCard = renderSection({
      id: "c1",
      unitLinks: { leads: [{ cardId: "c2", name: "Blood Claws" }], supports: [{ name: "Other" }] },
    });
    fireEvent.click(screen.getByLabelText("Remove unit"));
    expect(replaceCard.mock.calls[0][0].unitLinks).toEqual({ leads: [], supports: [{ name: "Other" }] });
  });
});
