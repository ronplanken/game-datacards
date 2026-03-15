import { describe, it, expect } from "vitest";
import {
  generateBindingsFromSchema,
  generateArraySourcesFromSchema,
  parseCustomFormat,
  buildCustomFormat,
} from "../customSchemaBindings";
import { create40kPreset, createAoSPreset } from "../customSchema.helpers";

describe("customSchemaBindings", () => {
  describe("generateBindingsFromSchema", () => {
    it("returns empty groups for null/undefined input", () => {
      expect(generateBindingsFromSchema(null)).toEqual({ name: "Custom", groups: [] });
      expect(generateBindingsFromSchema(undefined)).toEqual({ name: "Custom", groups: [] });
      expect(generateBindingsFromSchema({ schema: null })).toEqual({ name: "Custom", groups: [] });
    });

    it("uses datasource name in the schema name", () => {
      const preset = create40kPreset();
      const unitType = preset.cardTypes.find((ct) => ct.baseType === "unit");
      const result = generateBindingsFromSchema(unitType, "My Game");
      expect(result.name).toBe("My Game - Unit");
    });

    describe("unit card type (40K preset)", () => {
      const preset = create40kPreset();
      const unitType = preset.cardTypes.find((ct) => ct.baseType === "unit");
      const result = generateBindingsFromSchema(unitType, "40K");

      it("includes Basic Info group with name and cardType", () => {
        const basicInfo = result.groups.find((g) => g.name === "Basic Info");
        expect(basicInfo).toBeDefined();
        expect(basicInfo.bindings).toEqual([
          { path: "name", label: "Name", type: "string" },
          { path: "cardType", label: "Card Type", type: "string" },
        ]);
      });

      it("includes Stats group with profiles for allowMultipleProfiles=true", () => {
        const stats = result.groups.find((g) => g.name === "Stat Profiles");
        expect(stats).toBeDefined();
        // 40k has allowMultipleProfiles=true, so 2 profiles x 7 fields = 14 bindings
        expect(stats.bindings.length).toBe(14);
        expect(stats.bindings[0].path).toBe("stats[0].m");
        expect(stats.bindings[0].label).toBe("Profile 1 M");
        expect(stats.bindings[7].path).toBe("stats[1].m");
        expect(stats.bindings[7].label).toBe("Profile 2 M");
      });

      it("includes weapon groups per weapon type", () => {
        const ranged = result.groups.find((g) => g.name === "Ranged Weapons");
        expect(ranged).toBeDefined();
        // 2 weapons x (1 name + 6 columns) = 14 bindings
        expect(ranged.bindings.length).toBe(14);
        expect(ranged.bindings[0].path).toBe("weapons.ranged[0].name");
        expect(ranged.bindings[1].path).toBe("weapons.ranged[0].range");

        const melee = result.groups.find((g) => g.name === "Melee Weapons");
        expect(melee).toBeDefined();
        expect(melee.bindings[0].path).toBe("weapons.melee[0].name");
      });

      it("includes Abilities group", () => {
        const abilities = result.groups.find((g) => g.name === "Abilities");
        expect(abilities).toBeDefined();
        // 3 abilities x 3 fields (name, description, category) = 9
        expect(abilities.bindings.length).toBe(9);
        expect(abilities.bindings[0].path).toBe("abilities[0].name");
        expect(abilities.bindings[1].path).toBe("abilities[0].description");
        expect(abilities.bindings[2].path).toBe("abilities[0].category");
      });

      it("includes Keywords group with keywords and factionKeywords", () => {
        const keywords = result.groups.find((g) => g.name === "Keywords");
        expect(keywords).toBeDefined();
        // 5 keywords + 1 factionKeywords array = 6
        expect(keywords.bindings.length).toBe(6);
        expect(keywords.bindings[0].path).toBe("keywords[0]");
        expect(keywords.bindings[4].path).toBe("keywords[4]");
        expect(keywords.bindings[5]).toEqual({
          path: "factionKeywords",
          label: "Faction Keywords",
          type: "array",
        });
      });

      it("includes Points group", () => {
        const points = result.groups.find((g) => g.name === "Points");
        expect(points).toBeDefined();
        expect(points.bindings).toEqual([{ path: "points", label: "Points", type: "number" }]);
      });
    });

    describe("unit card type (AoS preset - single profile)", () => {
      const preset = createAoSPreset();
      const warscrollType = preset.cardTypes.find((ct) => ct.baseType === "unit");
      const result = generateBindingsFromSchema(warscrollType, "AoS");

      it("includes Stats group without profile prefix when allowMultipleProfiles=false", () => {
        const stats = result.groups.find((g) => g.name === "Characteristics");
        expect(stats).toBeDefined();
        // Single profile: 7 fields
        expect(stats.bindings.length).toBe(7);
        expect(stats.bindings[0].path).toBe("stats[0].move");
        expect(stats.bindings[0].label).toBe("Move"); // No "Profile 1" prefix
      });
    });

    describe("field-based card types", () => {
      const preset = create40kPreset();

      it("generates bindings for stratagem (fields only)", () => {
        const stratagemType = preset.cardTypes.find((ct) => ct.baseType === "stratagem");
        const result = generateBindingsFromSchema(stratagemType, "40K");

        expect(result.name).toBe("40K - Stratagem");
        const fields = result.groups.find((g) => g.name === "Fields");
        expect(fields).toBeDefined();
        expect(fields.bindings.length).toBe(5);
        expect(fields.bindings[0]).toEqual({ path: "name", label: "Name", type: "string" });
        expect(fields.bindings[2]).toEqual({ path: "phase", label: "Phase", type: "string" });
      });

      it("generates bindings for rule (fields + rules collection)", () => {
        const ruleType = preset.cardTypes.find((ct) => ct.baseType === "rule");
        const result = generateBindingsFromSchema(ruleType, "40K");

        expect(result.name).toBe("40K - Rule");

        const fields = result.groups.find((g) => g.name === "Fields");
        expect(fields.bindings.length).toBe(3);

        const rules = result.groups.find((g) => g.name === "Rules");
        expect(rules).toBeDefined();
        // 3 entries x 3 fields (title, description, format) = 9
        expect(rules.bindings.length).toBe(9);
        expect(rules.bindings[0].path).toBe("rules[0].title");
        expect(rules.bindings[0].label).toBe("Rules 1 Title");
      });

      it("generates bindings for enhancement (fields + keywords collection)", () => {
        const enhancementType = preset.cardTypes.find((ct) => ct.baseType === "enhancement");
        const result = generateBindingsFromSchema(enhancementType, "40K");

        const keywords = result.groups.find((g) => g.name === "Keywords");
        expect(keywords).toBeDefined();
        // 3 entries x 1 field (keyword) = 3
        expect(keywords.bindings.length).toBe(3);
        expect(keywords.bindings[0].path).toBe("keywords[0].keyword");
      });
    });
  });

  describe("generateArraySourcesFromSchema", () => {
    it("returns empty array for null/undefined input", () => {
      expect(generateArraySourcesFromSchema(null)).toEqual([]);
      expect(generateArraySourcesFromSchema(undefined)).toEqual([]);
    });

    describe("unit card type (40K preset)", () => {
      const preset = create40kPreset();
      const unitType = preset.cardTypes.find((ct) => ct.baseType === "unit");
      const result = generateArraySourcesFromSchema(unitType);

      it("includes stats array source", () => {
        const stats = result.find((s) => s.path === "stats");
        expect(stats).toBeDefined();
        expect(stats.label).toBe("Stat Profiles");
        expect(stats.itemFields).toEqual(["m", "t", "sv", "w", "ld", "oc", "inv"]);
      });

      it("includes weapon type array sources", () => {
        const ranged = result.find((s) => s.path === "weapons.ranged");
        expect(ranged).toBeDefined();
        expect(ranged.label).toBe("Ranged Weapons");
        expect(ranged.itemFields).toEqual(["name", "range", "a", "bs", "s", "ap", "d"]);

        const melee = result.find((s) => s.path === "weapons.melee");
        expect(melee).toBeDefined();
        expect(melee.label).toBe("Melee Weapons");
        expect(melee.itemFields).toEqual(["name", "range", "a", "ws", "s", "ap", "d"]);
      });

      it("includes abilities array source", () => {
        const abilities = result.find((s) => s.path === "abilities");
        expect(abilities).toBeDefined();
        expect(abilities.itemFields).toEqual(["name", "description", "category"]);
      });

      it("includes keywords and factionKeywords array sources", () => {
        const keywords = result.find((s) => s.path === "keywords");
        expect(keywords).toBeDefined();
        expect(keywords.itemFields).toEqual([]);

        const factionKw = result.find((s) => s.path === "factionKeywords");
        expect(factionKw).toBeDefined();
      });
    });

    describe("field-based card types", () => {
      const preset = create40kPreset();

      it("returns empty array for stratagem (no collections)", () => {
        const stratagemType = preset.cardTypes.find((ct) => ct.baseType === "stratagem");
        const result = generateArraySourcesFromSchema(stratagemType);
        expect(result).toEqual([]);
      });

      it("returns rules collection for rule card type", () => {
        const ruleType = preset.cardTypes.find((ct) => ct.baseType === "rule");
        const result = generateArraySourcesFromSchema(ruleType);
        expect(result.length).toBe(1);
        expect(result[0].path).toBe("rules");
        expect(result[0].label).toBe("Rules");
        expect(result[0].itemFields).toEqual(["title", "description", "format"]);
      });

      it("returns keywords collection for enhancement card type", () => {
        const enhancementType = preset.cardTypes.find((ct) => ct.baseType === "enhancement");
        const result = generateArraySourcesFromSchema(enhancementType);
        expect(result.length).toBe(1);
        expect(result[0].path).toBe("keywords");
        expect(result[0].label).toBe("Keywords");
        expect(result[0].itemFields).toEqual(["keyword"]);
      });
    });
  });

  describe("parseCustomFormat", () => {
    it("returns null for non-custom formats", () => {
      expect(parseCustomFormat(null)).toBeNull();
      expect(parseCustomFormat("")).toBeNull();
      expect(parseCustomFormat("40k-10e")).toBeNull();
      expect(parseCustomFormat("aos")).toBeNull();
    });

    it("returns null for malformed custom formats", () => {
      expect(parseCustomFormat("custom-")).toBeNull();
      expect(parseCustomFormat("custom-abc")).toBeNull();
    });

    it("parses valid custom format strings", () => {
      expect(parseCustomFormat("custom-abc-123:unit")).toEqual({
        datasourceId: "custom-abc-123",
        cardTypeKey: "unit",
      });
      expect(parseCustomFormat("custom-my-ds-id:warscroll")).toEqual({
        datasourceId: "custom-my-ds-id",
        cardTypeKey: "warscroll",
      });
    });

    it("handles UUID-based datasource IDs", () => {
      const result = parseCustomFormat("custom-550e8400-e29b-41d4-a716-446655440000:enhancement");
      expect(result).toEqual({
        datasourceId: "custom-550e8400-e29b-41d4-a716-446655440000",
        cardTypeKey: "enhancement",
      });
    });
  });

  describe("buildCustomFormat", () => {
    it("builds format string from datasource ID and card type key", () => {
      expect(buildCustomFormat("custom-abc-123", "unit")).toBe("custom-abc-123:unit");
    });

    it("roundtrips with parseCustomFormat", () => {
      const format = buildCustomFormat("custom-abc-123", "warscroll");
      const parsed = parseCustomFormat(format);
      expect(parsed).toEqual({
        datasourceId: "custom-abc-123",
        cardTypeKey: "warscroll",
      });
    });
  });
});
