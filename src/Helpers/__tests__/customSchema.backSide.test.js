import { describe, it, expect } from "vitest";
import {
  applyBackSideDefaults,
  cardTypeHasBackSide,
  create40k11ePreset,
  getAbilityCategorySide,
  getSectionSide,
  isDefaultBackSection,
  schemaHasBackSide,
  validateSchema,
} from "../customSchema.helpers";
import { exportDatasource, prepareDatasourceForImport, validateCustomDatasource } from "../customDatasource.helpers";

const unitType = () => create40k11ePreset().cardTypes.find((ct) => ct.baseType === "unit");

const makeSchema = (hasBackSide) => ({
  metadata: { hasBackSide },
  sections: {
    label: "Sections",
    sections: [
      { key: "wargear-options", label: "Wargear Options", format: "list" },
      { key: "special", label: "Special Rules", format: "list" },
    ],
  },
});

describe("isDefaultBackSection", () => {
  it("matches the default keys", () => {
    ["wargear-options", "unit-composition", "loadout"].forEach((key) => {
      expect(isDefaultBackSection({ key, label: "Other" })).toBe(true);
    });
  });

  it("matches the default labels in any case", () => {
    expect(isDefaultBackSection({ key: "section_4", label: " LOADOUT " })).toBe(true);
    expect(isDefaultBackSection({ key: "section_4", label: "Unit composition" })).toBe(true);
  });

  it("does not match other sections", () => {
    expect(isDefaultBackSection({ key: "special", label: "Special Rules" })).toBe(false);
    expect(isDefaultBackSection(undefined)).toBe(false);
  });
});

describe("schemaHasBackSide and cardTypeHasBackSide", () => {
  const cardType = { baseType: "unit", schema: { metadata: { hasBackSide: true } } };

  it("is true for unit card types on both 40K editions", () => {
    expect(cardTypeHasBackSide(cardType, "40k-10e")).toBe(true);
    expect(cardTypeHasBackSide(cardType, "40k-11e")).toBe(true);
  });

  it("is false for other base systems and card types", () => {
    ["aos", "blank", "starcraft-tmg", undefined].forEach((baseSystem) => {
      expect(cardTypeHasBackSide(cardType, baseSystem)).toBe(false);
    });
    expect(cardTypeHasBackSide({ ...cardType, baseType: "stratagem" }, "40k-11e")).toBe(false);
  });

  it("is false when the option is off or absent", () => {
    expect(schemaHasBackSide({ metadata: { hasBackSide: false } }, "40k-11e")).toBe(false);
    expect(schemaHasBackSide({ metadata: {} }, "40k-11e")).toBe(false);
    expect(cardTypeHasBackSide(null, "40k-11e")).toBe(false);
  });
});

describe("getSectionSide", () => {
  it("puts everything on the front while the option is off", () => {
    const schema = makeSchema(false);
    expect(getSectionSide(schema, { key: "loadout", label: "Loadout", side: "back" })).toBe("front");
  });

  it("uses the default split when no side is stored", () => {
    const schema = makeSchema(true);
    expect(getSectionSide(schema, { key: "section_4", label: "Loadout" })).toBe("back");
    expect(getSectionSide(schema, { key: "section_4", label: "Special Rules" })).toBe("front");
  });

  it("prefers an explicit side over the default", () => {
    const schema = makeSchema(true);
    expect(getSectionSide(schema, { key: "loadout", label: "Loadout", side: "front" })).toBe("front");
    expect(getSectionSide(schema, { key: "special", label: "Special Rules", side: "back" })).toBe("back");
  });
});

describe("getAbilityCategorySide", () => {
  it("is back only for an explicit choice with the option on", () => {
    expect(getAbilityCategorySide(makeSchema(true), { key: "a", side: "back" })).toBe("back");
    expect(getAbilityCategorySide(makeSchema(false), { key: "a", side: "back" })).toBe("front");
  });

  it("has no default back placement", () => {
    expect(getAbilityCategorySide(makeSchema(true), { key: "loadout", label: "Loadout" })).toBe("front");
  });
});

describe("applyBackSideDefaults", () => {
  it("marks only the default sections", () => {
    const [wargear, special] = applyBackSideDefaults(makeSchema(true)).sections.sections;
    expect(wargear.side).toBe("back");
    expect(special.side).toBeUndefined();
  });

  it("keeps an explicit choice through off and on again", () => {
    let schema = makeSchema(true);
    schema = applyBackSideDefaults(schema);
    schema.sections.sections[0] = { ...schema.sections.sections[0], side: "front" };
    schema = { ...schema, metadata: { hasBackSide: false } };
    schema = { ...applyBackSideDefaults(schema), metadata: { hasBackSide: true } };
    expect(getSectionSide(schema, schema.sections.sections[0])).toBe("front");
  });

  it("returns a schema without sections unchanged", () => {
    const schema = { metadata: {} };
    expect(applyBackSideDefaults(schema)).toBe(schema);
  });
});

describe("back side schema validation", () => {
  const withSide = (side) => {
    const schema = create40k11ePreset();
    const unit = schema.cardTypes.find((ct) => ct.baseType === "unit");
    unit.schema.metadata.hasBackSide = true;
    unit.schema.sections.sections[0].side = side;
    return schema;
  };

  it("accepts hasBackSide and a valid side", () => {
    expect(validateSchema(withSide("back")).errors).toEqual([]);
  });

  it("rejects an invalid side", () => {
    expect(validateSchema(withSide("middle")).errors.join()).toContain('invalid "side"');
  });

  it("rejects a non-boolean hasBackSide", () => {
    const schema = withSide("back");
    schema.cardTypes.find((ct) => ct.baseType === "unit").schema.metadata.hasBackSide = "yes";
    expect(validateSchema(schema).errors.join()).toContain('"hasBackSide" must be a boolean');
  });
});

describe("back side round trip", () => {
  it("keeps the option and each side through export and import", () => {
    const schema = create40k11ePreset();
    const unit = unitType();
    unit.schema.metadata.hasBackSide = true;
    unit.schema.sections.sections[0].side = "back";
    unit.schema.abilities.categories[0].side = "back";
    schema.cardTypes = schema.cardTypes.map((ct) => (ct.baseType === "unit" ? unit : ct));

    const datasource = {
      id: "custom-test",
      name: "Test",
      version: "1.0.0",
      schema,
      data: [{ id: "f1", name: "Faction", colours: { header: "#000000", banner: "#000000" } }],
    };

    const json = JSON.parse(JSON.stringify(exportDatasource(datasource)));
    const imported = prepareDatasourceForImport(json, "local");
    const importedUnit = imported.schema.cardTypes.find((ct) => ct.baseType === "unit");

    expect(importedUnit.schema.metadata.hasBackSide).toBe(true);
    expect(importedUnit.schema.sections.sections[0].side).toBe("back");
    expect(importedUnit.schema.abilities.categories[0].side).toBe("back");
    expect(validateCustomDatasource(imported).isValid).toBe(true);
  });
});
