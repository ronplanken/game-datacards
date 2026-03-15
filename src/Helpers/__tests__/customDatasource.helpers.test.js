import { describe, it, expect } from "vitest";
import {
  VALID_DISPLAY_FORMATS,
  validateCustomDatasource,
  generateDatasourceFilename,
  generateIdFromName,
  getTargetArray,
  mapCardsToFactionStructure,
  extractCardsFromFaction,
  createDatasourceExport,
  countDatasourceCards,
  createRegistryEntry,
  compareVersions,
  countCardsByType,
  formatCardBreakdown,
  exportDatasourceSchema,
  downloadJsonFile,
} from "../customDatasource.helpers";

// Helper to create a minimal valid datasource
const createValidDatasource = (overrides = {}) => ({
  name: "Test Datasource",
  version: "1.0.0",
  data: [
    {
      id: "faction-1",
      name: "Test Faction",
      colours: { header: "#000000", banner: "#111111" },
    },
  ],
  ...overrides,
});

describe("VALID_DISPLAY_FORMATS", () => {
  it("includes custom format", () => {
    expect(VALID_DISPLAY_FORMATS).toContain("custom");
  });

  it("includes all expected formats", () => {
    expect(VALID_DISPLAY_FORMATS).toEqual(["40k-10e", "40k", "basic", "necromunda", "aos", "custom"]);
  });
});

