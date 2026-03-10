import { describe, it, expect } from "vitest";
import {
  VALID_BASE_TYPES,
  VALID_FIELD_TYPES,
  VALID_BASE_SYSTEMS,
  VALID_ABILITY_FORMATS,
  VALID_POINTS_FORMATS,
  SCHEMA_VERSION,
  createFieldDefinition,
  createCollectionDefinition,
  create40kPreset,
  createAoSPreset,
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

  it("defines valid points formats", () => {
    expect(VALID_POINTS_FORMATS).toEqual(["per-model", "per-unit"]);
  });

  it("defines schema version", () => {
    expect(SCHEMA_VERSION).toBe("1.0.0");
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

  it("creates a field with required flag", () => {
    const field = createFieldDefinition({ key: "name", label: "Name", required: true });
    expect(field).toEqual({ key: "name", label: "Name", type: "string", required: true });
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

  it("includes required: false when explicitly set", () => {
    const field = createFieldDefinition({ key: "k", label: "K", required: false });
    expect(field.required).toBe(false);
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
    const fields = [createFieldDefinition({ key: "title", label: "Title", required: true })];
    const collection = createCollectionDefinition({ label: "Rules", fields });
    expect(collection.fields).toHaveLength(1);
    expect(collection.fields[0]).toEqual({ key: "title", label: "Title", type: "string", required: true });
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
    it("has stats with 6 fields matching 40K stat line", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(unit.schema.stats.fields).toHaveLength(6);
      const keys = unit.schema.stats.fields.map((f) => f.key);
      expect(keys).toEqual(["m", "t", "sv", "w", "ld", "oc"]);
    });

    it("has stats with sequential displayOrder", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const orders = unit.schema.stats.fields.map((f) => f.displayOrder);
      expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
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

    it("all weapon columns are required", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      for (const wt of unit.schema.weaponTypes.types) {
        for (const col of wt.columns) {
          expect(col.required).toBe(true);
        }
      }
    });

    it("has three ability categories", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(unit.schema.abilities.categories).toHaveLength(3);
      expect(unit.schema.abilities.categories.map((c) => c.key)).toEqual(["core", "faction", "unit"]);
    });

    it("core abilities use name-only format, others use name-description", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      const core = unit.schema.abilities.categories.find((c) => c.key === "core");
      const faction = unit.schema.abilities.categories.find((c) => c.key === "faction");
      const unitAb = unit.schema.abilities.categories.find((c) => c.key === "unit");
      expect(core.format).toBe("name-only");
      expect(faction.format).toBe("name-description");
      expect(unitAb.format).toBe("name-description");
    });

    it("has invulnerable save and damaged ability enabled", () => {
      const unit = create40kPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(unit.schema.abilities.hasInvulnerableSave).toBe(true);
      expect(unit.schema.abilities.hasDamagedAbility).toBe(true);
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
      expect(phase.required).toBe(true);
      expect(phase.options).toEqual(["command", "movement", "shooting", "charge", "fight", "any"]);
    });
  });

  it("returns a new object on each call (no shared references)", () => {
    const a = create40kPreset();
    const b = create40kPreset();
    expect(a).not.toBe(b);
    expect(a.cardTypes).not.toBe(b.cardTypes);
    a.cardTypes[0].schema.stats.fields.push(createFieldDefinition({ key: "x", label: "X" }));
    expect(b.cardTypes[0].schema.stats.fields).toHaveLength(6);
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

    it("all weapon columns are required", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      for (const wt of warscroll.schema.weaponTypes.types) {
        for (const col of wt.columns) {
          expect(col.required).toBe(true);
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

    it("has no invulnerable save or damaged ability", () => {
      const warscroll = createAoSPreset().cardTypes.find((ct) => ct.baseType === "unit");
      expect(warscroll.schema.abilities.hasInvulnerableSave).toBe(false);
      expect(warscroll.schema.abilities.hasDamagedAbility).toBe(false);
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
      expect(typeField.required).toBe(true);
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
