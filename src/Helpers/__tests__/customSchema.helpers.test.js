import { describe, it, expect } from "vitest";
import {
  VALID_BASE_TYPES,
  VALID_FIELD_TYPES,
  VALID_BASE_SYSTEMS,
  VALID_ABILITY_FORMATS,
  VALID_POINTS_FORMATS,
  VALID_SECTION_FORMATS,
  SCHEMA_VERSION,
  DEFAULT_DATASOURCE_COLOURS,
  createFieldDefinition,
  createCollectionDefinition,
  createBlankPreset,
  create40kPreset,
  createAoSPreset,
  validateSchema,
  getDefaultValueForType,
  migrateCardToSchema,
} from "../customSchema.helpers";

describe("customSchema.helpers - constants", () => {
  it("defines valid base types", () => {
    expect(VALID_BASE_TYPES).toEqual(["unit", "rule", "enhancement", "stratagem"]);
  });

  it("defines valid field types", () => {
    expect(VALID_FIELD_TYPES).toEqual(["string", "richtext", "enum", "boolean"]);
  });

  it("defines valid base systems", () => {
    expect(VALID_BASE_SYSTEMS).toEqual(["40k-10e", "aos", "blank"]);
  });

  it("defines valid ability formats", () => {
    expect(VALID_ABILITY_FORMATS).toEqual(["name-only", "name-description"]);
  });

  it("defines valid section formats", () => {
    expect(VALID_SECTION_FORMATS).toEqual(["list", "richtext"]);
  });

  it("defines valid points formats", () => {
    expect(VALID_POINTS_FORMATS).toEqual(["per-model", "per-unit"]);
  });

  it("defines schema version", () => {
    expect(SCHEMA_VERSION).toBe("1.0.0");
  });

  it("defines default datasource colours", () => {
    expect(DEFAULT_DATASOURCE_COLOURS).toEqual({ header: "#1a1a2e", banner: "#16213e" });
  });

  it("DEFAULT_DATASOURCE_COLOURS is frozen", () => {
    expect(Object.isFrozen(DEFAULT_DATASOURCE_COLOURS)).toBe(true);
  });
});

describe("customSchema.helpers - createFieldDefinition", () => {
  it("creates a basic string field", () => {
    const field = createFieldDefinition({ key: "name", label: "Name" });
    expect(field).toEqual({ key: "name", label: "Name", type: "string" });
  });

  it("creates a field with explicit type", () => {
    const field = createFieldDefinition({ key: "desc", label: "Description", type: "richtext" });
    expect(field).toEqual({ key: "desc", label: "Description", type: "richtext" });
  });

  it("creates a field with displayOrder", () => {
    const field = createFieldDefinition({ key: "m", label: "M", displayOrder: 1 });
    expect(field).toEqual({ key: "m", label: "M", type: "string", displayOrder: 1 });
  });

  it("ignores required flag (removed feature)", () => {
    const field = createFieldDefinition({ key: "name", label: "Name", required: true });
    expect(field).toEqual({ key: "name", label: "Name", type: "string" });
  });

  it("creates an enum field with options", () => {
    const options = ["command", "movement", "shooting"];
    const field = createFieldDefinition({ key: "phase", label: "Phase", type: "enum", options });
    expect(field).toEqual({ key: "phase", label: "Phase", type: "enum", options: ["command", "movement", "shooting"] });
  });

  it("does not include options for non-enum types", () => {
    const field = createFieldDefinition({ key: "name", label: "Name", type: "string", options: ["a", "b"] });
    expect(field).toEqual({ key: "name", label: "Name", type: "string" });
    expect(field.options).toBeUndefined();
  });

  it("does not mutate the provided options array", () => {
    const options = ["a", "b", "c"];
    const field = createFieldDefinition({ key: "f", label: "F", type: "enum", options });
    field.options.push("d");
    expect(options).toEqual(["a", "b", "c"]);
  });

  it("omits displayOrder when not provided", () => {
    const field = createFieldDefinition({ key: "k", label: "K" });
    expect(field).not.toHaveProperty("displayOrder");
  });

  it("omits required when not provided", () => {
    const field = createFieldDefinition({ key: "k", label: "K" });
    expect(field).not.toHaveProperty("required");
  });

  it("does not include required even when explicitly set", () => {
    const field = createFieldDefinition({ key: "k", label: "K", required: false });
    expect(field).not.toHaveProperty("required");
  });

  it("creates a boolean field with onValue and offValue", () => {
    const field = createFieldDefinition({
      key: "active",
      label: "Active",
      type: "boolean",
      onValue: "Yes",
      offValue: "No",
    });
    expect(field).toEqual({ key: "active", label: "Active", type: "boolean", onValue: "Yes", offValue: "No" });
  });

  it("does not include onValue/offValue for non-boolean types", () => {
    const field = createFieldDefinition({ key: "name", label: "Name", type: "string", onValue: "Yes", offValue: "No" });
    expect(field.onValue).toBeUndefined();
    expect(field.offValue).toBeUndefined();
  });
});

describe("customSchema.helpers - createCollectionDefinition", () => {
  it("creates a collection with defaults", () => {
    const collection = createCollectionDefinition({ label: "Rules" });
    expect(collection).toEqual({ label: "Rules", allowMultiple: true, fields: [] });
  });

  it("creates a collection with custom allowMultiple", () => {
    const collection = createCollectionDefinition({ label: "Keywords", allowMultiple: false });
    expect(collection).toEqual({ label: "Keywords", allowMultiple: false, fields: [] });
  });

  it("creates a collection with fields", () => {
    const fields = [createFieldDefinition({ key: "title", label: "Title" })];
    const collection = createCollectionDefinition({ label: "Rules", fields });
    expect(collection.fields).toHaveLength(1);
    expect(collection.fields[0]).toEqual({ key: "title", label: "Title", type: "string" });
  });

  it("does not mutate the provided fields array", () => {
    const fields = [createFieldDefinition({ key: "a", label: "A" })];
    const collection = createCollectionDefinition({ label: "Test", fields });
    collection.fields.push(createFieldDefinition({ key: "b", label: "B" }));
    expect(fields).toHaveLength(1);
  });
});

