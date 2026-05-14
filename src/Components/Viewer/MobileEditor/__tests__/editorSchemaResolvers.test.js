import { describe, it, expect } from "vitest";
import { resolveEditorSections } from "../editorSchemaResolvers";

describe("editorSchemaResolvers", () => {
  describe("40k-10e unit card", () => {
    const unitCard = {
      name: "Intercessors",
      source: "40k-10e",
      stats: [{ m: 6, t: 4, sv: "3+", w: 2, ld: "6+", oc: 2, active: true }],
      rangedWeapons: [{ profiles: [{ name: "Bolt Rifle", range: "24", attacks: "2" }] }],
      meleeWeapons: [{ profiles: [{ name: "Close Combat", range: "Melee", attacks: "3" }] }],
      abilities: {
        core: ["Scouts 6"],
        faction: ["Oath of Moment"],
        other: [{ name: "Tactical Flexibility", description: "Test" }],
        wargear: [],
        special: [],
        invul: { value: "4+", info: "", showInvulnerableSave: true },
      },
      keywords: ["Infantry", "Imperium"],
      factions: ["Adeptus Astartes"],
      points: 150,
    };

    it("should resolve all expected sections for a unit card", () => {
      const sections = resolveEditorSections(unitCard, "40k-10e", null);
      const sectionTypes = sections.map((s) => s.type);

      expect(sectionTypes).toContain("name");
      expect(sectionTypes).toContain("stats");
      expect(sectionTypes).toContain("invul");
      expect(sectionTypes).toContain("weapons");
      expect(sectionTypes).toContain("abilities");
      expect(sectionTypes).toContain("keywords");
      expect(sectionTypes).toContain("points");
    });

    it("should have correct stat field config", () => {
      const sections = resolveEditorSections(unitCard, "40k-10e", null);
      const statsSection = sections.find((s) => s.type === "stats");

      expect(statsSection.config.fields).toHaveLength(6);
      expect(statsSection.config.fields.map((f) => f.key)).toEqual(["m", "t", "sv", "w", "ld", "oc"]);
      expect(statsSection.config.allowMultipleProfiles).toBe(true);
    });

    it("should have both weapon types", () => {
      const sections = resolveEditorSections(unitCard, "40k-10e", null);
      const weaponsSection = sections.find((s) => s.type === "weapons");

      expect(weaponsSection.config.types).toHaveLength(2);
      expect(weaponsSection.config.types[0].key).toBe("rangedWeapons");
      expect(weaponsSection.config.types[1].key).toBe("meleeWeapons");
      expect(weaponsSection.config.format).toBe("40k");
    });

    it("should have correct ability categories", () => {
      const sections = resolveEditorSections(unitCard, "40k-10e", null);
      const abilitiesSection = sections.find((s) => s.type === "abilities");

      expect(abilitiesSection.config.format).toBe("40k");
      expect(abilitiesSection.config.categories).toHaveLength(5);
      expect(abilitiesSection.config.categories[0].key).toBe("core");
      expect(abilitiesSection.config.categories[0].format).toBe("name-only");
    });
  });

  describe("40k-10e stratagem card", () => {
    const stratagemCard = {
      name: "Test Stratagem",
      source: "40k-10e",
      when: "Start of movement phase",
      target: "One unit",
      effect: "Does something",
      cost: "1 CP",
    };

    it("should resolve name and fields sections", () => {
      const sections = resolveEditorSections(stratagemCard, "40k-10e", null);
      const types = sections.map((s) => s.type);

      expect(types).toContain("name");
      expect(types).toContain("fields");
      expect(types).not.toContain("stats");
      expect(types).not.toContain("weapons");
    });

    it("should have correct stratagem fields", () => {
      const sections = resolveEditorSections(stratagemCard, "40k-10e", null);
      const fieldsSection = sections.find((s) => s.type === "fields");

      const fieldKeys = fieldsSection.config.fields.map((f) => f.key);
      expect(fieldKeys).toContain("when");
      expect(fieldKeys).toContain("target");
      expect(fieldKeys).toContain("effect");
      expect(fieldKeys).toContain("cost");
      expect(fieldKeys).toContain("turn");
    });
  });

  describe("40k-10e enhancement card", () => {
    const enhancementCard = {
      name: "Test Enhancement",
      source: "40k-10e",
      description: "Does things",
      cost: "25pts",
    };

    it("should resolve name and fields sections", () => {
      const sections = resolveEditorSections(enhancementCard, "40k-10e", null);
      const types = sections.map((s) => s.type);

      expect(types).toContain("name");
      expect(types).toContain("fields");
    });

    it("should have cost and description fields", () => {
      const sections = resolveEditorSections(enhancementCard, "40k-10e", null);
      const fieldsSection = sections.find((s) => s.type === "fields");

      const fieldKeys = fieldsSection.config.fields.map((f) => f.key);
      expect(fieldKeys).toContain("cost");
      expect(fieldKeys).toContain("description");
    });
  });

  describe("40k-10e rule card", () => {
    const ruleCard = {
      name: "Test Rule",
      source: "40k-10e",
      ruleType: "army",
      rules: [{ type: "text", text: "Rule content", order: 0 }],
    };

    it("should resolve name, fields, and rulesList sections", () => {
      const sections = resolveEditorSections(ruleCard, "40k-10e", null);
      const types = sections.map((s) => s.type);

      expect(types).toContain("name");
      expect(types).toContain("fields");
      expect(types).toContain("rulesList");
    });
  });

  describe("AoS warscroll", () => {
    const warscroll = {
      name: "Liberators",
      source: "aos",
      stats: { move: 5, save: "3+", control: 1, health: 2 },
      weapons: {
        ranged: [],
        melee: [{ name: "Warhammer", range: "1", attacks: "2" }],
      },
      abilities: [{ name: "Thunderstrike", phase: "Passive", effect: "Test" }],
      keywords: ["Order", "Stormcast"],
      factionKeywords: ["Stormcast Eternals"],
    };

    it("should resolve all AoS sections", () => {
      const sections = resolveEditorSections(warscroll, "aos", null);
      const types = sections.map((s) => s.type);

      expect(types).toContain("name");
      expect(types).toContain("stats");
      expect(types).toContain("weapons");
      expect(types).toContain("abilities");
      expect(types).toContain("keywords");
    });

    it("should use flat object stats config", () => {
      const sections = resolveEditorSections(warscroll, "aos", null);
      const statsSection = sections.find((s) => s.type === "stats");

      expect(statsSection.config.flatObject).toBe(true);
      expect(statsSection.config.fields.map((f) => f.key)).toEqual([
        "move",
        "save",
        "control",
        "health",
        "ward",
        "wizard",
        "priest",
      ]);
    });

    it("should use AoS weapon format", () => {
      const sections = resolveEditorSections(warscroll, "aos", null);
      const weaponsSection = sections.find((s) => s.type === "weapons");

      expect(weaponsSection.config.format).toBe("aos");
    });

    it("should use AoS abilities format", () => {
      const sections = resolveEditorSections(warscroll, "aos", null);
      const abilitiesSection = sections.find((s) => s.type === "abilities");

      expect(abilitiesSection.config.format).toBe("aos");
    });
  });

  describe("custom datasource", () => {
    const customSchema = {
      version: "1.0.0",
      baseSystem: "blank",
      cardTypes: [
        {
          key: "unit",
          label: "Unit",
          baseType: "unit",
          schema: {
            stats: {
              label: "Attributes",
              allowMultipleProfiles: false,
              fields: [
                { key: "str", label: "STR" },
                { key: "dex", label: "DEX" },
              ],
            },
            weaponTypes: {
              label: "Equipment",
              types: [{ key: "weapons", label: "Weapons", columns: [{ key: "dmg", label: "Damage" }] }],
            },
            abilities: {
              label: "Skills",
              categories: [{ key: "passive", label: "Passive", format: "name-description" }],
            },
            metadata: {
              hasKeywords: true,
              hasFactionKeywords: false,
              hasPoints: true,
              pointsFormat: "per-unit",
            },
          },
        },
      ],
    };

    const customCard = {
      name: "Custom Unit",
      cardType: "unit",
      source: "my-ds",
    };

    it("should resolve sections from custom schema", () => {
      const sections = resolveEditorSections(customCard, "my-ds", customSchema);
      const types = sections.map((s) => s.type);

      expect(types).toContain("name");
      expect(types).toContain("stats");
      expect(types).toContain("weapons");
      expect(types).toContain("abilities");
      expect(types).toContain("keywords");
      expect(types).toContain("points");
    });

    it("should use custom stat fields from schema", () => {
      const sections = resolveEditorSections(customCard, "my-ds", customSchema);
      const statsSection = sections.find((s) => s.type === "stats");

      expect(statsSection.label).toBe("Attributes");
      expect(statsSection.config.fields).toHaveLength(2);
      expect(statsSection.config.fields[0].key).toBe("str");
    });

    it("should use custom weapon type format", () => {
      const sections = resolveEditorSections(customCard, "my-ds", customSchema);
      const weaponsSection = sections.find((s) => s.type === "weapons");

      expect(weaponsSection.config.format).toBe("custom");
      expect(weaponsSection.config.types).toHaveLength(1);
      expect(weaponsSection.config.types[0].key).toBe("weapons");
    });
  });

  describe("edge cases", () => {
    it("should return empty array for null card", () => {
      expect(resolveEditorSections(null, "40k-10e", null)).toEqual([]);
    });

    it("should fall back to generic sections for unknown card type", () => {
      const sections = resolveEditorSections({ name: "Unknown" }, "unknown", null);
      expect(sections.length).toBeGreaterThanOrEqual(1);
      expect(sections[0].type).toBe("name");
    });
  });

  describe("custom schema flag forwarding", () => {
    const schemaWithFlags = {
      version: "1.0.0",
      baseSystem: "starcraft-tmg",
      cardTypes: [
        {
          key: "unit",
          label: "Unit",
          baseType: "unit",
          schema: {
            stats: {
              label: "Stats",
              allowMultipleProfiles: false,
              fields: [{ key: "hp", label: "HP", type: "string" }],
            },
            weaponTypes: {
              label: "Weapons",
              types: [
                {
                  key: "assault",
                  label: "Assault Phase",
                  hasKeywords: false,
                  hasProfiles: true,
                  profileRelation: "parent-child",
                  profileChildLabel: "Upgrade",
                  phaseStyle: "assault",
                  linkedAbilityCategory: "assault",
                  columns: [{ key: "rng", label: "RNG", type: "string" }],
                },
              ],
            },
            abilities: {
              label: "Abilities",
              categories: [
                {
                  key: "movement",
                  label: "Movement",
                  format: "name-description",
                  layout: "half",
                  phaseStyle: "movement",
                  hasType: true,
                  hasCost: true,
                  hasTriggerIcon: true,
                },
              ],
            },
            sections: {
              label: "Sections",
              sections: [{ key: "tiers", label: "Models / Supply", format: "modelsSupplyTiers" }],
            },
            metadata: {
              hasKeywords: true,
              hasFactionKeywords: true,
              keywordsLabel: "Tags",
              factionKeywordsLabel: "Race",
              hasPoints: true,
              pointsFormat: "per-unit",
              pointsLabel: "Models / Supply",
              hasCombatRole: true,
              hasArmySlot: true,
              hasAutoResize: true,
            },
          },
        },
      ],
    };
    const card = { name: "Marine", cardType: "unit" };

    it("surfaces metadata flags on the name section", () => {
      const sections = resolveEditorSections(card, "my-ds", schemaWithFlags);
      const nameSection = sections.find((s) => s.type === "name");
      expect(nameSection.config.hasCombatRole).toBe(true);
      expect(nameSection.config.hasArmySlot).toBe(true);
      expect(nameSection.config.hasAutoResize).toBe(true);
    });

    it("forwards ability category flags (hasType / hasCost / hasTriggerIcon / layout / phaseStyle)", () => {
      const sections = resolveEditorSections(card, "my-ds", schemaWithFlags);
      const abilities = sections.find((s) => s.type === "abilities");
      const cat = abilities.config.categories[0];
      expect(cat.hasType).toBe(true);
      expect(cat.hasCost).toBe(true);
      expect(cat.hasTriggerIcon).toBe(true);
      expect(cat.layout).toBe("half");
      expect(cat.phaseStyle).toBe("movement");
    });

    it("forwards weapon profile relation and child label", () => {
      const sections = resolveEditorSections(card, "my-ds", schemaWithFlags);
      const weapons = sections.find((s) => s.type === "weapons");
      const wt = weapons.config.types[0];
      expect(wt.hasProfiles).toBe(true);
      expect(wt.profileRelation).toBe("parent-child");
      expect(wt.profileChildLabel).toBe("Upgrade");
      expect(wt.phaseStyle).toBe("assault");
      expect(wt.linkedAbilityCategory).toBe("assault");
    });

    it("forwards keyword labels and points label", () => {
      const sections = resolveEditorSections(card, "my-ds", schemaWithFlags);
      const keywords = sections.find((s) => s.type === "keywords");
      expect(keywords.config.keywordsLabel).toBe("Tags");
      expect(keywords.config.factionKeywordsLabel).toBe("Race");
      const points = sections.find((s) => s.type === "points");
      expect(points.label).toBe("Models / Supply");
      expect(points.config.pointsLabel).toBe("Models / Supply");
    });

    it("preserves section format (modelsSupplyTiers, richtext, list) on custom sections", () => {
      const sections = resolveEditorSections(card, "my-ds", schemaWithFlags);
      const custom = sections.find((s) => s.type === "customSections");
      expect(custom.config.sections[0].format).toBe("modelsSupplyTiers");
    });
  });

  describe("custom datasource without metadata flags", () => {
    const minimalSchema = {
      version: "1.0.0",
      baseSystem: "blank",
      cardTypes: [
        {
          key: "unit",
          label: "Unit",
          baseType: "unit",
          schema: {
            stats: { label: "Stats", allowMultipleProfiles: false, fields: [{ key: "str", label: "STR" }] },
            weaponTypes: { label: "Weapons", types: [{ key: "w", label: "W", columns: [] }] },
            abilities: { label: "A", categories: [{ key: "c", label: "C", format: "name-description" }] },
            metadata: { hasKeywords: false, hasFactionKeywords: false, hasPoints: false, pointsFormat: "per-unit" },
          },
        },
      ],
    };
    const card = { name: "X", cardType: "unit" };

    it("emits all category flags as explicit false rather than undefined", () => {
      const sections = resolveEditorSections(card, "x", minimalSchema);
      const cat = sections.find((s) => s.type === "abilities").config.categories[0];
      expect(cat.hasType).toBe(false);
      expect(cat.hasCost).toBe(false);
      expect(cat.hasTriggerIcon).toBe(false);
      expect(cat.hasPhase).toBe(false);
      expect(cat.hasColor).toBe(false);
    });

    it("does not include keywords or points sections when metadata disables them", () => {
      const sections = resolveEditorSections(card, "x", minimalSchema);
      const types = sections.map((s) => s.type);
      expect(types).not.toContain("keywords");
      expect(types).not.toContain("points");
    });
  });
});
