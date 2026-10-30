import { describe, it, expect } from "vitest";
import {
  RESERVED_UNIT_FIELD_KEYS,
  UNIT_LINK_PRESETS,
  create40k11ePreset,
  create40kPreset,
  getPresetStepDefaults,
  validateSchema,
} from "../customSchema.helpers";

const withUnitLinks = (unitLinks) => {
  const preset = create40kPreset();
  preset.cardTypes = preset.cardTypes.map((ct) =>
    ct.baseType === "unit" ? { ...ct, schema: { ...ct.schema, unitLinks } } : ct,
  );
  return preset;
};

describe("unit links in presets", () => {
  it("adds a Leader group to the 40k 10e unit card type", () => {
    const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
    expect(unit.schema.unitLinks.groups.map((g) => g.key)).toEqual(["leads"]);
  });

  it("adds Leader and Support groups to the 40k 11e unit card type", () => {
    const unit = create40k11ePreset().cardTypes.find((ct) => ct.baseType === "unit");
    expect(unit.schema.unitLinks.groups.map((g) => g.key)).toEqual(["leads", "supports"]);
    expect(unit.schema.unitLinks.groups[1].label).toBe("Support");
  });

  it("keeps the 11e preset valid", () => {
    expect(validateSchema(create40k11ePreset())).toEqual({ valid: true, errors: [] });
  });

  it("does not share group objects with the frozen presets", () => {
    const unit = create40k11ePreset().cardTypes.find((ct) => ct.baseType === "unit");
    unit.schema.unitLinks.groups[0].label = "Changed";
    expect(UNIT_LINK_PRESETS[0].label).toBe("Leader");
  });

  it("passes unit links through the wizard preset defaults", () => {
    const defaults = getPresetStepDefaults("40k-11e", "unit");
    expect(defaults["unit-metadata"].unitLinks.groups).toHaveLength(2);
    expect(getPresetStepDefaults("aos", "unit")["unit-metadata"].unitLinks).toBeUndefined();
  });

  it("reserves the unitLinks key for custom unit fields", () => {
    expect(RESERVED_UNIT_FIELD_KEYS).toContain("unitLinks");
  });
});

describe("unit links validation", () => {
  it("accepts an empty group list", () => {
    expect(validateSchema(withUnitLinks({ groups: [] })).valid).toBe(true);
  });

  it("rejects a non-object definition", () => {
    const result = validateSchema(withUnitLinks([]));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("unitLinks: must be an object"))).toBe(true);
  });

  it("rejects missing groups", () => {
    const result = validateSchema(withUnitLinks({}));
    expect(result.errors.some((e) => e.includes("unitLinks.groups: must be an array"))).toBe(true);
  });

  it("rejects duplicate keys and missing labels", () => {
    const result = validateSchema(
      withUnitLinks({
        groups: [
          { key: "leads", label: "Leader" },
          { key: "leads", label: "" },
        ],
      }),
    );
    expect(result.errors.some((e) => e.includes('duplicate group key "leads"'))).toBe(true);
    expect(result.errors.some((e) => e.includes('missing or invalid "label"'))).toBe(true);
  });

  it("rejects a non-string description", () => {
    const result = validateSchema(withUnitLinks({ groups: [{ key: "leads", label: "Leader", description: 5 }] }));
    expect(result.errors.some((e) => e.includes('"description" must be a string'))).toBe(true);
  });
});