describe("customSchema.helpers - create40kPreset", () => {
  it("returns a schema with correct version and base system", () => {
    const schema = create40kPreset();
    expect(schema.version).toBe(SCHEMA_VERSION);
    expect(schema.baseSystem).toBe("40k-10e");
  });

  it("includes all four card types", () => {
    const schema = create40kPreset();
    expect(schema.cardTypes).toHaveLength(4);
    const baseTypes = schema.cardTypes.map((ct) => ct.baseType);
    expect(baseTypes).toEqual(["unit", "rule", "enhancement", "stratagem"]);
  });

  it("each card type has key, label, baseType, and schema", () => {
    const schema = create40kPreset();
    for (const ct of schema.cardTypes) {
      expect(ct).toHaveProperty("key");
      expect(ct).toHaveProperty("label");
      expect(ct).toHaveProperty("baseType");
      expect(ct).toHaveProperty("schema");
      expect(typeof ct.key).toBe("string");
      expect(typeof ct.label).toBe("string");
      expect(VALID_BASE_TYPES).toContain(ct.baseType);
    }
  });

  describe("unit card type", () => {
    it("has stats with 7 fields matching 40K stat line", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(unit.schema.stats.fields).toHaveLength(7);
      const keys = unit.schema.stats.fields.map((f) => f.key);
      expect(keys).toEqual(["m", "t", "sv", "w", "ld", "oc", "inv"]);
    });

    it("has stats with sequential displayOrder", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const orders = unit.schema.stats.fields.map((f) => f.displayOrder);
      expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("allows multiple stat profiles", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(unit.schema.stats.allowMultipleProfiles).toBe(true);
    });

    it("has ranged and melee weapon types", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const weaponKeys = unit.schema.weaponTypes.types.map((t) => t.key);
      expect(weaponKeys).toEqual(["ranged", "melee"]);
    });

    it("ranged weapons have 6 columns with BS", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const ranged = unit.schema.weaponTypes.types.find((t) => t.key === "ranged");
      expect(ranged.columns).toHaveLength(6);
      expect(ranged.columns.map((c) => c.key)).toEqual(["range", "a", "bs", "s", "ap", "d"]);
      expect(ranged.hasKeywords).toBe(true);
      expect(ranged.hasProfiles).toBe(true);
    });

    it("melee weapons have 6 columns with WS", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const melee = unit.schema.weaponTypes.types.find((t) => t.key === "melee");
      expect(melee.columns).toHaveLength(6);
      expect(melee.columns.map((c) => c.key)).toEqual(["range", "a", "ws", "s", "ap", "d"]);
      expect(melee.hasKeywords).toBe(true);
      expect(melee.hasProfiles).toBe(true);
    });

    it("weapon columns do not have required property", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      for (const wt of unit.schema.weaponTypes.types) {
        for (const col of wt.columns) {
          expect(col).not.toHaveProperty("required");
        }
      }
    });

    it("has four ability categories", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(unit.schema.abilities.categories).toHaveLength(4);
      expect(unit.schema.abilities.categories.map((c) => c.key)).toEqual(["core", "faction", "unit", "damaged"]);
    });

    it("ability categories use correct formats", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const core = unit.schema.abilities.categories.find((c) => c.key === "core");
      const faction = unit.schema.abilities.categories.find((c) => c.key === "faction");
      const unitAb = unit.schema.abilities.categories.find((c) => c.key === "unit");
      const damaged = unit.schema.abilities.categories.find((c) => c.key === "damaged");
      expect(core.format).toBe("name-only");
      expect(faction.format).toBe("name-description");
      expect(unitAb.format).toBe("name-description");
      expect(damaged.format).toBe("name-description");
      expect(damaged.header).toBe("Damaged");
    });

    it("has metadata with keywords, faction keywords, and per-model points", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(unit.schema.metadata).toEqual({
        hasKeywords: true,
        hasFactionKeywords: true,
        hasPoints: true,
        pointsFormat: "per-model",
      });
    });

    it("has sections with wargear-options, unit-composition, and loadout", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(unit.schema.sections).toBeDefined();
      expect(unit.schema.sections.label).toBe("Sections");
      expect(unit.schema.sections.sections).toHaveLength(3);
      const sectionKeys = unit.schema.sections.sections.map((s) => s.key);
      expect(sectionKeys).toEqual(["wargear-options", "unit-composition", "loadout"]);
    });

    it("sections use correct formats", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const wargear = unit.schema.sections.sections.find((s) => s.key === "wargear-options");
      const composition = unit.schema.sections.sections.find((s) => s.key === "unit-composition");
      const loadout = unit.schema.sections.sections.find((s) => s.key === "loadout");
      expect(wargear.format).toBe("list");
      expect(composition.format).toBe("list");
      expect(loadout.format).toBe("richtext");
    });
  });

  describe("rule card type", () => {
    it("has fields and rules collection", () => {
      const rule = create40kPreset().cardTypes.find((ct) => ct.baseType === "rule");
      expect(rule.schema.fields).toHaveLength(3);
      expect(rule.schema.rules).toBeDefined();
      expect(rule.schema.rules.allowMultiple).toBe(true);
    });

    it("rules collection has format enum with correct options", () => {
      const rule = create40kPreset().cardTypes.find((ct) => ct.baseType === "rule");
      const formatField = rule.schema.rules.fields.find((f) => f.key === "format");
      expect(formatField.type).toBe("enum");
      expect(formatField.options).toEqual(["name-description", "name-only", "table"]);
    });
  });

  describe("enhancement card type", () => {
    it("has fields and keywords collection", () => {
      const enhancement = create40kPreset().cardTypes.find((ct) => ct.baseType === "enhancement");
      expect(enhancement.schema.fields).toHaveLength(3);
      expect(enhancement.schema.keywords).toBeDefined();
      expect(enhancement.schema.keywords.allowMultiple).toBe(true);
    });

    it("has name, cost, and description fields", () => {
      const enhancement = create40kPreset().cardTypes.find((ct) => ct.baseType === "enhancement");
      const keys = enhancement.schema.fields.map((f) => f.key);
      expect(keys).toEqual(["name", "cost", "description"]);
    });
  });

  describe("stratagem card type", () => {
    it("has fields only (no collections)", () => {
      const stratagem = create40kPreset().cardTypes.find((ct) => ct.baseType === "stratagem");
      expect(stratagem.schema.fields).toHaveLength(5);
      expect(stratagem.schema).not.toHaveProperty("rules");
      expect(stratagem.schema).not.toHaveProperty("keywords");
    });

    it("has phase enum with correct options", () => {
      const stratagem = create40kPreset().cardTypes.find((ct) => ct.baseType === "stratagem");
      const phase = stratagem.schema.fields.find((f) => f.key === "phase");
      expect(phase.type).toBe("enum");
      expect(phase.options).toEqual(["command", "movement", "shooting", "charge", "fight", "any"]);
    });
  });

  it("returns a new object on each call (no shared references)", () => {
    const a = create40kPreset();
    const b = create40kPreset();
    expect(a).not.toBe(b);
    expect(a.cardTypes).not.toBe(b.cardTypes);
    a.cardTypes[0].schema.stats.fields.push(createFieldDefinition({ key: "x", label: "X" }));
    expect(b.cardTypes[0].schema.stats.fields).toHaveLength(7);
  });
});

