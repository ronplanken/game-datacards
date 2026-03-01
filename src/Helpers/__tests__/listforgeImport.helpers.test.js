import {
  validateListforgeJson,
  extractCostsAsPoints,
  mapCategoryToSection,
  extractWeaponsFromSelection,
  isUnitSelection,
  extractDetachmentFromSelections,
  extractUnitsFromSelections,
  parseListforgeRoster,
  matchDetachment,
  extractStatsFromSelection,
  extractWeaponProfilesFromSelection,
  extractAbilitiesFromSelection,
  extractKeywordsFromSelection,
  buildCardFromSelection,
  buildCoreAbilitySet,
} from "../listforgeImport.helpers";

// ============================================
// Mock Listforge data helpers
// ============================================

const createValidListforgeExport = (overrides = {}) => ({
  id: "roster-123",
  name: "My Blood Angels",
  generatedBy: "List Forge",
  gameSystemId: "sys-40k",
  gameSystemName: "Warhammer 40,000",
  xmlns: "http://www.battlescribe.net/schema/rosterSchema",
  roster: {
    name: "Blood Angels Roster",
    costs: [
      { name: "pts", typeId: "points", value: 2000 },
      { name: "CP", typeId: "command-points", value: 0 },
    ],
    forces: [
      {
        id: "force-1",
        name: "Gladius Task Force",
        entryId: "force-1",
        catalogueId: "cat-ba",
        catalogueName: "Blood Angels",
        selections: [
          createUnitSelection("Captain in Terminator Armour", 105, {
            categories: [{ id: "cat-char", name: "Character", primary: true }],
            isWarlord: true,
            enhancement: { name: "Artisan of War", cost: 25 },
            weapons: ["Storm bolter", "Power weapon"],
          }),
          createUnitSelection("Intercessor Squad", 160, {
            categories: [{ id: "cat-bl", name: "Battleline", primary: true }],
            models: 10,
            weapons: ["Bolt rifle", "Bolt pistol", "Close combat weapon"],
          }),
          createUnitSelection("Predator Destructor", 130, {
            categories: [{ id: "cat-other", name: "Other", primary: true }],
            weapons: ["Predator autocannon", "Two heavy bolters"],
          }),
        ],
      },
    ],
  },
  ...overrides,
});

/**
 * Helper to create a unit selection in Listforge format
 */
