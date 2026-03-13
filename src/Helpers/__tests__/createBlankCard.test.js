import { describe, it, expect } from "vitest";
import { createBlankCardFromSchema } from "../customDatasource.helpers";
import { create40kPreset, createAoSPreset } from "../customSchema.helpers";

describe("createBlankCardFromSchema", () => {
  const factionId = "test-faction";
  const datasourceId = "custom-test-123";

  describe("unit base type", () => {
    it("creates a blank unit card from 40k preset", () => {
      const preset = create40kPreset();
      const unitType = preset.cardTypes.find((ct) => ct.baseType === "unit");
      const card = createBlankCardFromSchema(unitType, factionId, datasourceId);

      expect(card.id).toBeDefined();
      expect(card.name).toBe("New Unit");
      expect(card.cardType).toBe("unit");
      expect(card.faction_id).toBe(factionId);
      expect(card.source).toBe(datasourceId);

      // Stats: one profile with all fields defaulted
      expect(card.stats).toHaveLength(1);
      expect(card.stats[0]).toEqual({ m: "", t: "", sv: "", w: "", ld: "", oc: "", inv: "" });

      // Weapons: empty arrays per weapon type
      expect(card.weapons.ranged).toEqual([]);
      expect(card.weapons.melee).toEqual([]);

      // Abilities
      expect(card.abilities).toEqual([]);

      // Metadata
      expect(card.keywords).toEqual([]);
      expect(card.factionKeywords).toEqual([]);
      expect(card.points).toBeNull();
    });

    it("creates a blank warscroll card from AoS preset", () => {
      const preset = createAoSPreset();
      const warscrollType = preset.cardTypes.find((ct) => ct.baseType === "unit");
      const card = createBlankCardFromSchema(warscrollType, factionId, datasourceId);

      expect(card.name).toBe("New Warscroll");
      expect(card.cardType).toBe("warscroll");

      // Stats
      expect(card.stats).toHaveLength(1);
      expect(card.stats[0]).toHaveProperty("move", "");
      expect(card.stats[0]).toHaveProperty("save", "");
      expect(card.stats[0]).toHaveProperty("health", "");

      // Weapons
      expect(card.weapons.ranged).toEqual([]);
      expect(card.weapons.melee).toEqual([]);
    });
  });

  describe("rule base type", () => {
    it("creates a blank rule card from 40k preset", () => {
      const preset = create40kPreset();
      const ruleType = preset.cardTypes.find((ct) => ct.baseType === "rule");
      const card = createBlankCardFromSchema(ruleType, factionId, datasourceId);

      expect(card.name).toBe("");
      expect(card.cardType).toBe("rule");
      expect(card.ruleType).toBe("");
      expect(card.description).toBe("");
      expect(card.rules).toEqual([]);
    });

    it("creates a blank spell card from AoS preset", () => {
      const preset = createAoSPreset();
      const spellType = preset.cardTypes.find((ct) => ct.baseType === "rule");
      const card = createBlankCardFromSchema(spellType, factionId, datasourceId);

      expect(card.cardType).toBe("spell");
      expect(card.name).toBe("");
      expect(card.castingValue).toBe("");
      expect(card.type).toBe("spell"); // first enum option
      expect(card.rules).toEqual([]);
    });
  });

  describe("enhancement base type", () => {
    it("creates a blank enhancement card from 40k preset", () => {
      const preset = create40kPreset();
      const enhType = preset.cardTypes.find((ct) => ct.baseType === "enhancement");
      const card = createBlankCardFromSchema(enhType, factionId, datasourceId);

      expect(card.cardType).toBe("enhancement");
      expect(card.name).toBe("");
      expect(card.cost).toBe("");
      expect(card.description).toBe("");
      expect(card.keywords).toEqual([]);
    });

    it("creates a blank enhancement card from AoS preset", () => {
      const preset = createAoSPreset();
      const enhType = preset.cardTypes.find((ct) => ct.baseType === "enhancement");
      const card = createBlankCardFromSchema(enhType, factionId, datasourceId);

      expect(card.cardType).toBe("enhancement");
      expect(card.type).toBe("heroic-trait"); // first enum option
      expect(card.keywords).toEqual([]);
    });
  });

  describe("stratagem base type", () => {
    it("creates a blank stratagem card from 40k preset", () => {
      const preset = create40kPreset();
      const stratType = preset.cardTypes.find((ct) => ct.baseType === "stratagem");
      const card = createBlankCardFromSchema(stratType, factionId, datasourceId);

      expect(card.cardType).toBe("stratagem");
      expect(card.name).toBe("");
      expect(card.cost).toBe("");
      expect(card.phase).toBe("command"); // first enum option
      expect(card.type).toBe("");
      expect(card.description).toBe("");
      // Stratagems have no collections
      expect(card.rules).toBeUndefined();
      expect(card.keywords).toBeUndefined();
    });

    it("creates a blank battle tactic from AoS preset", () => {
      const preset = createAoSPreset();
      const tacticType = preset.cardTypes.find((ct) => ct.baseType === "stratagem");
      const card = createBlankCardFromSchema(tacticType, factionId, datasourceId);

      expect(card.cardType).toBe("battle-tactic");
      expect(card.type).toBe("battle-tactic"); // first enum option
    });
  });

  describe("templateId", () => {
    it("copies templateId from card type def when present", () => {
      const preset = create40kPreset();
      const unitType = { ...preset.cardTypes[0], templateId: "tmpl-abc" };
      const card = createBlankCardFromSchema(unitType, factionId, datasourceId);

      expect(card.templateId).toBe("tmpl-abc");
    });

    it("does not set templateId when not present", () => {
      const preset = create40kPreset();
      const card = createBlankCardFromSchema(preset.cardTypes[0], factionId, datasourceId);

      expect(card.templateId).toBeUndefined();
    });
  });

  describe("unique IDs", () => {
    it("generates unique IDs for each card", () => {
      const preset = create40kPreset();
      const unitType = preset.cardTypes[0];
      const card1 = createBlankCardFromSchema(unitType, factionId, datasourceId);
      const card2 = createBlankCardFromSchema(unitType, factionId, datasourceId);

      expect(card1.id).not.toBe(card2.id);
    });
  });
});