describe("customSchema.helpers - createBlankPreset", () => {
  it("returns a schema with correct version and base system", () => {
    const schema = createBlankPreset();
    expect(schema.version).toBe(SCHEMA_VERSION);
    expect(schema.baseSystem).toBe("blank");
  });

  it("has an empty cardTypes array", () => {
    const schema = createBlankPreset();
    expect(schema.cardTypes).toEqual([]);
    expect(schema.cardTypes).toHaveLength(0);
  });

  it("returns a new object on each call (no shared references)", () => {
    const a = createBlankPreset();
    const b = createBlankPreset();
    expect(a).not.toBe(b);
    expect(a.cardTypes).not.toBe(b.cardTypes);
    a.cardTypes.push({ key: "test", label: "Test", baseType: "unit", schema: {} });
    expect(b.cardTypes).toHaveLength(0);
  });
});

describe("customSchema.helpers - createAoSPreset", () => {
  it("returns a schema with correct version and base system", () => {
    const schema = createAoSPreset();
    expect(schema.version).toBe(SCHEMA_VERSION);
    expect(schema.baseSystem).toBe("aos");
  });

  it("includes all four card types", () => {
    const schema = createAoSPreset();
    expect(schema.cardTypes).toHaveLength(4);
    const baseTypes = schema.cardTypes.map((ct) => ct.baseType);
    expect(baseTypes).toEqual(["unit", "rule", "enhancement", "stratagem"]);
  });

  it("each card type has key, label, baseType, and schema", () => {
    const schema = createAoSPreset();
    for (const ct of schema.cardTypes) {
      expect(ct).toHaveProperty("key");
      expect(ct).toHaveProperty("label");
      expect(ct).toHaveProperty("baseType");
      expect(ct).toHaveProperty("schema");
      expect(typeof ct.key).toBe("string");
      expect(typeof ct.label).toBe("string");
      expect(VALID_BASE_TYPES).toContain(ct.baseType);
    }
  });

  describe("warscroll card type", () => {
    it("has stats with 7 fields matching AoS characteristics", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(warscroll.key).toBe("warscroll");
      expect(warscroll.label).toBe("Warscroll");
      expect(warscroll.schema.stats.fields).toHaveLength(7);
      const keys = warscroll.schema.stats.fields.map((f) => f.key);
      expect(keys).toEqual(["move", "save", "control", "health", "ward", "wizard", "priest"]);
    });

    it("has stats with sequential displayOrder", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const orders = warscroll.schema.stats.fields.map((f) => f.displayOrder);
      expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("does not allow multiple stat profiles", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(warscroll.schema.stats.allowMultipleProfiles).toBe(false);
    });

    it("stats section is labelled Characteristics", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(warscroll.schema.stats.label).toBe("Characteristics");
    });

    it("has ranged and melee weapon types", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const weaponKeys = warscroll.schema.weaponTypes.types.map((t) => t.key);
      expect(weaponKeys).toEqual(["ranged", "melee"]);
    });

    it("ranged weapons have 6 columns with AoS stat names", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const ranged = warscroll.schema.weaponTypes.types.find((t) => t.key === "ranged");
      expect(ranged.columns).toHaveLength(6);
      expect(ranged.columns.map((c) => c.key)).toEqual(["range", "attacks", "hit", "wound", "rend", "damage"]);
      expect(ranged.hasKeywords).toBe(true);
      expect(ranged.hasProfiles).toBe(false);
    });

    it("melee weapons have 5 columns (no range)", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const melee = warscroll.schema.weaponTypes.types.find((t) => t.key === "melee");
      expect(melee.columns).toHaveLength(5);
      expect(melee.columns.map((c) => c.key)).toEqual(["attacks", "hit", "wound", "rend", "damage"]);
      expect(melee.hasKeywords).toBe(true);
      expect(melee.hasProfiles).toBe(false);
    });

    it("weapon columns do not have required property", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      for (const wt of warscroll.schema.weaponTypes.types) {
        for (const col of wt.columns) {
          expect(col).not.toHaveProperty("required");
        }
      }
    });

    it("has a single abilities category", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(warscroll.schema.abilities.categories).toHaveLength(1);
      expect(warscroll.schema.abilities.categories[0]).toEqual({
        key: "abilities",
        label: "Abilities",
        format: "name-description",
      });
    });

    it("has metadata with keywords, faction keywords, and per-unit points", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(warscroll.schema.metadata).toEqual({
        hasKeywords: true,
        hasFactionKeywords: true,
        hasPoints: true,
        pointsFormat: "per-unit",
      });
    });

    it("has sections with wargear-options and unit-composition", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(warscroll.schema.sections).toBeDefined();
      expect(warscroll.schema.sections.label).toBe("Sections");
      expect(warscroll.schema.sections.sections).toHaveLength(2);
      const sectionKeys = warscroll.schema.sections.sections.map((s) => s.key);
      expect(sectionKeys).toEqual(["wargear-options", "unit-composition"]);
    });
  });

  describe("spell card type", () => {
    it("has fields and rules collection", () => {
      const spell = createAoSPreset().cardTypes.find((ct) => ct.baseType === "rule");
      expect(spell.key).toBe("spell");
      expect(spell.schema.fields).toHaveLength(3);
      expect(spell.schema.rules).toBeDefined();
      expect(spell.schema.rules.allowMultiple).toBe(false);
    });

    it("has type enum with spell, prayer, manifestation options", () => {
      const spell = createAoSPreset().cardTypes.find((ct) => ct.baseType === "rule");
      const typeField = spell.schema.fields.find((f) => f.key === "type");
      expect(typeField.type).toBe("enum");
      expect(typeField.options).toEqual(["spell", "prayer", "manifestation"]);
    });

    it("rules collection has declare and effect fields", () => {
      const spell = createAoSPreset().cardTypes.find((ct) => ct.baseType === "rule");
      const fieldKeys = spell.schema.rules.fields.map((f) => f.key);
      expect(fieldKeys).toEqual(["declare", "effect"]);
    });
  });

  describe("enhancement card type", () => {
    it("has fields and keywords collection", () => {
      const enhancement = createAoSPreset().cardTypes.find((ct) => ct.baseType === "enhancement");
      expect(enhancement.schema.fields).toHaveLength(4);
      expect(enhancement.schema.keywords).toBeDefined();
      expect(enhancement.schema.keywords.allowMultiple).toBe(true);
    });

    it("has type enum with AoS enhancement types", () => {
      const enhancement = createAoSPreset().cardTypes.find((ct) => ct.baseType === "enhancement");
      const typeField = enhancement.schema.fields.find((f) => f.key === "type");
      expect(typeField.type).toBe("enum");
      expect(typeField.options).toEqual(["heroic-trait", "artefact", "prayer", "spell-lore"]);
    });
  });

  describe("battle tactic card type", () => {
    it("has fields only (no collections)", () => {
      const tactic = createAoSPreset().cardTypes.find((ct) => ct.baseType === "stratagem");
      expect(tactic.key).toBe("battle-tactic");
      expect(tactic.schema.fields).toHaveLength(3);
      expect(tactic.schema).not.toHaveProperty("rules");
      expect(tactic.schema).not.toHaveProperty("keywords");
    });

    it("has type enum with battle-tactic and grand-strategy", () => {
      const tactic = createAoSPreset().cardTypes.find((ct) => ct.baseType === "stratagem");
      const typeField = tactic.schema.fields.find((f) => f.key === "type");
      expect(typeField.type).toBe("enum");
      expect(typeField.options).toEqual(["battle-tactic", "grand-strategy"]);
    });
  });

  it("returns a new object on each call (no shared references)", () => {
    const a = createAoSPreset();
    const b = createAoSPreset();
    expect(a).not.toBe(b);
    expect(a.cardTypes).not.toBe(b.cardTypes);
    a.cardTypes[0].schema.stats.fields.push(createFieldDefinition({ key: "x", label: "X" }));
    expect(b.cardTypes[0].schema.stats.fields).toHaveLength(7);
  });
});