function createUnitSelection(name, points, options = {}) {
  const selection = {
    id: `sel-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    entryId: `entry-${name.toLowerCase().replace(/\s+/g, "-")}`,
    number: options.models || 1,
    from: "entry",
    type: "unit",
    categories: options.categories || [],
    costs: [{ name: "pts", typeId: "points", value: points }],
    profiles: options.profiles || [],
    rules: [],
    selections: [],
    hidden: options.hidden || false,
  };

  // Add weapon sub-selections
  if (options.weapons) {
    for (const weaponName of options.weapons) {
      selection.selections.push({
        id: `sel-${weaponName.toLowerCase().replace(/\s+/g, "-")}`,
        name: weaponName,
        entryId: `entry-weapon`,
        number: 1,
        from: "entry",
        type: "upgrade",
        profiles: [
          {
            id: `prof-${weaponName.toLowerCase().replace(/\s+/g, "-")}`,
            name: weaponName,
            typeId: "ranged-weapon",
            typeName: "Ranged Weapons",
            characteristics: [
              { name: "Range", $text: '24"' },
              { name: "A", $text: "2" },
              { name: "BS", $text: "3+" },
              { name: "S", $text: "4" },
              { name: "AP", $text: "-1" },
              { name: "D", $text: "1" },
            ],
          },
        ],
        costs: [],
        selections: [],
      });
    }
  }

  // Add warlord marker
  if (options.isWarlord) {
    selection.selections.push({
      id: "sel-warlord",
      name: "Warlord",
      entryId: "entry-warlord",
      number: 1,
      from: "entry",
      type: "upgrade",
      categories: [{ id: "cat-warlord", name: "Warlord", primary: false }],
      costs: [],
      selections: [],
    });
  }

  // Add enhancement
  if (options.enhancement) {
    selection.selections.push({
      id: "sel-enhancement",
      name: options.enhancement.name,
      entryId: "entry-enhancement",
      number: 1,
      from: "entry",
      type: "upgrade",
      categories: [{ id: "cat-enh", name: "Enhancement", primary: false }],
      costs: [{ name: "pts", typeId: "points", value: options.enhancement.cost }],
      selections: [],
    });
  }

  // Add model sub-selections for multi-model units
  if (options.models && options.models > 1) {
    selection.number = 1; // Parent is 1 unit
    selection.selections.push({
      id: "sel-model-1",
      name: `${name} Sergeant`,
      entryId: "entry-model",
      number: 1,
      from: "entry",
      type: "model",
      costs: [],
      selections: [],
    });
    selection.selections.push({
      id: "sel-model-2",
      name: `${name} Marine`,
      entryId: "entry-model",
      number: options.models - 1,
      from: "entry",
      type: "model",
      costs: [],
      selections: [],
    });
  }

  return selection;
}

// ============================================
// validateListforgeJson
// ============================================
describe("listforgeImport.helpers", () => {
  describe("validateListforgeJson", () => {
    it("should accept a valid Listforge export", () => {
      const data = createValidListforgeExport();
      const result = validateListforgeJson(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject null input", () => {
      const result = validateListforgeJson(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid JSON data");
    });

    it("should reject non-object input", () => {
      const result = validateListforgeJson("string");
      expect(result.isValid).toBe(false);
    });

    it("should accept a NewRecruit export", () => {
      const data = createValidListforgeExport({ generatedBy: "https://newrecruit.eu" });
      const result = validateListforgeJson(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject if generatedBy is not a supported generator", () => {
      const data = createValidListforgeExport({ generatedBy: "BattleScribe" });
      const result = validateListforgeJson(data);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/Not a supported export/);
    });

    it("should reject if generatedBy is missing", () => {
      const data = createValidListforgeExport();
      delete data.generatedBy;
      const result = validateListforgeJson(data);
      expect(result.isValid).toBe(false);
    });

    it("should reject if roster is missing", () => {
      const data = createValidListforgeExport();
      delete data.roster;
      const result = validateListforgeJson(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing roster data");
    });

    it("should reject if forces array is empty", () => {
      const data = createValidListforgeExport();
      data.roster.forces = [];
      const result = validateListforgeJson(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Roster contains no forces");
    });

    it("should collect multiple errors", () => {
      const result = validateListforgeJson({ someField: true });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // extractCostsAsPoints
  // ============================================
  describe("extractCostsAsPoints", () => {
    it("should extract points from costs array", () => {
      const costs = [
        { name: "pts", typeId: "points", value: 150 },
        { name: "CP", typeId: "command-points", value: 1 },
      ];
      expect(extractCostsAsPoints(costs)).toBe(150);
    });

    it("should handle string values", () => {
      const costs = [{ name: "pts", typeId: "points", value: "200" }];
      expect(extractCostsAsPoints(costs)).toBe(200);
    });

    it("should sum multiple pts entries", () => {
      const costs = [
        { name: "pts", typeId: "points", value: 100 },
        { name: "pts", typeId: "extra-points", value: 50 },
      ];
      expect(extractCostsAsPoints(costs)).toBe(150);
    });

    it("should return 0 for empty array", () => {
      expect(extractCostsAsPoints([])).toBe(0);
    });

    it("should return 0 for null/undefined", () => {
      expect(extractCostsAsPoints(null)).toBe(0);
      expect(extractCostsAsPoints(undefined)).toBe(0);
    });

    it("should ignore non-pts costs", () => {
      const costs = [{ name: "CP", typeId: "command-points", value: 3 }];
      expect(extractCostsAsPoints(costs)).toBe(0);
    });

    it("should handle NaN values gracefully", () => {
      const costs = [{ name: "pts", typeId: "points", value: "invalid" }];
      expect(extractCostsAsPoints(costs)).toBe(0);
    });
  });

  // ============================================
  // mapCategoryToSection
  // ============================================
  describe("mapCategoryToSection", () => {
    it('should map "Character" to "CHARACTERS"', () => {
      const cats = [{ id: "1", name: "Character", primary: true }];
      expect(mapCategoryToSection(cats)).toBe("CHARACTERS");
    });

    it('should map "Battleline" to "BATTLELINE"', () => {
      const cats = [{ id: "1", name: "Battleline", primary: true }];
      expect(mapCategoryToSection(cats)).toBe("BATTLELINE");
    });

    it('should map "Dedicated Transport" to "DEDICATED TRANSPORTS"', () => {
      const cats = [{ id: "1", name: "Dedicated Transport", primary: true }];
      expect(mapCategoryToSection(cats)).toBe("DEDICATED TRANSPORTS");
    });

    it('should map "Epic Hero" to "CHARACTERS"', () => {
      const cats = [{ id: "1", name: "Epic Hero", primary: true }];
      expect(mapCategoryToSection(cats)).toBe("CHARACTERS");
    });

    it("should use only the primary category", () => {
      const cats = [
        { id: "1", name: "Infantry", primary: false },
        { id: "2", name: "Battleline", primary: true },
      ];
      expect(mapCategoryToSection(cats)).toBe("BATTLELINE");
    });

    it("should return null if no primary category", () => {
      const cats = [{ id: "1", name: "Infantry", primary: false }];
      expect(mapCategoryToSection(cats)).toBeNull();
    });

    it("should return null for null/undefined input", () => {
      expect(mapCategoryToSection(null)).toBeNull();
      expect(mapCategoryToSection(undefined)).toBeNull();
    });

    it("should uppercase unknown categories", () => {
      const cats = [{ id: "1", name: "Fast Attack", primary: true }];
      expect(mapCategoryToSection(cats)).toBe("FAST ATTACK");
    });

    it("should handle case-insensitive matching", () => {
      const cats = [{ id: "1", name: "character", primary: true }];
      expect(mapCategoryToSection(cats)).toBe("CHARACTERS");
    });
  });

  // ============================================
  // extractWeaponsFromSelection
  // ============================================
  describe("extractWeaponsFromSelection", () => {
    it("should extract weapon names from profiles", () => {
      const selection = {
        name: "Storm bolter",
        type: "upgrade",
        profiles: [{ name: "Storm bolter", typeName: "Ranged Weapons", hidden: false }],
        selections: [],
      };
      expect(extractWeaponsFromSelection(selection)).toEqual(["Storm bolter"]);
    });

    it("should extract weapons from nested selections", () => {
      const selection = {
        name: "Unit",
        type: "unit",
        profiles: [],
        selections: [
          {
            name: "Bolt rifle",
            type: "upgrade",
            profiles: [{ name: "Bolt rifle", typeName: "Ranged Weapons", hidden: false }],
            selections: [],
          },
          {
            name: "Power sword",
            type: "upgrade",
            profiles: [{ name: "Power sword", typeName: "Melee Weapons", hidden: false }],
            selections: [],
          },
        ],
      };
      const weapons = extractWeaponsFromSelection(selection);
      expect(weapons).toContain("Bolt rifle");
      expect(weapons).toContain("Power sword");
    });

    it("should skip hidden weapon profiles", () => {
      const selection = {
        name: "Hidden weapon",
        type: "upgrade",
        profiles: [{ name: "Secret gun", typeName: "Ranged Weapons", hidden: true }],
        selections: [],
      };
      expect(extractWeaponsFromSelection(selection)).toEqual([]);
    });

    it("should return empty array for selection with no weapons", () => {
      const selection = {
        name: "Some ability",
        type: "upgrade",
        profiles: [{ name: "Ability", typeName: "Abilities" }],
        selections: [],
      };
      expect(extractWeaponsFromSelection(selection)).toEqual([]);
    });

    it("should handle deeply nested weapon selections", () => {
      const selection = {
        name: "Model",
        type: "model",
        profiles: [],
        selections: [
          {
            name: "Loadout",
            type: "upgrade",
            profiles: [],
            selections: [
              {
                name: "Plasma gun",
                type: "upgrade",
                profiles: [{ name: "Plasma gun", typeName: "Ranged Weapons", hidden: false }],
                selections: [],
              },
            ],
          },
        ],
      };
      expect(extractWeaponsFromSelection(selection)).toContain("Plasma gun");
    });
  });

  // ============================================
  // isUnitSelection
  // ============================================
  describe("isUnitSelection", () => {
    it('should return true for type "unit"', () => {
      expect(isUnitSelection({ type: "unit", name: "Intercessors" })).toBe(true);
    });

    it('should return true for type "model"', () => {
      expect(isUnitSelection({ type: "model", name: "Sergeant" })).toBe(true);
    });

    it('should return true for type "upgrade" without Configuration category', () => {
      expect(
        isUnitSelection({
          type: "upgrade",
          name: "Some upgrade",
          categories: [{ id: "1", name: "Other", primary: true }],
        }),
      ).toBe(true);
    });

    it("should return false for a selection with primary category Configuration", () => {
      expect(
        isUnitSelection({
          type: "upgrade",
          name: "Battle Size",
          categories: [{ id: "1", name: "Configuration", primary: true }],
        }),
      ).toBe(false);
    });

    it("should be case-insensitive for Configuration category", () => {
      expect(
        isUnitSelection({
          type: "upgrade",
          name: "Detachment",
          categories: [{ id: "1", name: "configuration", primary: true }],
        }),
      ).toBe(false);
    });

    it("should return true when Configuration category is not primary", () => {
      expect(
        isUnitSelection({
          type: "upgrade",
          name: "Mixed",
          categories: [
            { id: "1", name: "Configuration", primary: false },
            { id: "2", name: "Other", primary: true },
          ],
        }),
      ).toBe(true);
    });

    it("should return false for null/undefined input", () => {
      expect(isUnitSelection(null)).toBe(false);
      expect(isUnitSelection(undefined)).toBe(false);
    });

    it("should return true for selection with no categories", () => {
      expect(isUnitSelection({ type: "upgrade", name: "No cats" })).toBe(true);
    });
  });

  // ============================================
  // extractDetachmentFromSelections
  // ============================================
  describe("extractDetachmentFromSelections", () => {
    it("should extract detachment name from a Detachment Configuration selection", () => {
      const selections = [
        {
          name: "Detachment",
          type: "upgrade",
          categories: [{ id: "1", name: "Configuration", primary: true }],
          selections: [{ name: "Gate Warden Lance", type: "upgrade" }],
        },
        createUnitSelection("Some Unit", 100),
      ];
      expect(extractDetachmentFromSelections(selections)).toBe("Gate Warden Lance");
    });

    it("should return null when no Detachment selection exists", () => {
      const selections = [createUnitSelection("Some Unit", 100)];
      expect(extractDetachmentFromSelections(selections)).toBeNull();
    });

    it("should return null for null/undefined input", () => {
      expect(extractDetachmentFromSelections(null)).toBeNull();
      expect(extractDetachmentFromSelections(undefined)).toBeNull();
    });

    it("should return null when Detachment selection has no sub-selections", () => {
      const selections = [
        {
          name: "Detachment",
          type: "upgrade",
          categories: [{ id: "1", name: "Configuration", primary: true }],
          selections: [],
        },
      ];
      expect(extractDetachmentFromSelections(selections)).toBeNull();
    });

    it("should ignore a selection named Detachment without Configuration category", () => {
      const selections = [
        {
          name: "Detachment",
          type: "upgrade",
          categories: [{ id: "1", name: "Other", primary: true }],
          selections: [{ name: "Gate Warden Lance", type: "upgrade" }],
        },
      ];
      expect(extractDetachmentFromSelections(selections)).toBeNull();
    });
  });

  // ============================================
  // extractUnitsFromSelections
  // ============================================
  describe("extractUnitsFromSelections", () => {
    it("should extract units with correct fields", () => {
      const data = createValidListforgeExport();
      const units = extractUnitsFromSelections(data.roster.forces[0].selections);

      expect(units).toHaveLength(3);
      expect(units[0].originalName).toBe("Captain in Terminator Armour");
      expect(units[0].points).toBe(105);
      expect(units[0].section).toBe("CHARACTERS");
      expect(units[0].isWarlord).toBe(true);
      expect(units[0].matchStatus).toBeNull();
      expect(units[0].matchedCard).toBeNull();
      expect(units[0].skipped).toBe(false);
    });

    it("should extract enhancement from unit", () => {
      const data = createValidListforgeExport();
      const units = extractUnitsFromSelections(data.roster.forces[0].selections);

      expect(units[0].enhancement).toBeTruthy();
      expect(units[0].enhancement.name).toBe("Artisan of War");
      expect(units[0].enhancement.cost).toBe(25);
    });

    it("should extract weapons from unit", () => {
      const data = createValidListforgeExport();
      const units = extractUnitsFromSelections(data.roster.forces[0].selections);

      expect(units[0].weapons).toContain("Storm bolter");
      expect(units[0].weapons).toContain("Power weapon");
    });

    it("should calculate model count from sub-selections", () => {
      const data = createValidListforgeExport();
      const units = extractUnitsFromSelections(data.roster.forces[0].selections);

      // Intercessor Squad has 10 models (1 sergeant + 9 marines)
      expect(units[1].models).toBe(10);
    });

    it("should skip hidden selections", () => {
      const selections = [
        createUnitSelection("Visible Unit", 100, {
          categories: [{ id: "1", name: "Battleline", primary: true }],
        }),
        createUnitSelection("Hidden Unit", 50, {
          hidden: true,
          categories: [{ id: "2", name: "Other", primary: true }],
        }),
      ];

      const units = extractUnitsFromSelections(selections);
      expect(units).toHaveLength(1);
      expect(units[0].originalName).toBe("Visible Unit");
    });

    it("should return empty array for null input", () => {
      expect(extractUnitsFromSelections(null)).toEqual([]);
      expect(extractUnitsFromSelections(undefined)).toEqual([]);
    });

    it("should handle unit with no enhancement", () => {
      const data = createValidListforgeExport();
      const units = extractUnitsFromSelections(data.roster.forces[0].selections);

      // Intercessor Squad has no enhancement
      expect(units[1].enhancement).toBeNull();
    });

    it("should handle unit that is not warlord", () => {
      const data = createValidListforgeExport();
      const units = extractUnitsFromSelections(data.roster.forces[0].selections);

      expect(units[1].isWarlord).toBe(false);
      expect(units[2].isWarlord).toBe(false);
    });

    it("should filter out Configuration selections from NewRecruit exports", () => {
      const selections = [
        {
          name: "Show/Hide Options",
          type: "upgrade",
          hidden: false,
          categories: [{ id: "cfg-1", name: "Configuration", primary: true }],
          costs: [],
          profiles: [],
          selections: [],
        },
        {
          name: "Battle Size",
          type: "upgrade",
          hidden: false,
          categories: [{ id: "cfg-2", name: "Configuration", primary: true }],
          costs: [],
          profiles: [],
          selections: [],
        },
        {
          name: "Detachment",
          type: "upgrade",
          hidden: false,
          categories: [{ id: "cfg-3", name: "Configuration", primary: true }],
          costs: [],
          profiles: [],
          selections: [{ name: "Gate Warden Lance", type: "upgrade" }],
        },
        createUnitSelection("Intercessor Squad", 160, {
          categories: [{ id: "cat-bl", name: "Battleline", primary: true }],
        }),
      ];

      const units = extractUnitsFromSelections(selections);
      expect(units).toHaveLength(1);
      expect(units[0].originalName).toBe("Intercessor Squad");
    });
  });

  // ============================================
  // parseListforgeRoster
  // ============================================
  describe("parseListforgeRoster", () => {
    it("should parse a valid roster", () => {
      const data = createValidListforgeExport();
      const result = parseListforgeRoster(data);

      expect(result.error).toBeNull();
      expect(result.rosterName).toBe("My Blood Angels");
      expect(result.gameSystemName).toBe("Warhammer 40,000");
      expect(result.totalPoints).toBe(2000);
      expect(result.factionName).toBe("Blood Angels");
      expect(result.detachmentName).toBe("Gladius Task Force");
      expect(result.units).toHaveLength(3);
    });

    it("should use data.name as rosterName", () => {
      const data = createValidListforgeExport({ name: "Custom Name" });
      const result = parseListforgeRoster(data);
      expect(result.rosterName).toBe("Custom Name");
    });

    it("should fallback to roster.name if data.name is missing", () => {
      const data = createValidListforgeExport();
      delete data.name;
      const result = parseListforgeRoster(data);
      expect(result.rosterName).toBe("Blood Angels Roster");
    });

    it("should return error if no forces", () => {
      const result = parseListforgeRoster({ roster: { forces: [] } });
      expect(result.error).toBeTruthy();
      expect(result.units).toEqual([]);
    });

    it("should return error if roster is null", () => {
      const result = parseListforgeRoster({ roster: null });
      expect(result.error).toBeTruthy();
    });

    it("should return error if factionName cannot be determined", () => {
      const data = createValidListforgeExport();
      delete data.roster.forces[0].catalogueName;
      const result = parseListforgeRoster(data);
      expect(result.error).toMatch(/Could not identify faction name/);
    });

    it("should extract total points from roster costs", () => {
      const data = createValidListforgeExport();
      data.roster.costs = [
        { name: "pts", typeId: "points", value: 1500 },
        { name: "CP", typeId: "command-points", value: 2 },
      ];
      const result = parseListforgeRoster(data);
      expect(result.totalPoints).toBe(1500);
    });

    it("should strip alliance prefix from factionName", () => {
      const data = createValidListforgeExport();
      data.roster.forces[0].catalogueName = "Imperium - Imperial Knights";
      const result = parseListforgeRoster(data);
      expect(result.factionName).toBe("Imperial Knights");
    });

    it("should strip alliance prefix when faction name also contains a hyphen", () => {
      const data = createValidListforgeExport();
      data.roster.forces[0].catalogueName = "Chaos - Chaos Space Marines - World Eaters";
      const result = parseListforgeRoster(data);
      expect(result.factionName).toBe("Chaos Space Marines - World Eaters");
    });

    it("should leave factionName as-is when no prefix is present", () => {
      const data = createValidListforgeExport();
      data.roster.forces[0].catalogueName = "Blood Angels";
      const result = parseListforgeRoster(data);
      expect(result.factionName).toBe("Blood Angels");
    });

    it("should handle missing gameSystemName", () => {
      const data = createValidListforgeExport();
      delete data.gameSystemName;
      const result = parseListforgeRoster(data);
      expect(result.gameSystemName).toBeNull();
      expect(result.error).toBeNull();
    });

    it("should extract detachment from NewRecruit Configuration selection", () => {
      const data = createValidListforgeExport();
      // Simulate NewRecruit: force.name is generic, detachment is in a Configuration selection
      data.roster.forces[0].name = "Army Roster";
      data.roster.forces[0].selections.unshift({
        id: "sel-detachment",
        name: "Detachment",
        entryId: "entry-detachment",
        number: 1,
        from: "entry",
        type: "upgrade",
        hidden: false,
        categories: [{ id: "cfg-det", name: "Configuration", primary: true }],
        costs: [],
        profiles: [],
        selections: [{ name: "Gate Warden Lance", type: "upgrade" }],
      });
      const result = parseListforgeRoster(data);
      expect(result.detachmentName).toBe("Gate Warden Lance");
    });

    it("should fall back to force.name when no Configuration detachment exists", () => {
      const data = createValidListforgeExport();
      // Standard ListForge: force.name is the detachment, no Configuration selections
      const result = parseListforgeRoster(data);
      expect(result.detachmentName).toBe("Gladius Task Force");
    });
  });

  // ============================================
  // matchDetachment
  // ============================================
  describe("matchDetachment", () => {
    const detachments = ["Gladius Task Force", "Ironstorm Spearhead", "Firestorm Assault Force"];

    it("should find exact match", () => {
      const result = matchDetachment("Gladius Task Force", detachments);
      expect(result.matchedDetachment).toBe("Gladius Task Force");
      expect(result.matchStatus).toBe("exact");
    });

    it("should be case-insensitive for exact match", () => {
      const result = matchDetachment("gladius task force", detachments);
      expect(result.matchedDetachment).toBe("Gladius Task Force");
      expect(result.matchStatus).toBe("exact");
    });

    it("should fuzzy match similar names", () => {
      const result = matchDetachment("Gladius Taskforce", detachments);
      expect(result.matchedDetachment).toBe("Gladius Task Force");
      expect(result.matchStatus).toBe("confident");
    });

    it("should return null for no match", () => {
      const result = matchDetachment("Completely Unrelated", detachments);
      expect(result.matchedDetachment).toBeNull();
      expect(result.matchStatus).toBe("none");
    });

    it("should return null for empty detachments", () => {
      const result = matchDetachment("Gladius Task Force", []);
      expect(result.matchedDetachment).toBeNull();
    });

    it("should return null for null name", () => {
      const result = matchDetachment(null, detachments);
      expect(result.matchedDetachment).toBeNull();
    });

    it("should handle object-format detachments", () => {
      const objectDetachments = [
        { name: "Gladius Task Force", faction: "Space Marines" },
        { name: "Ironstorm Spearhead", faction: "Space Marines" },
      ];
      const result = matchDetachment("Gladius Task Force", objectDetachments);
      expect(result.matchedDetachment).toBe("Gladius Task Force");
      expect(result.matchStatus).toBe("exact");
    });
  });

  // ============================================
  // extractStatsFromSelection
  // ============================================
  describe("extractStatsFromSelection", () => {
    it("should extract stats from a single-model unit profile", () => {
      const selection = {
        name: "Huron Blackheart",
        type: "model",
        profiles: [
          {
            name: "Huron Blackheart",
            typeName: "Unit",
            hidden: false,
            characteristics: [
              { name: "M", $text: '6"' },
              { name: "T", $text: "5" },
              { name: "SV", $text: "3+" },
              { name: "W", $text: "5" },
              { name: "LD", $text: "6+" },
              { name: "OC", $text: "1" },
            ],
          },
        ],
        selections: [],
      };

      const stats = extractStatsFromSelection(selection);
      expect(stats).toHaveLength(1);
      expect(stats[0].name).toBe("Huron Blackheart");
      expect(stats[0].m).toBe('6"');
      expect(stats[0].t).toBe("5");
      expect(stats[0].sv).toBe("3+");
      expect(stats[0].w).toBe("5");
      expect(stats[0].ld).toBe("6+");
      expect(stats[0].oc).toBe("1");
      expect(stats[0].active).toBe(true);
      expect(stats[0].showName).toBe(false);
    });

    it("should extract stats from model sub-selections", () => {
      const selection = {
        name: "Masters of the Maelstrom",
        type: "unit",
        profiles: [],
        selections: [
          {
            name: "The Enforcer",
            type: "model",
            profiles: [
              {
                name: "The Enforcer",
                typeName: "Unit",
                hidden: false,
                characteristics: [
                  { name: "M", $text: '6"' },
                  { name: "T", $text: "3" },
                  { name: "SV", $text: "4+" },
                  { name: "W", $text: "3" },
                  { name: "LD", $text: "6+" },
                  { name: "OC", $text: "1" },
                ],
              },
            ],
            selections: [],
          },
          {
            name: "Captain Sargotta",
            type: "model",
            profiles: [
              {
                name: "Captain Sargotta",
                typeName: "Unit",
                hidden: false,
                characteristics: [
                  { name: "M", $text: '6"' },
                  { name: "T", $text: "3" },
                  { name: "SV", $text: "4+" },
                  { name: "W", $text: "4" },
                  { name: "LD", $text: "6+" },
                  { name: "OC", $text: "1" },
                ],
              },
            ],
            selections: [],
          },
        ],
      };

      const stats = extractStatsFromSelection(selection);
      expect(stats).toHaveLength(2);
      expect(stats[0].name).toBe("The Enforcer");
      expect(stats[1].name).toBe("Captain Sargotta");
      // Different names should set showName = true
      expect(stats[0].showName).toBe(true);
      expect(stats[1].showName).toBe(true);
    });

    it("should show names when multiple unique stat lines exist even with the same name", () => {
      const selection = {
        name: "Intercessors",
        type: "unit",
        profiles: [],
        selections: [
          {
            name: "Intercessor",
            type: "model",
            profiles: [
              {
                name: "Intercessor",
                typeName: "Unit",
                hidden: false,
                characteristics: [
                  { name: "M", $text: '6"' },
                  { name: "T", $text: "4" },
                  { name: "SV", $text: "3+" },
                  { name: "W", $text: "2" },
                  { name: "LD", $text: "6+" },
                  { name: "OC", $text: "2" },
                ],
              },
            ],
            selections: [],
          },
          {
            name: "Intercessor Sergeant",
            type: "model",
            profiles: [
              {
                name: "Intercessor",
                typeName: "Unit",
                hidden: false,
                characteristics: [
                  { name: "M", $text: '6"' },
                  { name: "T", $text: "4" },
                  { name: "SV", $text: "3+" },
                  { name: "W", $text: "3" },
                  { name: "LD", $text: "6+" },
                  { name: "OC", $text: "2" },
                ],
              },
            ],
            selections: [],
          },
        ],
      };

      const stats = extractStatsFromSelection(selection);
      // Two stat lines with different W values are both kept, names always shown
      expect(stats).toHaveLength(2);
      expect(stats[0].showName).toBe(true);
      expect(stats[1].showName).toBe(true);
    });

    it("should skip hidden profiles", () => {
      const selection = {
        name: "Unit",
        type: "model",
        profiles: [
          { name: "Hidden", typeName: "Unit", hidden: true, characteristics: [] },
          {
            name: "Visible",
            typeName: "Unit",
            hidden: false,
            characteristics: [
              { name: "M", $text: '6"' },
              { name: "T", $text: "4" },
              { name: "SV", $text: "3+" },
              { name: "W", $text: "1" },
              { name: "LD", $text: "6+" },
              { name: "OC", $text: "1" },
            ],
          },
        ],
        selections: [],
      };

      const stats = extractStatsFromSelection(selection);
      expect(stats).toHaveLength(1);
      expect(stats[0].name).toBe("Visible");
    });

    it("should return empty array for selection with no Unit profiles", () => {
      const selection = {
        name: "Ability only",
        type: "upgrade",
        profiles: [{ name: "Some Ability", typeName: "Abilities", hidden: false, characteristics: [] }],
        selections: [],
      };

      expect(extractStatsFromSelection(selection)).toEqual([]);
    });

    it("should handle missing characteristics gracefully", () => {
      const selection = {
        name: "Unit",
        type: "model",
        profiles: [
          {
            name: "Partial",
            typeName: "Unit",
            hidden: false,
            characteristics: [
              { name: "M", $text: '6"' },
              { name: "T", $text: "4" },
            ],
          },
        ],
        selections: [],
      };

      const stats = extractStatsFromSelection(selection);
      expect(stats).toHaveLength(1);
      expect(stats[0].m).toBe('6"');
      expect(stats[0].sv).toBe("");
      expect(stats[0].w).toBe("");
    });

    it("should deduplicate identical stat profiles from multiple models", () => {
      const makeModelWithStats = (modelName, profileName) => ({
        name: modelName,
        type: "model",
        profiles: [
          {
            name: profileName,
            typeName: "Unit",
            hidden: false,
            characteristics: [
              { name: "M", $text: '6"' },
              { name: "T", $text: "4" },
              { name: "SV", $text: "3+" },
              { name: "W", $text: "2" },
              { name: "LD", $text: "6+" },
              { name: "OC", $text: "1" },
            ],
          },
        ],
        selections: [],
      });

      const selection = {
        name: "Chosen",
        type: "unit",
        profiles: [],
        selections: [
          makeModelWithStats("Chosen 1", "Chosen"),
          makeModelWithStats("Chosen 2", "Chosen"),
          makeModelWithStats("Chosen 3", "Chosen"),
          makeModelWithStats("Chosen 4", "Chosen"),
        ],
      };

      const stats = extractStatsFromSelection(selection);
      expect(stats).toHaveLength(1);
      expect(stats[0].name).toBe("4 models");
    });

    it("should preserve stat profiles with different values", () => {
      const selection = {
        name: "Mixed Unit",
        type: "unit",
        profiles: [],
        selections: [
          {
            name: "Champion",
            type: "model",
            profiles: [
              {
                name: "Champion",
                typeName: "Unit",
                hidden: false,
                characteristics: [
                  { name: "M", $text: '6"' },
                  { name: "T", $text: "4" },
                  { name: "SV", $text: "3+" },
                  { name: "W", $text: "3" },
                  { name: "LD", $text: "6+" },
                  { name: "OC", $text: "1" },
                ],
              },
            ],
            selections: [],
          },
          {
            name: "Warrior",
            type: "model",
            profiles: [
              {
                name: "Warrior",
                typeName: "Unit",
                hidden: false,
                characteristics: [
                  { name: "M", $text: '6"' },
                  { name: "T", $text: "4" },
                  { name: "SV", $text: "3+" },
                  { name: "W", $text: "2" },
                  { name: "LD", $text: "6+" },
                  { name: "OC", $text: "1" },
                ],
              },
            ],
            selections: [],
          },
        ],
      };

      const stats = extractStatsFromSelection(selection);
      expect(stats).toHaveLength(2);
      expect(stats[0].name).toBe("Champion");
      expect(stats[1].name).toBe("Warrior");
      expect(stats[0].showName).toBe(true);
      expect(stats[1].showName).toBe(true);
    });

    it("should deduplicate mixed stat profiles keeping unique ones", () => {
      const makeModel = (modelName, profileName, wounds) => ({
        name: modelName,
        type: "model",
        profiles: [
          {
            name: profileName,
            typeName: "Unit",
            hidden: false,
            characteristics: [
              { name: "M", $text: '6"' },
              { name: "T", $text: "4" },
              { name: "SV", $text: "3+" },
              { name: "W", $text: wounds },
              { name: "LD", $text: "6+" },
              { name: "OC", $text: "1" },
            ],
          },
        ],
        selections: [],
      });

      const selection = {
        name: "Squad",
        type: "unit",
        profiles: [],
        selections: [
          makeModel("Model A", "Warrior", "2"),
          makeModel("Model B", "Warrior", "2"),
          makeModel("Model C", "Warrior", "2"),
          makeModel("Model D", "Champion", "3"),
          makeModel("Model E", "Champion", "3"),
        ],
      };

      const stats = extractStatsFromSelection(selection);
      expect(stats).toHaveLength(2);
      expect(stats[0].name).toBe("3 models");
      expect(stats[1].name).toBe("2 models");
      expect(stats[0].showName).toBe(true);
      expect(stats[1].showName).toBe(true);
    });
  });

  // ============================================
  // extractWeaponProfilesFromSelection
  // ============================================
  describe("extractWeaponProfilesFromSelection", () => {
    it("should separate ranged and melee weapons", () => {
      const selection = {
        name: "Unit",
        type: "unit",
        profiles: [],
        selections: [
          {
            name: "Bolt rifle",
            type: "upgrade",
            profiles: [
              {
                name: "Bolt rifle",
                typeName: "Ranged Weapons",
                hidden: false,
                characteristics: [
                  { name: "Range", $text: '24"' },
                  { name: "A", $text: "2" },
                  { name: "BS", $text: "3+" },
                  { name: "S", $text: "4" },
                  { name: "AP", $text: "-1" },
                  { name: "D", $text: "1" },
                  { name: "Keywords", $text: "Assault, Heavy" },
                ],
              },
            ],
            selections: [],
          },
          {
            name: "Close combat weapon",
            type: "upgrade",
            profiles: [
              {
                name: "Close combat weapon",
                typeName: "Melee Weapons",
                hidden: false,
                characteristics: [
                  { name: "Range", $text: "Melee" },
                  { name: "A", $text: "3" },
                  { name: "WS", $text: "3+" },
                  { name: "S", $text: "4" },
                  { name: "AP", $text: "0" },
                  { name: "D", $text: "1" },
                  { name: "Keywords", $text: "-" },
                ],
              },
            ],
            selections: [],
          },
        ],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.rangedWeapons).toHaveLength(1);
      expect(result.rangedWeapons[0].profiles).toHaveLength(1);
      expect(result.rangedWeapons[0].profiles[0].name).toBe("Bolt rifle");
      expect(result.rangedWeapons[0].profiles[0].range).toBe('24"');
      expect(result.rangedWeapons[0].profiles[0].skill).toBe("3+");
      expect(result.rangedWeapons[0].profiles[0].keywords).toEqual(["Assault", "Heavy"]);

      expect(result.meleeWeapons).toHaveLength(1);
      expect(result.meleeWeapons[0].profiles).toHaveLength(1);
      expect(result.meleeWeapons[0].profiles[0].name).toBe("Close combat weapon");
      expect(result.meleeWeapons[0].profiles[0].skill).toBe("3+");
      expect(result.meleeWeapons[0].profiles[0].keywords).toEqual([]);
    });

    it("should extract weapons from deeply nested selections", () => {
      const selection = {
        name: "Unit",
        type: "unit",
        profiles: [],
        selections: [
          {
            name: "Model",
            type: "model",
            profiles: [],
            selections: [
              {
                name: "Loadout",
                type: "upgrade",
                profiles: [],
                selections: [
                  {
                    name: "Plasma gun",
                    type: "upgrade",
                    profiles: [
                      {
                        name: "Plasma gun - standard",
                        typeName: "Ranged Weapons",
                        hidden: false,
                        characteristics: [
                          { name: "Range", $text: '24"' },
                          { name: "A", $text: "1" },
                          { name: "BS", $text: "3+" },
                          { name: "S", $text: "7" },
                          { name: "AP", $text: "-2" },
                          { name: "D", $text: "1" },
                          { name: "Keywords", $text: "Rapid Fire 1" },
                        ],
                      },
                    ],
                    selections: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.rangedWeapons).toHaveLength(1);
      expect(result.rangedWeapons[0].profiles[0].name).toBe("Plasma gun - standard");
      expect(result.rangedWeapons[0].profiles[0].keywords).toEqual(["Rapid Fire 1"]);
    });

    it("should skip hidden weapon profiles", () => {
      const selection = {
        name: "Unit",
        type: "unit",
        profiles: [],
        selections: [
          {
            name: "Hidden gun",
            type: "upgrade",
            profiles: [
              {
                name: "Secret gun",
                typeName: "Ranged Weapons",
                hidden: true,
                characteristics: [],
              },
            ],
            selections: [],
          },
        ],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.rangedWeapons).toHaveLength(0);
      expect(result.meleeWeapons).toHaveLength(0);
    });

    it("should return empty arrays when no weapons found", () => {
      const selection = {
        name: "Unit",
        type: "unit",
        profiles: [{ name: "Ability", typeName: "Abilities", hidden: false, characteristics: [] }],
        selections: [],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.rangedWeapons).toEqual([]);
      expect(result.meleeWeapons).toEqual([]);
    });

    it("should parse keyword string with commas", () => {
      const selection = {
        name: "Unit",
        type: "upgrade",
        profiles: [
          {
            name: "Flamer",
            typeName: "Ranged Weapons",
            hidden: false,
            characteristics: [
              { name: "Range", $text: '12"' },
              { name: "A", $text: "D6" },
              { name: "BS", $text: "N/A" },
              { name: "S", $text: "4" },
              { name: "AP", $text: "0" },
              { name: "D", $text: "1" },
              { name: "Keywords", $text: "Ignores Cover, Pistol, Torrent" },
            ],
          },
        ],
        selections: [],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.rangedWeapons[0].profiles[0].keywords).toEqual(["Ignores Cover", "Pistol", "Torrent"]);
    });

    it("should deduplicate identical ranged weapon profiles", () => {
      const makeModelWithBoltgun = (name) => ({
        name,
        type: "model",
        profiles: [
          {
            name: "Boltgun",
            typeName: "Ranged Weapons",
            hidden: false,
            characteristics: [
              { name: "Range", $text: '24"' },
              { name: "A", $text: "2" },
              { name: "BS", $text: "3+" },
              { name: "S", $text: "4" },
              { name: "AP", $text: "0" },
              { name: "D", $text: "1" },
              { name: "Keywords", $text: "Rapid Fire 1" },
            ],
          },
        ],
        selections: [],
      });

      const selection = {
        name: "Squad",
        type: "unit",
        profiles: [],
        selections: [makeModelWithBoltgun("Model 1"), makeModelWithBoltgun("Model 2"), makeModelWithBoltgun("Model 3")],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.rangedWeapons).toHaveLength(1);
      expect(result.rangedWeapons[0].profiles).toHaveLength(1);
      expect(result.rangedWeapons[0].profiles[0].name).toBe("Boltgun");
    });

    it("should deduplicate identical melee weapon profiles", () => {
      const makeModelWithCCW = (name) => ({
        name,
        type: "model",
        profiles: [
          {
            name: "Accursed weapon",
            typeName: "Melee Weapons",
            hidden: false,
            characteristics: [
              { name: "Range", $text: "Melee" },
              { name: "A", $text: "4" },
              { name: "WS", $text: "3+" },
              { name: "S", $text: "5" },
              { name: "AP", $text: "-2" },
              { name: "D", $text: "1" },
              { name: "Keywords", $text: "-" },
            ],
          },
        ],
        selections: [],
      });

      const selection = {
        name: "Chosen",
        type: "unit",
        profiles: [],
        selections: [makeModelWithCCW("Chosen 1"), makeModelWithCCW("Chosen 2")],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.meleeWeapons).toHaveLength(1);
      expect(result.meleeWeapons[0].profiles).toHaveLength(1);
      expect(result.meleeWeapons[0].profiles[0].name).toBe("Accursed weapon");
    });

    it("should preserve weapons with same name but different stats", () => {
      const selection = {
        name: "Unit",
        type: "unit",
        profiles: [],
        selections: [
          {
            name: "Model 1",
            type: "model",
            profiles: [
              {
                name: "Plasma gun - standard",
                typeName: "Ranged Weapons",
                hidden: false,
                characteristics: [
                  { name: "Range", $text: '24"' },
                  { name: "A", $text: "1" },
                  { name: "BS", $text: "3+" },
                  { name: "S", $text: "7" },
                  { name: "AP", $text: "-2" },
                  { name: "D", $text: "1" },
                  { name: "Keywords", $text: "Rapid Fire 1" },
                ],
              },
              {
                name: "Plasma gun - supercharge",
                typeName: "Ranged Weapons",
                hidden: false,
                characteristics: [
                  { name: "Range", $text: '24"' },
                  { name: "A", $text: "1" },
                  { name: "BS", $text: "3+" },
                  { name: "S", $text: "8" },
                  { name: "AP", $text: "-3" },
                  { name: "D", $text: "2" },
                  { name: "Keywords", $text: "Hazardous, Rapid Fire 1" },
                ],
              },
            ],
            selections: [],
          },
          {
            name: "Model 2",
            type: "model",
            profiles: [
              {
                name: "Plasma gun - standard",
                typeName: "Ranged Weapons",
                hidden: false,
                characteristics: [
                  { name: "Range", $text: '24"' },
                  { name: "A", $text: "1" },
                  { name: "BS", $text: "3+" },
                  { name: "S", $text: "7" },
                  { name: "AP", $text: "-2" },
                  { name: "D", $text: "1" },
                  { name: "Keywords", $text: "Rapid Fire 1" },
                ],
              },
              {
                name: "Plasma gun - supercharge",
                typeName: "Ranged Weapons",
                hidden: false,
                characteristics: [
                  { name: "Range", $text: '24"' },
                  { name: "A", $text: "1" },
                  { name: "BS", $text: "3+" },
                  { name: "S", $text: "8" },
                  { name: "AP", $text: "-3" },
                  { name: "D", $text: "2" },
                  { name: "Keywords", $text: "Hazardous, Rapid Fire 1" },
                ],
              },
            ],
            selections: [],
          },
        ],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.rangedWeapons[0].profiles).toHaveLength(2);
      expect(result.rangedWeapons[0].profiles[0].name).toBe("Plasma gun - standard");
      expect(result.rangedWeapons[0].profiles[1].name).toBe("Plasma gun - supercharge");
    });

    it("should deduplicate mixed duplicates across ranged and melee independently", () => {
      const makeModel = (name) => ({
        name,
        type: "model",
        profiles: [
          {
            name: "Boltgun",
            typeName: "Ranged Weapons",
            hidden: false,
            characteristics: [
              { name: "Range", $text: '24"' },
              { name: "A", $text: "2" },
              { name: "BS", $text: "3+" },
              { name: "S", $text: "4" },
              { name: "AP", $text: "0" },
              { name: "D", $text: "1" },
              { name: "Keywords", $text: "-" },
            ],
          },
          {
            name: "Close combat weapon",
            typeName: "Melee Weapons",
            hidden: false,
            characteristics: [
              { name: "Range", $text: "Melee" },
              { name: "A", $text: "3" },
              { name: "WS", $text: "3+" },
              { name: "S", $text: "4" },
              { name: "AP", $text: "0" },
              { name: "D", $text: "1" },
              { name: "Keywords", $text: "-" },
            ],
          },
        ],
        selections: [],
      });

      const selection = {
        name: "Squad",
        type: "unit",
        profiles: [],
        selections: [makeModel("Model 1"), makeModel("Model 2"), makeModel("Model 3"), makeModel("Model 4")],
      };

      const result = extractWeaponProfilesFromSelection(selection);
      expect(result.rangedWeapons).toHaveLength(1);
      expect(result.rangedWeapons[0].profiles).toHaveLength(1);
      expect(result.meleeWeapons).toHaveLength(1);
      expect(result.meleeWeapons[0].profiles).toHaveLength(1);
    });
  });

  // ============================================
  // extractAbilitiesFromSelection
  // ============================================
  describe("extractAbilitiesFromSelection", () => {
    // Mock core ability set (as would be built from datasource)
    const coreSet = new Set(["deep strike", "feel no pain 5+", "leader", "stealth", "deadly demise d3", 'scouts 6"']);

    it("should extract abilities from profiles", () => {
      const selection = {
        name: "Unit",
        profiles: [
          {
            name: "Lord of Badab (Aura)",
            typeName: "Abilities",
            hidden: false,
            characteristics: [{ name: "Description", $text: 'Add 1 to OC within 6"' }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.other).toHaveLength(1);
      expect(result.other[0].name).toBe("Lord of Badab (Aura)");
      expect(result.other[0].description).toBe('Add 1 to OC within 6"');
      expect(result.other[0].showAbility).toBe(true);
    });

    it("should parse invulnerable save from ability name", () => {
      const selection = {
        name: "Unit",
        profiles: [
          {
            name: "Invulnerable Save 4+",
            typeName: "Abilities",
            hidden: false,
            characteristics: [{ name: "Description", $text: "Invulnerable Save 4+" }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.invul.value).toBe("4+");
      expect(result.invul.showInvulnerableSave).toBe(true);
      expect(result.other).toHaveLength(0);
    });

    it("should classify rules as core when they appear in the core set", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [
          { name: "Deep Strike", description: "...", hidden: false },
          { name: "Feel No Pain 5+", description: "...", hidden: false },
          { name: "Leader", description: "...", hidden: false },
          { name: "Stealth", description: "...", hidden: false },
        ],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.core).toContain("Deep Strike");
      expect(result.core).toContain("Feel No Pain 5+");
      expect(result.core).toContain("Leader");
      expect(result.core).toContain("Stealth");
      expect(result.faction).toHaveLength(0);
    });

    it("should classify rules not in core set as faction", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [
          { name: "Dark Pacts", description: "...", hidden: false },
          { name: "Fights First", description: "...", hidden: false },
        ],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.faction).toContain("Dark Pacts");
      expect(result.faction).toContain("Fights First");
      expect(result.core).toHaveLength(0);
    });

    it("should classify all rules as faction when no core set provided", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [
          { name: "Deep Strike", description: "...", hidden: false },
          { name: "Dark Pacts", description: "...", hidden: false },
        ],
      };

      const result = extractAbilitiesFromSelection(selection);
      expect(result.faction).toContain("Deep Strike");
      expect(result.faction).toContain("Dark Pacts");
      expect(result.core).toHaveLength(0);
    });

    it("should skip hidden rules", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [{ name: "Deep Strike", description: "...", hidden: true }],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.core).toHaveLength(0);
    });

    it("should return default abilities structure when no data", () => {
      const selection = { name: "Unit", profiles: [], rules: [] };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.core).toEqual([]);
      expect(result.faction).toEqual([]);
      expect(result.other).toEqual([]);
      expect(result.wargear).toEqual([]);
      expect(result.special).toEqual([]);
      expect(result.primarch).toEqual([]);
      expect(result.invul.showInvulnerableSave).toBe(false);
      expect(result.damaged.showDamagedAbility).toBe(false);
    });

    it("should classify Deadly Demise variants as core when in core set", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [{ name: "Deadly Demise D3", description: "...", hidden: false }],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.core).toContain("Deadly Demise D3");
    });

    it("should classify Scouts variants as core when in core set", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [{ name: 'Scouts 6"', description: "...", hidden: false }],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.core).toContain('Scouts 6"');
    });

    it("should match core rules case-insensitively", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [{ name: "DEEP STRIKE", description: "...", hidden: false }],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.core).toContain("DEEP STRIKE");
    });

    it("should parse a damaged ability profile into the damaged field", () => {
      const selection = {
        name: "Cerastus Knight Lancer",
        profiles: [
          {
            typeName: "Abilities",
            name: "Damaged: 1-10 Wounds Remaining",
            hidden: false,
            characteristics: [
              { name: "Description", $text: "While this model has 1-10 wounds remaining, halve its Move." },
            ],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.damaged.showDamagedAbility).toBe(true);
      expect(result.damaged.showDescription).toBe(true);
      expect(result.damaged.range).toBe("1-10 Wounds Remaining");
      expect(result.damaged.description).toBe("While this model has 1-10 wounds remaining, halve its Move.");
    });

    it("should parse damaged ability with different wound range", () => {
      const selection = {
        name: "Dreadnought",
        profiles: [
          {
            typeName: "Abilities",
            name: "Damaged: 1-5 Wounds Remaining",
            hidden: false,
            characteristics: [{ name: "Description", $text: "Subtract 1 from hit rolls." }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.damaged.showDamagedAbility).toBe(true);
      expect(result.damaged.range).toBe("1-5 Wounds Remaining");
      expect(result.damaged.description).toBe("Subtract 1 from hit rolls.");
    });

    it("should exclude damaged ability from other[] when mixed with regular abilities", () => {
      const selection = {
        name: "Knight",
        profiles: [
          {
            typeName: "Abilities",
            name: "Ion Shield",
            hidden: false,
            characteristics: [{ name: "Description", $text: "This model has a 4+ invulnerable save." }],
          },
          {
            typeName: "Abilities",
            name: "Damaged: 1-10 Wounds Remaining",
            hidden: false,
            characteristics: [{ name: "Description", $text: "Halve its Move." }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.damaged.showDamagedAbility).toBe(true);
      expect(result.other).toHaveLength(1);
      expect(result.other[0].name).toBe("Ion Shield");
    });

    it("should handle damaged and invulnerable save on the same unit", () => {
      const selection = {
        name: "Knight",
        profiles: [
          {
            typeName: "Abilities",
            name: "Invulnerable Save 4+",
            hidden: false,
            characteristics: [],
          },
          {
            typeName: "Abilities",
            name: "Damaged: 1-10 Wounds Remaining",
            hidden: false,
            characteristics: [{ name: "Description", $text: "Halve its Move." }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.invul.showInvulnerableSave).toBe(true);
      expect(result.invul.value).toBe("4+");
      expect(result.damaged.showDamagedAbility).toBe(true);
      expect(result.damaged.range).toBe("1-10 Wounds Remaining");
    });

    it("should skip hidden damaged ability profiles", () => {
      const selection = {
        name: "Knight",
        profiles: [
          {
            typeName: "Abilities",
            name: "Damaged: 1-10 Wounds Remaining",
            hidden: true,
            characteristics: [{ name: "Description", $text: "Halve its Move." }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.damaged.showDamagedAbility).toBe(false);
      expect(result.other).toHaveLength(0);
    });

    it("should parse Leader ability with markdown dash format into leads", () => {
      const selection = {
        name: "Huron Blackheart",
        profiles: [
          {
            typeName: "Abilities",
            name: "Leader",
            hidden: false,
            characteristics: [
              {
                name: "Description",
                $text:
                  "This model can be attached to the following units:\n- ^^**Chosen^^**\u00a0\n- ^^**Legionaries^^**",
              },
            ],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.leads.units).toEqual([{ name: "Chosen" }, { name: "Legionaries" }]);
      expect(result.other).toHaveLength(0);
    });

    it("should parse Leader ability with square bullet format into leads", () => {
      const selection = {
        name: "Dark Apostle",
        profiles: [
          {
            typeName: "Abilities",
            name: "Leader",
            hidden: false,
            characteristics: [
              {
                name: "Description",
                $text:
                  "This model can be attached to the following units:\n■ ACCURSED CULTISTS\n■ CHOSEN\n■ LEGIONARIES",
              },
            ],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.leads.units).toEqual([{ name: "Accursed Cultists" }, { name: "Chosen" }, { name: "Legionaries" }]);
      expect(result.other).toHaveLength(0);
    });

    it("should exclude Leader from other[] when mixed with regular abilities", () => {
      const selection = {
        name: "Captain",
        profiles: [
          {
            typeName: "Abilities",
            name: "Leader",
            hidden: false,
            characteristics: [
              {
                name: "Description",
                $text: "This model can be attached to the following units:\n- ^^**Intercessors^^**",
              },
            ],
          },
          {
            typeName: "Abilities",
            name: "Rites of Battle",
            hidden: false,
            characteristics: [{ name: "Description", $text: "Some ability." }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.leads.units).toEqual([{ name: "Intercessors" }]);
      expect(result.other).toHaveLength(1);
      expect(result.other[0].name).toBe("Rites of Battle");
    });

    it("should skip hidden Leader ability profile", () => {
      const selection = {
        name: "Captain",
        profiles: [
          {
            typeName: "Abilities",
            name: "Leader",
            hidden: true,
            characteristics: [
              {
                name: "Description",
                $text: "This model can be attached to the following units:\n- ^^**Intercessors^^**",
              },
            ],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.leads.units).toEqual([]);
      expect(result.other).toHaveLength(0);
    });

    it("should return default leads when no Leader ability present", () => {
      const selection = { name: "Unit", profiles: [], rules: [] };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.leads).toEqual({ units: [], extra: "" });
    });

    it("should parse Attached Unit ability into special", () => {
      const selection = {
        name: "Masters of the Maelstrom",
        profiles: [
          {
            typeName: "Abilities",
            name: "Attached Unit",
            hidden: false,
            characteristics: [
              {
                name: "Description",
                $text:
                  "If a Character unit from your army with the Leader ability can be attached to a Legionaries unit, it can be attached to this unit instead.",
              },
            ],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.special).toHaveLength(1);
      expect(result.special[0]).toEqual({
        name: "Attached Unit",
        description:
          "If a Character unit from your army with the Leader ability can be attached to a Legionaries unit, it can be attached to this unit instead.",
        showAbility: true,
        showDescription: true,
      });
      expect(result.other).toHaveLength(0);
    });

    it("should exclude Attached Unit from other[] when mixed with regular abilities", () => {
      const selection = {
        name: "Unit",
        profiles: [
          {
            typeName: "Abilities",
            name: "Attached Unit",
            hidden: false,
            characteristics: [{ name: "Description", $text: "Some attached unit text." }],
          },
          {
            typeName: "Abilities",
            name: "Some Other Ability",
            hidden: false,
            characteristics: [{ name: "Description", $text: "Does something." }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.special).toHaveLength(1);
      expect(result.special[0].name).toBe("Attached Unit");
      expect(result.other).toHaveLength(1);
      expect(result.other[0].name).toBe("Some Other Ability");
    });

    it("should skip hidden Attached Unit ability profile", () => {
      const selection = {
        name: "Unit",
        profiles: [
          {
            typeName: "Abilities",
            name: "Attached Unit",
            hidden: true,
            characteristics: [{ name: "Description", $text: "Some attached unit text." }],
          },
        ],
        rules: [],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.special).toHaveLength(0);
      expect(result.other).toHaveLength(0);
    });

    it("should extract wargear abilities from upgrade sub-selections", () => {
      const selection = {
        name: "Legionaries",
        profiles: [],
        rules: [],
        selections: [
          {
            name: "Chaos icon",
            type: "upgrade",
            profiles: [
              {
                name: "Chaos icon",
                typeName: "Abilities",
                hidden: false,
                characteristics: [
                  {
                    name: "Description",
                    $text:
                      "Each time the bearer's unit takes a Leadership test for the Dark Pacts ability, you can re-roll that test.",
                  },
                ],
              },
            ],
            selections: [],
          },
        ],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.wargear).toHaveLength(1);
      expect(result.wargear[0]).toEqual({
        name: "Chaos icon",
        description:
          "Each time the bearer's unit takes a Leadership test for the Dark Pacts ability, you can re-roll that test.",
        showAbility: true,
        showDescription: true,
      });
      expect(result.other).toHaveLength(0);
    });

    it("should not extract abilities from non-upgrade sub-selections as wargear", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [],
        selections: [
          {
            name: "Model",
            type: "model",
            profiles: [
              {
                name: "Some Ability",
                typeName: "Abilities",
                hidden: false,
                characteristics: [{ name: "Description", $text: "Does something." }],
              },
            ],
            selections: [],
          },
        ],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.wargear).toHaveLength(0);
    });

    it("should skip hidden ability profiles in upgrade sub-selections", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [],
        selections: [
          {
            name: "Some Upgrade",
            type: "upgrade",
            profiles: [
              {
                name: "Hidden Ability",
                typeName: "Abilities",
                hidden: true,
                characteristics: [{ name: "Description", $text: "Hidden." }],
              },
            ],
            selections: [],
          },
        ],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.wargear).toHaveLength(0);
    });

    it("should collect wargear from nested upgrade sub-selections", () => {
      const selection = {
        name: "Unit",
        profiles: [],
        rules: [],
        selections: [
          {
            name: "Model",
            type: "model",
            profiles: [],
            selections: [
              {
                name: "Relic",
                type: "upgrade",
                profiles: [
                  {
                    name: "Ancient Relic",
                    typeName: "Abilities",
                    hidden: false,
                    characteristics: [{ name: "Description", $text: "Grants power." }],
                  },
                ],
                selections: [],
              },
            ],
          },
        ],
      };

      const result = extractAbilitiesFromSelection(selection, coreSet);
      expect(result.wargear).toHaveLength(1);
      expect(result.wargear[0].name).toBe("Ancient Relic");
    });
  });

  // ============================================
  // extractKeywordsFromSelection
  // ============================================
  describe("extractKeywordsFromSelection", () => {
    it("should extract faction keywords by stripping prefix", () => {
      const selection = {
        name: "Huron Blackheart",
        categories: [
          { id: "1", name: "Faction: Heretic Astartes", primary: false },
          { id: "2", name: "Infantry", primary: false },
          { id: "3", name: "Character", primary: false },
          { id: "4", name: "Epic Hero", primary: true },
        ],
      };

      const result = extractKeywordsFromSelection(selection);
      expect(result.factions).toContain("Heretic Astartes");
      expect(result.keywords).toContain("Infantry");
      expect(result.keywords).toContain("Character");
    });

    it("should place primary category first in keywords", () => {
      const selection = {
        name: "Unit",
        categories: [
          { id: "1", name: "Battleline", primary: true },
          { id: "2", name: "Infantry", primary: false },
        ],
      };

      const result = extractKeywordsFromSelection(selection);
      expect(result.keywords).toContain("Battleline");
      expect(result.keywords[0]).toBe("Battleline");
      expect(result.keywords).toContain("Infantry");
    });

    it("should skip Warlord but include Epic Hero as keyword", () => {
      const selection = {
        name: "Unit",
        categories: [
          { id: "1", name: "Character", primary: true },
          { id: "2", name: "Warlord", primary: false },
          { id: "3", name: "Epic Hero", primary: false },
          { id: "4", name: "Infantry", primary: false },
        ],
      };

      const result = extractKeywordsFromSelection(selection);
      expect(result.keywords).not.toContain("Warlord");
      expect(result.keywords).toContain("Epic Hero");
      expect(result.keywords[0]).toBe("Character");
      expect(result.keywords).toContain("Infantry");
    });

    it("should include category matching unit name as a keyword", () => {
      const selection = {
        name: "Huron Blackheart",
        categories: [
          { id: "1", name: "Character", primary: true },
          { id: "2", name: "Huron Blackheart", primary: false },
          { id: "3", name: "Infantry", primary: false },
        ],
      };

      const result = extractKeywordsFromSelection(selection);
      expect(result.keywords).toContain("Huron Blackheart");
      expect(result.keywords[0]).toBe("Character");
      expect(result.keywords).toContain("Infantry");
    });

    it("should return empty arrays for no categories", () => {
      const result = extractKeywordsFromSelection({ name: "Unit" });
      expect(result.keywords).toEqual([]);
      expect(result.factions).toEqual([]);
    });
  });

  // ============================================
  // buildCardFromSelection
  // ============================================
  describe("buildCardFromSelection", () => {
    const buildCoreSet = new Set(["deep strike"]);

    const createFullSelection = () => ({
      name: "Test Unit",
      type: "model",
      profiles: [
        {
          name: "Test Unit",
          typeName: "Unit",
          hidden: false,
          characteristics: [
            { name: "M", $text: '6"' },
            { name: "T", $text: "4" },
            { name: "SV", $text: "3+" },
            { name: "W", $text: "2" },
            { name: "LD", $text: "6+" },
            { name: "OC", $text: "1" },
          ],
        },
        {
          name: "Test Ability",
          typeName: "Abilities",
          hidden: false,
          characteristics: [{ name: "Description", $text: "Does something cool" }],
        },
      ],
      rules: [{ name: "Deep Strike", description: "...", hidden: false }],
      categories: [
        { id: "1", name: "Battleline", primary: true },
        { id: "2", name: "Infantry", primary: false },
        { id: "3", name: "Faction: Space Marines", primary: false },
      ],
      selections: [
        {
          name: "Bolt rifle",
          type: "upgrade",
          profiles: [
            {
              name: "Bolt rifle",
              typeName: "Ranged Weapons",
              hidden: false,
              characteristics: [
                { name: "Range", $text: '24"' },
                { name: "A", $text: "2" },
                { name: "BS", $text: "3+" },
                { name: "S", $text: "4" },
                { name: "AP", $text: "-1" },
                { name: "D", $text: "1" },
                { name: "Keywords", $text: "Assault" },
              ],
            },
          ],
          selections: [],
        },
      ],
    });

    it("should build a complete card with all required fields", () => {
      const selection = createFullSelection();
      const unitData = { points: 160, models: 10 };

      const card = buildCardFromSelection(selection, unitData, buildCoreSet);

      expect(card.name).toBe("Test Unit");
      expect(card.cardType).toBe("DataCard");
      expect(card.source).toBe("40k-10e");
      expect(card.isCustom).toBe(true);
      expect(card._directRead).toBe(true);
      expect(card.uuid).toBeTruthy();
      expect(card.id).toBeTruthy();
    });

    it("should include stats from selection", () => {
      const selection = createFullSelection();
      const card = buildCardFromSelection(selection, { points: 100, models: 1 }, buildCoreSet);

      expect(card.stats).toHaveLength(1);
      expect(card.stats[0].m).toBe('6"');
    });

    it("should include weapons from selection", () => {
      const selection = createFullSelection();
      const card = buildCardFromSelection(selection, { points: 100, models: 1 }, buildCoreSet);

      expect(card.rangedWeapons).toHaveLength(1);
      expect(card.rangedWeapons[0].profiles[0].name).toBe("Bolt rifle");
      expect(card.showWeapons.rangedWeapons).toBe(true);
    });

    it("should include abilities from selection", () => {
      const selection = createFullSelection();
      const card = buildCardFromSelection(selection, { points: 100, models: 1 }, buildCoreSet);

      expect(card.abilities.other).toHaveLength(1);
      expect(card.abilities.other[0].name).toBe("Test Ability");
      expect(card.abilities.core).toContain("Deep Strike");
    });

    it("should include keywords from selection", () => {
      const selection = createFullSelection();
      const card = buildCardFromSelection(selection, { points: 100, models: 1 }, buildCoreSet);

      expect(card.keywords).toContain("Infantry");
      expect(card.factions).toContain("Space Marines");
    });

    it("should include points data", () => {
      const selection = createFullSelection();
      const card = buildCardFromSelection(selection, { points: 160, models: 10 }, buildCoreSet);

      expect(card.points).toHaveLength(1);
      expect(card.points[0].cost).toBe(160);
      expect(card.points[0].models).toBe(10);
      expect(card.points[0].active).toBe(true);
      expect(card.points[0].primary).toBe(true);
    });

    it("should set showWeapons to false when no weapons of that type", () => {
      const selection = {
        name: "Melee only",
        type: "model",
        profiles: [],
        rules: [],
        categories: [],
        selections: [
          {
            name: "Power fist",
            type: "upgrade",
            profiles: [
              {
                name: "Power fist",
                typeName: "Melee Weapons",
                hidden: false,
                characteristics: [
                  { name: "Range", $text: "Melee" },
                  { name: "A", $text: "3" },
                  { name: "WS", $text: "3+" },
                  { name: "S", $text: "8" },
                  { name: "AP", $text: "-2" },
                  { name: "D", $text: "2" },
                  { name: "Keywords", $text: "-" },
                ],
              },
            ],
            selections: [],
          },
        ],
      };

      const card = buildCardFromSelection(selection, { points: 50, models: 1 }, buildCoreSet);
      expect(card.showWeapons.rangedWeapons).toBe(false);
      expect(card.showWeapons.meleeWeapons).toBe(true);
    });

    it("should place leads at card level and exclude it from abilities", () => {
      const selection = {
        name: "Captain",
        type: "model",
        profiles: [
          {
            name: "Captain",
            typeName: "Unit",
            hidden: false,
            characteristics: [
              { name: "M", $text: '6"' },
              { name: "T", $text: "4" },
              { name: "SV", $text: "3+" },
              { name: "W", $text: "5" },
              { name: "LD", $text: "6+" },
              { name: "OC", $text: "1" },
            ],
          },
          {
            name: "Leader",
            typeName: "Abilities",
            hidden: false,
            characteristics: [
              {
                name: "Description",
                $text: "This model can be attached to the following units:\n- ^^**Intercessors^^**",
              },
            ],
          },
        ],
        rules: [],
        categories: [],
        selections: [],
      };

      const card = buildCardFromSelection(selection, { points: 80, models: 1 }, buildCoreSet);
      expect(card.leads.units).toEqual([{ name: "Intercessors" }]);
      expect(card.abilities.leads).toBeUndefined();
      expect(card.abilities.other).toHaveLength(0);
    });

    it("should omit leads from card when unit has no Leader ability", () => {
      const selection = createFullSelection();
      const card = buildCardFromSelection(selection, { points: 100, models: 1 }, buildCoreSet);
      expect(card.leads).toBeUndefined();
    });
  });

  // ============================================
  // _selection preserved on extractUnitsFromSelections
  // ============================================
  describe("extractUnitsFromSelections _selection", () => {
    it("should carry raw selection reference on each unit", () => {
      const selection = createUnitSelection("Test Unit", 100, {
        categories: [{ id: "1", name: "Battleline", primary: true }],
      });

      const units = extractUnitsFromSelections([selection]);
      expect(units).toHaveLength(1);
      expect(units[0]._selection).toBe(selection);
      expect(units[0]._selection.name).toBe("Test Unit");
    });

    it("should preserve _selection for each unit independently", () => {
      const sel1 = createUnitSelection("Unit A", 100, {
        categories: [{ id: "1", name: "Battleline", primary: true }],
      });
      const sel2 = createUnitSelection("Unit B", 200, {
        categories: [{ id: "2", name: "Character", primary: true }],
      });

      const units = extractUnitsFromSelections([sel1, sel2]);
      expect(units[0]._selection.name).toBe("Unit A");
      expect(units[1]._selection.name).toBe("Unit B");
    });
  });

  // ============================================
  // buildCoreAbilitySet
  // ============================================
  describe("buildCoreAbilitySet", () => {
    it("should collect core ability names from datasource factions", () => {
      const factions = [
        {
          id: "f1",
          name: "Space Marines",
          datasheets: [
            { name: "Intercessors", abilities: { core: ["Deep Strike", "Leader"] } },
            { name: "Scouts", abilities: { core: ['Scouts 6"', "Infiltrators"] } },
          ],
        },
        {
          id: "f2",
          name: "Imperial Knights",
          datasheets: [{ name: "Knight Lancer", abilities: { core: ["Deadly Demise D6+2"] } }],
        },
      ];

      const set = buildCoreAbilitySet(factions);
      expect(set.has("deep strike")).toBe(true);
      expect(set.has("leader")).toBe(true);
      expect(set.has('scouts 6"')).toBe(true);
      expect(set.has("infiltrators")).toBe(true);
      expect(set.has("deadly demise d6+2")).toBe(true);
    });

    it("should return empty set for null/undefined input", () => {
      expect(buildCoreAbilitySet(null).size).toBe(0);
      expect(buildCoreAbilitySet(undefined).size).toBe(0);
    });

    it("should handle factions without datasheets", () => {
      const factions = [{ id: "f1", name: "Empty" }];
      expect(buildCoreAbilitySet(factions).size).toBe(0);
    });

    it("should handle datasheets without abilities.core", () => {
      const factions = [
        {
          id: "f1",
          name: "Faction",
          datasheets: [{ name: "Unit", abilities: { other: [] } }],
        },
      ];
      expect(buildCoreAbilitySet(factions).size).toBe(0);
    });

    it("should deduplicate across factions", () => {
      const factions = [
        { id: "f1", datasheets: [{ abilities: { core: ["Deep Strike"] } }] },
        { id: "f2", datasheets: [{ abilities: { core: ["Deep Strike", "Stealth"] } }] },
      ];
      const set = buildCoreAbilitySet(factions);
      expect(set.size).toBe(2);
    });
  });
});