describe("validateCustomDatasource", () => {
  it("returns valid for a minimal valid datasource", () => {
    const result = validateCustomDatasource(createValidDatasource());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns invalid for null data", () => {
    const result = validateCustomDatasource(null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid data: datasource is empty or undefined");
  });

  it("returns invalid for undefined data", () => {
    const result = validateCustomDatasource(undefined);
    expect(result.isValid).toBe(false);
  });

  it("returns invalid when name is missing", () => {
    const result = validateCustomDatasource(createValidDatasource({ name: undefined }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Missing or invalid 'name' field");
  });

  it("returns invalid when name is empty string", () => {
    const result = validateCustomDatasource(createValidDatasource({ name: "" }));
    expect(result.isValid).toBe(false);
  });

  it("returns invalid when name exceeds max length", () => {
    const result = validateCustomDatasource(createValidDatasource({ name: "a".repeat(201) }));
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("maximum length");
  });

  it("returns invalid when version is missing", () => {
    const result = validateCustomDatasource(createValidDatasource({ version: undefined }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Missing or invalid 'version' field");
  });

  it("returns invalid when version exceeds max length", () => {
    const result = validateCustomDatasource(createValidDatasource({ version: "v".repeat(51) }));
    expect(result.isValid).toBe(false);
  });

  it("returns invalid when data array is missing", () => {
    const result = validateCustomDatasource(createValidDatasource({ data: undefined }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Missing or invalid 'data' array");
  });

  it("returns invalid when data array is empty", () => {
    const result = validateCustomDatasource(createValidDatasource({ data: [] }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("'data' array must contain at least one faction");
  });

  it("returns invalid when too many factions", () => {
    const factions = Array.from({ length: 11 }, (_, i) => ({
      id: `f-${i}`,
      name: `Faction ${i}`,
      colours: { header: "#000", banner: "#111" },
    }));
    const result = validateCustomDatasource(createValidDatasource({ data: factions }));
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("Too many factions");
  });

  it("returns invalid when faction missing id", () => {
    const result = validateCustomDatasource(
      createValidDatasource({
        data: [{ name: "F", colours: { header: "#000", banner: "#111" } }],
      }),
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Faction missing 'id' field");
  });

  it("returns invalid when faction missing colours", () => {
    const result = validateCustomDatasource(
      createValidDatasource({
        data: [{ id: "f-1", name: "F" }],
      }),
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Faction missing 'colours' field");
  });

  it("returns invalid when faction colours missing header", () => {
    const result = validateCustomDatasource(
      createValidDatasource({
        data: [{ id: "f-1", name: "F", colours: { banner: "#111" } }],
      }),
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Faction colours missing 'header' field");
  });

  // Schema validation integration
  it("passes when schema is not present", () => {
    const result = validateCustomDatasource(createValidDatasource());
    expect(result.isValid).toBe(true);
  });

  it("passes when valid schema is provided", () => {
    const result = validateCustomDatasource(
      createValidDatasource({
        schema: {
          version: "1.0.0",
          baseSystem: "blank",
          cardTypes: [],
        },
      }),
    );
    expect(result.isValid).toBe(true);
  });

  it("returns invalid when schema is not an object", () => {
    const result = validateCustomDatasource(createValidDatasource({ schema: "bad" }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("'schema' must be an object when provided");
  });

  it("returns invalid when schema is null (explicitly set)", () => {
    const result = validateCustomDatasource(createValidDatasource({ schema: null }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("'schema' must be an object when provided");
  });

  it("returns schema validation errors when schema is invalid", () => {
    const result = validateCustomDatasource(
      createValidDatasource({
        schema: {
          version: "1.0.0",
          baseSystem: "invalid-system",
          cardTypes: [],
        },
      }),
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.startsWith("schema:"))).toBe(true);
  });

  it("validates schema with valid card types", () => {
    const result = validateCustomDatasource(
      createValidDatasource({
        schema: {
          version: "1.0.0",
          baseSystem: "40k-10e",
          cardTypes: [
            {
              key: "infantry",
              label: "Infantry",
              baseType: "unit",
              schema: {
                stats: { label: "Stats", allowMultipleProfiles: false, fields: [] },
                weaponTypes: { label: "Weapons", allowMultiple: true, types: [] },
                abilities: {
                  label: "Abilities",
                  categories: [],
                  hasInvulnerableSave: false,
                  hasDamagedAbility: false,
                },
                metadata: {
                  hasKeywords: true,
                  hasFactionKeywords: true,
                  hasPoints: true,
                  pointsFormat: "per-model",
                },
              },
            },
          ],
        },
      }),
    );
    expect(result.isValid).toBe(true);
  });
});

describe("generateDatasourceFilename", () => {
  it("generates filename from name", () => {
    expect(generateDatasourceFilename("My Game")).toBe("my-game-datasource.json");
  });

  it("returns default for empty name", () => {
    expect(generateDatasourceFilename("")).toBe("untitled-datasource.json");
  });

  it("returns default for null", () => {
    expect(generateDatasourceFilename(null)).toBe("untitled-datasource.json");
  });

  it("strips special characters", () => {
    expect(generateDatasourceFilename("Game!@#$%")).toBe("game-datasource.json");
  });
});

describe("generateIdFromName", () => {
  it("generates slug from name", () => {
    expect(generateIdFromName("My Custom Game")).toBe("my-custom-game");
  });

  it("returns untitled for falsy input", () => {
    expect(generateIdFromName("")).toBe("untitled");
    expect(generateIdFromName(null)).toBe("untitled");
  });
});

describe("getTargetArray", () => {
  it("maps known card types", () => {
    expect(getTargetArray("DataCard")).toBe("datasheets");
    expect(getTargetArray("stratagem")).toBe("stratagems");
    expect(getTargetArray("enhancement")).toBe("enhancements");
    expect(getTargetArray("rule")).toBe("rules");
  });

  it("defaults to datasheets for unknown types", () => {
    expect(getTargetArray("unknown-type")).toBe("datasheets");
  });
});

describe("mapCardsToFactionStructure", () => {
  it("groups cards by type into faction", () => {
    const cards = [
      { id: "1", name: "Unit A", cardType: "DataCard" },
      { id: "2", name: "Strat B", cardType: "stratagem" },
    ];
    const factionInfo = { id: "f1", name: "Faction", colours: { header: "#000", banner: "#111" } };

    const result = mapCardsToFactionStructure(cards, factionInfo);
    expect(result.id).toBe("f1");
    expect(result.datasheets).toHaveLength(1);
    expect(result.stratagems).toHaveLength(1);
  });

  it("removes uuid and isCustom from exported cards", () => {
    const cards = [{ id: "1", name: "Unit", cardType: "DataCard", uuid: "u1", isCustom: true }];
    const factionInfo = { id: "f1", name: "F", colours: { header: "#000", banner: "#111" } };

    const result = mapCardsToFactionStructure(cards, factionInfo);
    expect(result.datasheets[0].uuid).toBeUndefined();
    expect(result.datasheets[0].isCustom).toBeUndefined();
  });
});

describe("extractCardsFromFaction", () => {
  it("extracts cards from typed arrays", () => {
    const faction = {
      id: "f1",
      datasheets: [{ id: "1", name: "Unit" }],
      stratagems: [{ id: "2", name: "Strat" }],
    };

    const cards = extractCardsFromFaction(faction);
    expect(cards).toHaveLength(2);
    expect(cards.every((c) => c.isCustom)).toBe(true);
    expect(cards.every((c) => c.uuid)).toBe(true);
  });

  it("returns empty array for null faction", () => {
    expect(extractCardsFromFaction(null)).toEqual([]);
  });

  it("handles backwards-compatible cards array", () => {
    const faction = { cards: [{ id: "1", name: "Card" }] };
    const result = extractCardsFromFaction(faction);
    expect(result).toHaveLength(1);
  });
});

describe("countDatasourceCards", () => {
  it("counts cards across factions", () => {
    const datasource = {
      data: [{ datasheets: [{ id: "1" }, { id: "2" }], stratagems: [{ id: "3" }] }, { datasheets: [{ id: "4" }] }],
    };
    expect(countDatasourceCards(datasource)).toBe(4);
  });

  it("returns 0 for empty datasource", () => {
    expect(countDatasourceCards({ data: [] })).toBe(0);
  });
});

describe("createRegistryEntry", () => {
  it("creates entry with correct fields", () => {
    const datasource = {
      id: "custom-123",
      name: "My DS",
      version: "2.0.0",
      author: "Author",
      sourceType: "local",
      sourceUrl: null,
      lastUpdated: "2026-01-01T00:00:00.000Z",
      data: [{ datasheets: [{ id: "1" }] }],
    };

    const entry = createRegistryEntry(datasource);
    expect(entry.id).toBe("custom-123");
    expect(entry.name).toBe("My DS");
    expect(entry.cardCount).toBe(1);
    expect(entry.sourceType).toBe("local");
    expect(entry.version).toBe("2.0.0");
    expect(entry.author).toBe("Author");
  });

  it("defaults author to null", () => {
    const datasource = {
      id: "x",
      name: "N",
      version: "1.0.0",
      sourceType: "local",
      data: [],
    };
    expect(createRegistryEntry(datasource).author).toBeNull();
  });
});

describe("compareVersions", () => {
  it("returns 0 for equal versions", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
  });

  it("returns -1 when first is lower", () => {
    expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
    expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
  });

  it("returns 1 when first is higher", () => {
    expect(compareVersions("1.1.0", "1.0.0")).toBe(1);
    expect(compareVersions("2.0.0", "1.9.9")).toBe(1);
  });
});

describe("countCardsByType", () => {
  it("counts cards grouped by type", () => {
    const cards = [{ cardType: "DataCard" }, { cardType: "DataCard" }, { cardType: "stratagem" }];
    const result = countCardsByType(cards);
    expect(result.total).toBe(3);
    expect(result.counts.DataCard).toBe(2);
    expect(result.counts.stratagem).toBe(1);
  });

  it("uses unknown for cards without cardType", () => {
    const result = countCardsByType([{}]);
    expect(result.counts.unknown).toBe(1);
  });
});

describe("formatCardBreakdown", () => {
  it("formats counts as readable string", () => {
    expect(formatCardBreakdown({ DataCard: 3, stratagem: 1 })).toBe("3 datasheets, 1 stratagem");
  });

  it("pluralizes correctly", () => {
    expect(formatCardBreakdown({ stratagem: 2 })).toBe("2 stratagems");
  });
});

describe("createDatasourceExport", () => {
  it("creates a complete export object", () => {
    const result = createDatasourceExport({
      name: "Export Test",
      version: "1.0.0",
      author: "Author",
      cards: [{ id: "1", cardType: "DataCard", name: "Unit" }],
      factionName: "Faction A",
      colours: { header: "#000", banner: "#111" },
    });

    expect(result.name).toBe("Export Test");
    expect(result.version).toBe("1.0.0");
    expect(result.author).toBe("Author");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].datasheets).toHaveLength(1);
    expect(result.lastUpdated).toBeDefined();
  });

  it("omits author when not provided", () => {
    const result = createDatasourceExport({
      name: "No Author",
      version: "1.0.0",
      cards: [],
      factionName: "F",
      colours: { header: "#000", banner: "#111" },
    });
    expect(result.author).toBeUndefined();
  });
});

describe("exportDatasourceSchema", () => {
  it("returns null for null input", () => {
    expect(exportDatasourceSchema(null)).toBeNull();
  });

  it("exports name, version, and lastUpdated", () => {
    const ds = { name: "Test", version: "1.0.0" };
    const result = exportDatasourceSchema(ds);
    expect(result.name).toBe("Test");
    expect(result.version).toBe("1.0.0");
    expect(result.lastUpdated).toBeDefined();
  });

  it("includes author when present", () => {
    const ds = { name: "Test", version: "1.0.0", author: "Author" };
    const result = exportDatasourceSchema(ds);
    expect(result.author).toBe("Author");
  });

  it("omits author when not present", () => {
    const ds = { name: "Test", version: "1.0.0" };
    const result = exportDatasourceSchema(ds);
    expect(result.author).toBeUndefined();
  });

  it("includes schema when present", () => {
    const schema = { baseSystem: "40k-10e", cardTypes: [{ key: "unit", baseType: "unit" }] };
    const ds = { name: "Test", version: "1.0.0", schema };
    const result = exportDatasourceSchema(ds);
    expect(result.schema).toEqual(schema);
  });

  it("includes faction colours stripped of card data", () => {
    const ds = {
      name: "Test",
      version: "1.0.0",
      data: [
        {
          id: "f1",
          name: "Faction 1",
          colours: { header: "#000", banner: "#111" },
          datasheets: [{ id: "card1", name: "Unit" }],
        },
      ],
    };
    const result = exportDatasourceSchema(ds);
    expect(result.factions).toHaveLength(1);
    expect(result.factions[0].id).toBe("f1");
    expect(result.factions[0].name).toBe("Faction 1");
    expect(result.factions[0].colours).toEqual({ header: "#000", banner: "#111" });
    expect(result.factions[0].datasheets).toBeUndefined();
  });

  it("strips internal storage fields like id, sourceType, sourceUrl", () => {
    const ds = {
      id: "custom-123",
      name: "Test",
      version: "1.0.0",
      sourceType: "local",
      sourceUrl: null,
    };
    const result = exportDatasourceSchema(ds);
    expect(result.id).toBeUndefined();
    expect(result.sourceType).toBeUndefined();
    expect(result.sourceUrl).toBeUndefined();
  });
});

describe("downloadJsonFile", () => {
  it("creates a link, clicks it, and cleans up", () => {
    const mockLink = { href: "", download: "", click: vi.fn() };
    const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockLink);
    const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
    const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => {});

    // URL.createObjectURL/revokeObjectURL may not exist in jsdom
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn().mockReturnValue("blob:test");
    URL.revokeObjectURL = vi.fn();

    downloadJsonFile({ foo: "bar" }, "test.json");

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockLink.href).toBe("blob:test");
    expect(mockLink.download).toBe("test.json");
    expect(mockLink.click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });
});