describe("customSchema.helpers - validateSchema", () => {
  // Helper to create a minimal valid schema for testing
  const minimalValidSchema = () => ({
    version: "1.0.0",
    baseSystem: "blank",
    cardTypes: [],
  });

  const validUnitCardType = () => ({
    key: "unit",
    label: "Unit",
    baseType: "unit",
    schema: {
      stats: {
        label: "Stats",
        allowMultipleProfiles: false,
        fields: [createFieldDefinition({ key: "m", label: "M", displayOrder: 1 })],
      },
      weaponTypes: {
        label: "Weapons",
        allowMultiple: true,
        types: [
          {
            key: "ranged",
            label: "Ranged",
            hasKeywords: true,
            hasProfiles: false,
            columns: [createFieldDefinition({ key: "range", label: "Range", required: true })],
          },
        ],
      },
      abilities: {
        label: "Abilities",
        categories: [{ key: "core", label: "Core", format: "name-only" }],
      },
      metadata: {
        hasKeywords: true,
        hasFactionKeywords: true,
        hasPoints: false,
        pointsFormat: "per-unit",
      },
    },
  });

  const validRuleCardType = () => ({
    key: "rule",
    label: "Rule",
    baseType: "rule",
    schema: {
      fields: [createFieldDefinition({ key: "name", label: "Name", required: true })],
      rules: createCollectionDefinition({
        label: "Rules",
        allowMultiple: true,
        fields: [createFieldDefinition({ key: "title", label: "Title", required: true })],
      }),
    },
  });

  const validEnhancementCardType = () => ({
    key: "enh",
    label: "Enhancement",
    baseType: "enhancement",
    schema: {
      fields: [createFieldDefinition({ key: "name", label: "Name", required: true })],
      keywords: createCollectionDefinition({
        label: "Keywords",
        allowMultiple: true,
        fields: [createFieldDefinition({ key: "keyword", label: "Keyword", required: true })],
      }),
    },
  });

  const validStratagemCardType = () => ({
    key: "strat",
    label: "Stratagem",
    baseType: "stratagem",
    schema: {
      fields: [createFieldDefinition({ key: "name", label: "Name", required: true })],
    },
  });

  describe("root-level validation", () => {
    it("validates a minimal valid schema", () => {
      const result = validateSchema(minimalValidSchema());
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("rejects null", () => {
      const result = validateSchema(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Schema must be an object");
    });

    it("rejects undefined", () => {
      const result = validateSchema(undefined);
      expect(result.valid).toBe(false);
    });

    it("rejects non-object", () => {
      const result = validateSchema("not an object");
      expect(result.valid).toBe(false);
    });

    it("rejects missing version", () => {
      const schema = minimalValidSchema();
      delete schema.version;
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("version"))).toBe(true);
    });

    it("rejects invalid baseSystem", () => {
      const schema = minimalValidSchema();
      schema.baseSystem = "invalid";
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("baseSystem"))).toBe(true);
    });

    it("rejects non-array cardTypes", () => {
      const schema = minimalValidSchema();
      schema.cardTypes = "not-array";
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("cardTypes"))).toBe(true);
    });
  });

  describe("card type validation", () => {
    it("rejects card type with missing key", () => {
      const schema = minimalValidSchema();
      schema.cardTypes = [{ label: "Test", baseType: "unit", schema: {} }];
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("key"))).toBe(true);
    });

    it("rejects card type with missing label", () => {
      const schema = minimalValidSchema();
      schema.cardTypes = [{ key: "test", baseType: "unit", schema: {} }];
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("label"))).toBe(true);
    });

    it("rejects card type with invalid baseType", () => {
      const schema = minimalValidSchema();
      schema.cardTypes = [{ key: "test", label: "Test", baseType: "invalid", schema: {} }];
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("baseType"))).toBe(true);
    });

    it("rejects card type with missing schema", () => {
      const schema = minimalValidSchema();
      schema.cardTypes = [{ key: "test", label: "Test", baseType: "unit" }];
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("schema"))).toBe(true);
    });

    it("rejects duplicate card type keys", () => {
      const schema = minimalValidSchema();
      schema.cardTypes = [validStratagemCardType(), { ...validStratagemCardType(), label: "Stratagem 2" }];
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("duplicate card type key"))).toBe(true);
    });
  });

  describe("unit schema validation", () => {
    it("validates a complete unit card type", () => {
      const schema = minimalValidSchema();
      schema.cardTypes = [validUnitCardType()];
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("rejects missing stats", () => {
      const ct = validUnitCardType();
      delete ct.schema.stats;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("stats"))).toBe(true);
    });

    it("rejects stats without allowMultipleProfiles", () => {
      const ct = validUnitCardType();
      delete ct.schema.stats.allowMultipleProfiles;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("allowMultipleProfiles"))).toBe(true);
    });

    it("rejects missing weaponTypes", () => {
      const ct = validUnitCardType();
      delete ct.schema.weaponTypes;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("weaponTypes"))).toBe(true);
    });

    it("rejects weapon type without key", () => {
      const ct = validUnitCardType();
      delete ct.schema.weaponTypes.types[0].key;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("weaponTypes.types[0]") && e.includes("key"))).toBe(true);
    });

    it("rejects duplicate weapon type keys", () => {
      const ct = validUnitCardType();
      ct.schema.weaponTypes.types.push({
        key: "ranged",
        label: "Ranged 2",
        hasKeywords: false,
        hasProfiles: false,
        columns: [],
      });
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("duplicate weapon type key"))).toBe(true);
    });

    it("rejects weapon type without hasKeywords boolean", () => {
      const ct = validUnitCardType();
      ct.schema.weaponTypes.types[0].hasKeywords = "yes";
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("hasKeywords"))).toBe(true);
    });

    it("rejects missing abilities", () => {
      const ct = validUnitCardType();
      delete ct.schema.abilities;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("abilities"))).toBe(true);
    });

    it("rejects invalid ability format", () => {
      const ct = validUnitCardType();
      ct.schema.abilities.categories[0].format = "invalid-format";
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("format"))).toBe(true);
    });

    it("rejects duplicate ability category keys", () => {
      const ct = validUnitCardType();
      ct.schema.abilities.categories.push({ key: "core", label: "Core 2", format: "name-only" });
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("duplicate category key"))).toBe(true);
    });

    it("rejects missing metadata", () => {
      const ct = validUnitCardType();
      delete ct.schema.metadata;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("metadata"))).toBe(true);
    });

    it("rejects invalid pointsFormat", () => {
      const ct = validUnitCardType();
      ct.schema.metadata.pointsFormat = "invalid";
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("pointsFormat"))).toBe(true);
    });

    it("validates a unit with sections", () => {
      const ct = validUnitCardType();
      ct.schema.sections = {
        label: "Sections",
        sections: [{ key: "wargear", label: "Wargear", format: "list" }],
      };
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("rejects sections with invalid format", () => {
      const ct = validUnitCardType();
      ct.schema.sections = {
        label: "Sections",
        sections: [{ key: "wargear", label: "Wargear", format: "invalid-format" }],
      };
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("format"))).toBe(true);
    });

    it("rejects sections with missing label", () => {
      const ct = validUnitCardType();
      ct.schema.sections = {
        label: "Sections",
        sections: [{ key: "wargear", format: "list" }],
      };
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("label"))).toBe(true);
    });

    it("rejects sections with missing key", () => {
      const ct = validUnitCardType();
      ct.schema.sections = {
        label: "Sections",
        sections: [{ label: "Wargear", format: "list" }],
      };
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("key"))).toBe(true);
    });

    it("rejects duplicate section keys", () => {
      const ct = validUnitCardType();
      ct.schema.sections = {
        label: "Sections",
        sections: [
          { key: "wargear", label: "Wargear", format: "list" },
          { key: "wargear", label: "Wargear 2", format: "richtext" },
        ],
      };
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("duplicate section key"))).toBe(true);
    });

    it("rejects sections with missing sections array", () => {
      const ct = validUnitCardType();
      ct.schema.sections = { label: "Sections" };
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("sections.sections"))).toBe(true);
    });
  });

  describe("rule schema validation", () => {
    it("validates a complete rule card type", () => {
      const schema = { ...minimalValidSchema(), cardTypes: [validRuleCardType()] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("rejects missing fields array", () => {
      const ct = validRuleCardType();
      delete ct.schema.fields;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("fields"))).toBe(true);
    });

    it("rejects missing rules collection", () => {
      const ct = validRuleCardType();
      delete ct.schema.rules;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("rules"))).toBe(true);
    });
  });

  describe("enhancement schema validation", () => {
    it("validates a complete enhancement card type", () => {
      const schema = { ...minimalValidSchema(), cardTypes: [validEnhancementCardType()] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("rejects missing keywords collection", () => {
      const ct = validEnhancementCardType();
      delete ct.schema.keywords;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("keywords"))).toBe(true);
    });
  });

  describe("stratagem schema validation", () => {
    it("validates a complete stratagem card type", () => {
      const schema = { ...minimalValidSchema(), cardTypes: [validStratagemCardType()] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("rejects missing fields", () => {
      const ct = validStratagemCardType();
      delete ct.schema.fields;
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
    });
  });

  describe("field definition validation", () => {
    it("rejects field with invalid type", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [{ key: "name", label: "Name", type: "invalid" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("type") && e.includes("invalid"))).toBe(true);
    });

    it("rejects enum field without options", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [{ key: "phase", label: "Phase", type: "enum" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("enum") && e.includes("options"))).toBe(true);
    });

    it("rejects enum field with empty options", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [{ key: "phase", label: "Phase", type: "enum", options: [] }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("enum") && e.includes("options"))).toBe(true);
    });

    it("rejects duplicate field keys", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [
        createFieldDefinition({ key: "name", label: "Name" }),
        createFieldDefinition({ key: "name", label: "Name 2" }),
      ];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('duplicate key "name"'))).toBe(true);
    });

    it("rejects field with non-number displayOrder", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [{ key: "name", label: "Name", type: "string", displayOrder: "first" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("displayOrder"))).toBe(true);
    });

    it("accepts field with required property (ignored but not rejected)", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [{ key: "name", label: "Name", type: "string", required: "yes" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("rejects field with non-string onValue", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [{ key: "active", label: "Active", type: "boolean", onValue: 123 }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("onValue"))).toBe(true);
    });

    it("rejects field with non-string offValue", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [{ key: "active", label: "Active", type: "boolean", offValue: true }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("offValue"))).toBe(true);
    });

    it("validates field with valid onValue and offValue", () => {
      const ct = validStratagemCardType();
      ct.schema.fields = [{ key: "active", label: "Active", type: "boolean", onValue: "Yes", offValue: "No" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("rejects stat field with invalid size value", () => {
      const ct = validUnitCardType();
      ct.schema.stats.fields = [{ key: "m", label: "M", type: "string", size: "medium" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("size"))).toBe(true);
    });

    it("accepts stat field with size small", () => {
      const ct = validUnitCardType();
      ct.schema.stats.fields = [{ key: "m", label: "M", type: "string", size: "small" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("accepts stat field with size large", () => {
      const ct = validUnitCardType();
      ct.schema.stats.fields = [{ key: "m", label: "M", type: "string", size: "large" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("accepts stat field without size (undefined)", () => {
      const ct = validUnitCardType();
      ct.schema.stats.fields = [{ key: "m", label: "M", type: "string" }];
      const schema = { ...minimalValidSchema(), cardTypes: [ct] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });
  });

  describe("preset validation", () => {
    it("40K preset passes validation", () => {
      const result = validateSchema(create40kPreset());
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("AoS preset passes validation", () => {
      const result = validateSchema(createAoSPreset());
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("blank preset passes validation", () => {
      const result = validateSchema(createBlankPreset());
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("mixed card types", () => {
    it("validates a schema with all four card types", () => {
      const schema = {
        ...minimalValidSchema(),
        cardTypes: [validUnitCardType(), validRuleCardType(), validEnhancementCardType(), validStratagemCardType()],
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("collects errors from multiple card types", () => {
      const badUnit = validUnitCardType();
      delete badUnit.schema.stats;
      const badRule = validRuleCardType();
      delete badRule.schema.rules;
      const schema = { ...minimalValidSchema(), cardTypes: [badUnit, badRule] };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe("customSchema.helpers - getDefaultValueForType", () => {
  it("returns empty string for string type", () => {
    expect(getDefaultValueForType({ key: "k", label: "K", type: "string" })).toBe("");
  });

  it("returns empty string for richtext type", () => {
    expect(getDefaultValueForType({ key: "k", label: "K", type: "richtext" })).toBe("");
  });

  it("returns false for boolean type", () => {
    expect(getDefaultValueForType({ key: "k", label: "K", type: "boolean" })).toBe(false);
  });

  it("returns first option for enum type", () => {
    expect(getDefaultValueForType({ key: "k", label: "K", type: "enum", options: ["a", "b", "c"] })).toBe("a");
  });

  it("returns empty string for enum type with no options", () => {
    expect(getDefaultValueForType({ key: "k", label: "K", type: "enum" })).toBe("");
  });

  it("returns empty string for unknown type", () => {
    expect(getDefaultValueForType({ key: "k", label: "K", type: "unknown" })).toBe("");
  });
});

describe("customSchema.helpers - migrateCardToSchema", () => {
  describe("edge cases", () => {
    it("returns empty object for null card", () => {
      expect(migrateCardToSchema(null, {}, {})).toEqual({});
    });

    it("returns empty object for undefined card", () => {
      expect(migrateCardToSchema(undefined, {}, {})).toEqual({});
    });

    it("returns empty object for non-object card", () => {
      expect(migrateCardToSchema("not-object", {}, {})).toEqual({});
    });

    it("returns shallow copy when newSchema is null", () => {
      const card = { name: "Test" };
      const result = migrateCardToSchema(card, {}, null);
      expect(result).toEqual({ name: "Test" });
      expect(result).not.toBe(card);
    });

    it("returns shallow copy when oldSchema is null", () => {
      const card = { name: "Test" };
      const result = migrateCardToSchema(card, null, {});
      expect(result).toEqual({ name: "Test" });
      expect(result).not.toBe(card);
    });
  });

  describe("field-based cards (rule, enhancement, stratagem)", () => {
    it("preserves values for unchanged fields", () => {
      const oldSchema = {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", required: true }),
          createFieldDefinition({ key: "cost", label: "Cost" }),
        ],
      };
      const newSchema = { ...oldSchema };
      const card = { name: "My Enhancement", cost: "10pts" };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result).toEqual({ name: "My Enhancement", cost: "10pts" });
    });

    it("adds default values for new fields", () => {
      const oldSchema = {
        fields: [createFieldDefinition({ key: "name", label: "Name" })],
      };
      const newSchema = {
        fields: [
          createFieldDefinition({ key: "name", label: "Name" }),
          createFieldDefinition({ key: "cost", label: "Cost" }),
          createFieldDefinition({ key: "active", label: "Active", type: "boolean" }),
        ],
      };
      const card = { name: "My Card" };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result).toEqual({ name: "My Card", cost: "", active: false });
    });

    it("drops values for removed fields", () => {
      const oldSchema = {
        fields: [
          createFieldDefinition({ key: "name", label: "Name" }),
          createFieldDefinition({ key: "legacy", label: "Legacy" }),
        ],
      };
      const newSchema = {
        fields: [createFieldDefinition({ key: "name", label: "Name" })],
      };
      const card = { name: "My Card", legacy: "old data" };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result).toEqual({ name: "My Card" });
      expect(result).not.toHaveProperty("legacy");
    });

    it("coerces string to enum when value is a valid option", () => {
      const oldSchema = {
        fields: [createFieldDefinition({ key: "phase", label: "Phase", type: "string" })],
      };
      const newSchema = {
        fields: [
          createFieldDefinition({ key: "phase", label: "Phase", type: "enum", options: ["command", "movement"] }),
        ],
      };
      const card = { phase: "command" };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result.phase).toBe("command");
    });

    it("uses default when coercing to enum and value is not a valid option", () => {
      const oldSchema = {
        fields: [createFieldDefinition({ key: "phase", label: "Phase", type: "string" })],
      };
      const newSchema = {
        fields: [
          createFieldDefinition({ key: "phase", label: "Phase", type: "enum", options: ["command", "movement"] }),
        ],
      };
      const card = { phase: "invalid-phase" };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result.phase).toBe("command");
    });

    it("coerces boolean to string", () => {
      const oldSchema = {
        fields: [createFieldDefinition({ key: "active", label: "Active", type: "boolean" })],
      };
      const newSchema = {
        fields: [createFieldDefinition({ key: "active", label: "Active", type: "string" })],
      };
      const card = { active: true };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result.active).toBe("true");
    });

    it("coerces string to boolean", () => {
      const oldSchema = {
        fields: [createFieldDefinition({ key: "flag", label: "Flag", type: "string" })],
      };
      const newSchema = {
        fields: [createFieldDefinition({ key: "flag", label: "Flag", type: "boolean" })],
      };
      const card = { flag: "yes" };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result.flag).toBe(true);
    });

    it("adds default for enum with new field", () => {
      const oldSchema = { fields: [] };
      const newSchema = {
        fields: [
          createFieldDefinition({ key: "phase", label: "Phase", type: "enum", options: ["command", "movement"] }),
        ],
      };

      const result = migrateCardToSchema({}, oldSchema, newSchema);
      expect(result.phase).toBe("command");
    });

    it("migrates collection entries when fields change", () => {
      const oldSchema = {
        fields: [createFieldDefinition({ key: "name", label: "Name" })],
        rules: createCollectionDefinition({
          label: "Rules",
          fields: [
            createFieldDefinition({ key: "title", label: "Title" }),
            createFieldDefinition({ key: "oldField", label: "Old" }),
          ],
        }),
      };
      const newSchema = {
        fields: [createFieldDefinition({ key: "name", label: "Name" })],
        rules: createCollectionDefinition({
          label: "Rules",
          fields: [
            createFieldDefinition({ key: "title", label: "Title" }),
            createFieldDefinition({ key: "newField", label: "New" }),
          ],
        }),
      };
      const card = {
        name: "My Rule",
        rules: [
          { title: "Rule 1", oldField: "old data" },
          { title: "Rule 2", oldField: "more old data" },
        ],
      };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result.name).toBe("My Rule");
      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toEqual({ title: "Rule 1", newField: "" });
      expect(result.rules[1]).toEqual({ title: "Rule 2", newField: "" });
    });

    it("handles collection added to schema", () => {
      const oldSchema = {
        fields: [createFieldDefinition({ key: "name", label: "Name" })],
      };
      const newSchema = {
        fields: [createFieldDefinition({ key: "name", label: "Name" })],
        keywords: createCollectionDefinition({
          label: "Keywords",
          fields: [createFieldDefinition({ key: "keyword", label: "Keyword" })],
        }),
      };
      const card = { name: "My Card" };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result.name).toBe("My Card");
      expect(result.keywords).toEqual([]);
    });

    it("drops collection when removed from schema", () => {
      const oldSchema = {
        fields: [createFieldDefinition({ key: "name", label: "Name" })],
        rules: createCollectionDefinition({
          label: "Rules",
          fields: [createFieldDefinition({ key: "title", label: "Title" })],
        }),
      };
      const newSchema = {
        fields: [createFieldDefinition({ key: "name", label: "Name" })],
      };
      const card = { name: "My Card", rules: [{ title: "Rule 1" }] };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result.name).toBe("My Card");
      expect(result).not.toHaveProperty("rules");
    });

    it("handles empty collection entries array", () => {
      const oldSchema = {
        fields: [],
        rules: createCollectionDefinition({
          label: "Rules",
          fields: [createFieldDefinition({ key: "title", label: "Title" })],
        }),
      };
      const newSchema = {
        fields: [],
        rules: createCollectionDefinition({
          label: "Rules",
          fields: [
            createFieldDefinition({ key: "title", label: "Title" }),
            createFieldDefinition({ key: "desc", label: "Desc" }),
          ],
        }),
      };
      const card = { rules: [] };

      const result = migrateCardToSchema(card, oldSchema, newSchema);
      expect(result.rules).toEqual([]);
    });
  });

  describe("unit cards", () => {
    const oldUnitSchema = {
      stats: {
        label: "Stats",
        allowMultipleProfiles: true,
        fields: [
          createFieldDefinition({ key: "m", label: "M", displayOrder: 1 }),
          createFieldDefinition({ key: "t", label: "T", displayOrder: 2 }),
          createFieldDefinition({ key: "sv", label: "SV", displayOrder: 3 }),
        ],
      },
      weaponTypes: {
        label: "Weapons",
        allowMultiple: true,
        types: [
          {
            key: "ranged",
            label: "Ranged",
            hasKeywords: true,
            hasProfiles: false,
            columns: [
              createFieldDefinition({ key: "range", label: "Range", required: true }),
              createFieldDefinition({ key: "s", label: "S", required: true }),
            ],
          },
        ],
      },
      abilities: {
        label: "Abilities",
        categories: [
          { key: "core", label: "Core", format: "name-only" },
          { key: "faction", label: "Faction", format: "name-description" },
        ],
      },
      metadata: {
        hasKeywords: true,
        hasFactionKeywords: true,
        hasPoints: true,
        pointsFormat: "per-model",
      },
    };

    it("migrates stat profiles when fields are added", () => {
      const newSchema = {
        ...oldUnitSchema,
        stats: {
          ...oldUnitSchema.stats,
          fields: [...oldUnitSchema.stats.fields, createFieldDefinition({ key: "w", label: "W", displayOrder: 4 })],
        },
      };
      const card = {
        stats: [{ m: '6"', t: "4", sv: "3+" }],
        weapons: { ranged: [] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: 100,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result.stats).toHaveLength(1);
      expect(result.stats[0]).toEqual({ m: '6"', t: "4", sv: "3+", w: "" });
    });

    it("migrates stat profiles when fields are removed", () => {
      const newSchema = {
        ...oldUnitSchema,
        stats: {
          ...oldUnitSchema.stats,
          fields: [createFieldDefinition({ key: "m", label: "M", displayOrder: 1 })],
        },
      };
      const card = {
        stats: [{ m: '6"', t: "4", sv: "3+" }],
        weapons: { ranged: [] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result.stats[0]).toEqual({ m: '6"' });
      expect(result.stats[0]).not.toHaveProperty("t");
      expect(result.stats[0]).not.toHaveProperty("sv");
    });

    it("handles multiple stat profiles", () => {
      const newSchema = {
        ...oldUnitSchema,
        stats: {
          ...oldUnitSchema.stats,
          fields: [
            createFieldDefinition({ key: "m", label: "M", displayOrder: 1 }),
            createFieldDefinition({ key: "t", label: "T", displayOrder: 2 }),
            createFieldDefinition({ key: "hp", label: "HP", displayOrder: 3 }),
          ],
        },
      };
      const card = {
        stats: [
          { m: '6"', t: "4", sv: "3+" },
          { m: '8"', t: "5", sv: "2+" },
        ],
        weapons: { ranged: [] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result.stats).toHaveLength(2);
      expect(result.stats[0]).toEqual({ m: '6"', t: "4", hp: "" });
      expect(result.stats[1]).toEqual({ m: '8"', t: "5", hp: "" });
    });

    it("initializes empty stats when card has no stat data", () => {
      const card = {
        weapons: { ranged: [] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, oldUnitSchema);
      expect(result.stats).toEqual([]);
    });

    it("migrates weapon columns within existing weapon type", () => {
      const newSchema = {
        ...oldUnitSchema,
        weaponTypes: {
          ...oldUnitSchema.weaponTypes,
          types: [
            {
              key: "ranged",
              label: "Ranged",
              hasKeywords: true,
              hasProfiles: false,
              columns: [
                createFieldDefinition({ key: "range", label: "Range", required: true }),
                createFieldDefinition({ key: "s", label: "S", required: true }),
                createFieldDefinition({ key: "ap", label: "AP", required: true }),
              ],
            },
          ],
        },
      };
      const card = {
        stats: [],
        weapons: {
          ranged: [{ name: "Bolt Rifle", range: '24"', s: "4" }],
        },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result.weapons.ranged).toHaveLength(1);
      expect(result.weapons.ranged[0]).toEqual({ name: "Bolt Rifle", range: '24"', s: "4", ap: "" });
    });

    it("preserves weapon name during column migration", () => {
      const card = {
        stats: [],
        weapons: {
          ranged: [{ name: "Lascannon", range: '48"', s: "12" }],
        },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, oldUnitSchema);
      expect(result.weapons.ranged[0].name).toBe("Lascannon");
    });

    it("creates empty array for new weapon type", () => {
      const newSchema = {
        ...oldUnitSchema,
        weaponTypes: {
          ...oldUnitSchema.weaponTypes,
          types: [
            ...oldUnitSchema.weaponTypes.types,
            {
              key: "melee",
              label: "Melee",
              hasKeywords: true,
              hasProfiles: false,
              columns: [createFieldDefinition({ key: "a", label: "A", required: true })],
            },
          ],
        },
      };
      const card = {
        stats: [],
        weapons: { ranged: [{ name: "Bolt Rifle", range: '24"', s: "4" }] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result.weapons.melee).toEqual([]);
      expect(result.weapons.ranged).toHaveLength(1);
    });

    it("drops weapon data for removed weapon type", () => {
      const newSchema = {
        ...oldUnitSchema,
        weaponTypes: {
          ...oldUnitSchema.weaponTypes,
          types: [],
        },
      };
      const card = {
        stats: [],
        weapons: { ranged: [{ name: "Bolt Rifle", range: '24"', s: "4" }] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result.weapons).toEqual({});
    });

    it("filters abilities by removed category", () => {
      const newSchema = {
        ...oldUnitSchema,
        abilities: {
          ...oldUnitSchema.abilities,
          categories: [{ key: "core", label: "Core", format: "name-only" }],
        },
      };
      const card = {
        stats: [],
        weapons: { ranged: [] },
        abilities: [
          { category: "core", name: "Scouts" },
          { category: "faction", name: "Oath of Moment", description: "Re-roll..." },
        ],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result.abilities).toHaveLength(1);
      expect(result.abilities[0].name).toBe("Scouts");
    });

    it("preserves keywords when metadata still has them", () => {
      const card = {
        stats: [],
        weapons: { ranged: [] },
        abilities: [],
        keywords: ["Infantry", "Imperium"],
        factionKeywords: ["Space Marines"],
        points: 90,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, oldUnitSchema);
      expect(result.keywords).toEqual(["Infantry", "Imperium"]);
      expect(result.factionKeywords).toEqual(["Space Marines"]);
      expect(result.points).toBe(90);
    });

    it("drops keywords when metadata removes them", () => {
      const newSchema = {
        ...oldUnitSchema,
        metadata: {
          hasKeywords: false,
          hasFactionKeywords: false,
          hasPoints: false,
          pointsFormat: "per-unit",
        },
      };
      const card = {
        stats: [],
        weapons: { ranged: [] },
        abilities: [],
        keywords: ["Infantry"],
        factionKeywords: ["Marines"],
        points: 100,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result).not.toHaveProperty("keywords");
      expect(result).not.toHaveProperty("factionKeywords");
      expect(result).not.toHaveProperty("points");
    });

    it("does not mutate the original card", () => {
      const card = {
        stats: [{ m: '6"', t: "4", sv: "3+" }],
        weapons: { ranged: [{ name: "Bolt Rifle", range: '24"', s: "4" }] },
        abilities: [{ category: "core", name: "Scouts" }],
        keywords: ["Infantry"],
        factionKeywords: ["Marines"],
        points: 90,
      };
      const originalCard = JSON.parse(JSON.stringify(card));

      migrateCardToSchema(card, oldUnitSchema, oldUnitSchema);
      expect(card).toEqual(originalCard);
    });

    it("initializes empty sections when sections are added to schema", () => {
      const newSchema = {
        ...oldUnitSchema,
        sections: {
          label: "Sections",
          sections: [
            { key: "wargear-options", label: "Wargear Options", format: "list" },
            { key: "loadout", label: "Loadout", format: "richtext" },
          ],
        },
      };
      const card = {
        stats: [],
        weapons: { ranged: [] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
      };

      const result = migrateCardToSchema(card, oldUnitSchema, newSchema);
      expect(result.sections).toEqual({
        "wargear-options": [],
        loadout: [],
      });
    });

    it("preserves existing section data during migration", () => {
      const schemaWithSections = {
        ...oldUnitSchema,
        sections: {
          label: "Sections",
          sections: [
            { key: "wargear-options", label: "Wargear Options", format: "list" },
            { key: "loadout", label: "Loadout", format: "richtext" },
          ],
        },
      };
      const card = {
        stats: [],
        weapons: { ranged: [] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
        sections: {
          "wargear-options": ["Option A", "Option B"],
          loadout: ["Default loadout"],
        },
      };

      const result = migrateCardToSchema(card, schemaWithSections, schemaWithSections);
      expect(result.sections["wargear-options"]).toEqual(["Option A", "Option B"]);
      expect(result.sections.loadout).toEqual(["Default loadout"]);
    });

    it("drops sections that are removed and adds new ones", () => {
      const oldSchemaWithSections = {
        ...oldUnitSchema,
        sections: {
          label: "Sections",
          sections: [
            { key: "wargear-options", label: "Wargear Options", format: "list" },
            { key: "old-section", label: "Old Section", format: "list" },
          ],
        },
      };
      const newSchemaWithSections = {
        ...oldUnitSchema,
        sections: {
          label: "Sections",
          sections: [
            { key: "wargear-options", label: "Wargear Options", format: "list" },
            { key: "new-section", label: "New Section", format: "richtext" },
          ],
        },
      };
      const card = {
        stats: [],
        weapons: { ranged: [] },
        abilities: [],
        keywords: [],
        factionKeywords: [],
        points: null,
        sections: {
          "wargear-options": ["Option A"],
          "old-section": ["Old data"],
        },
      };

      const result = migrateCardToSchema(card, oldSchemaWithSections, newSchemaWithSections);
      expect(result.sections["wargear-options"]).toEqual(["Option A"]);
      expect(result.sections["new-section"]).toEqual([]);
      expect(result.sections["old-section"]).toBeUndefined();
    });
  });
});
