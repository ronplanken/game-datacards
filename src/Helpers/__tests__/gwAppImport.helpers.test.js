import { describe, it, expect, vi, beforeEach } from "vitest";
import { matchEnhancementsToFaction, buildCardsFromUnits } from "../gwAppImport.helpers";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid"),
}));

// ============================================
// matchEnhancementsToFaction
// ============================================
describe("matchEnhancementsToFaction", () => {
  const baseFaction = {
    enhancements: [
      { name: "Artisan of War", cost: 25, detachment: "Gladius Task Force" },
      { name: "Fire Discipline", cost: 20, detachment: "Gladius Task Force" },
      { name: "Rites of Battle", cost: 10, detachment: "Anvil Siege Force" },
    ],
  };

  it("returns units unchanged when faction has no enhancements", () => {
    const units = [{ originalName: "Captain", enhancement: { name: "Artisan of War", cost: 25 } }];
    const result = matchEnhancementsToFaction(units, { enhancements: [] }, "Gladius Task Force");
    expect(result).toEqual(units);
  });

  it("returns units unchanged when no units have enhancements", () => {
    const units = [{ originalName: "Captain", enhancement: null }];
    const result = matchEnhancementsToFaction(units, baseFaction, "Gladius Task Force");
    expect(result[0].enhancement).toBeNull();
  });

  it("matches enhancement by exact name and detachment", () => {
    const units = [{ originalName: "Captain", enhancement: { name: "Artisan of War", cost: 25 } }];
    const result = matchEnhancementsToFaction(units, baseFaction, "Gladius Task Force");
    expect(result[0].enhancement.matched).toBe(true);
    expect(result[0].detachment).toBe("Gladius Task Force");
  });

  it("falls back to name-only match when detachment does not match", () => {
    const units = [{ originalName: "Captain", enhancement: { name: "Rites of Battle", cost: 10 } }];
    const result = matchEnhancementsToFaction(units, baseFaction, "Gladius Task Force");
    expect(result[0].enhancement.matched).toBe(true);
    expect(result[0].detachment).toBe("Anvil Siege Force");
  });

  it("uses fuzzy match for close enhancement names", () => {
    const units = [{ originalName: "Captain", enhancement: { name: "Artisan of Wars", cost: 25 } }];
    const result = matchEnhancementsToFaction(units, baseFaction, null);
    expect(result[0].enhancement.matched).toBe(true);
  });

  it("preserves original cost when enhancement has a cost", () => {
    const units = [{ originalName: "Captain", enhancement: { name: "Artisan of War", cost: 30 } }];
    const result = matchEnhancementsToFaction(units, baseFaction, null);
    expect(result[0].enhancement.cost).toBe(30);
  });
});

// ============================================
// buildCardsFromUnits
// ============================================
describe("buildCardsFromUnits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createUnit = (overrides = {}) => ({
    originalName: "Captain",
    points: 120,
    models: 1,
    isWarlord: false,
    enhancement: null,
    weapons: [],
    matchedCard: {
      id: "card-1",
      name: "Captain",
      unitSize: { cost: 100, models: 1 },
      rangedWeapons: [],
      meleeWeapons: [],
      showWeapons: { rangedWeapons: true, meleeWeapons: true },
    },
    ...overrides,
  });

  it("assigns a uuid and isCustom flag", () => {
    const result = buildCardsFromUnits([createUnit()]);
    expect(result[0].uuid).toBe("mock-uuid");
    expect(result[0].isCustom).toBe(true);
  });

  it("calculates unitSize correctly subtracting enhancement cost", () => {
    const result = buildCardsFromUnits([createUnit({ enhancement: { name: "Artisan", cost: 25 } })]);
    expect(result[0].unitSize.cost).toBe(95); // 120 - 25
    expect(result[0].unitSize.models).toBe(1);
  });

  it("sets unitSize models from unit models field", () => {
    const result = buildCardsFromUnits([createUnit({ models: 5 })]);
    expect(result[0].unitSize.models).toBe(5);
  });

  it("marks warlord on card", () => {
    const result = buildCardsFromUnits([createUnit({ isWarlord: true })]);
    expect(result[0].isWarlord).toBe(true);
  });

  it("does not set isWarlord when unit is not warlord", () => {
    const result = buildCardsFromUnits([createUnit({ isWarlord: false })]);
    expect(result[0].isWarlord).toBeUndefined();
  });

  it("sets selectedEnhancement on card", () => {
    const result = buildCardsFromUnits([
      createUnit({ enhancement: { name: "Artisan of War", cost: 25, matched: true, detachment: "Gladius" } }),
    ]);
    expect(result[0].selectedEnhancement.name).toBe("Artisan of War");
    expect(result[0].selectedEnhancement.cost).toBe(25);
  });

  it("skips weapon filtering for _directRead cards", () => {
    const card = {
      id: "card-1",
      name: "Captain",
      _directRead: true,
      rangedWeapons: [{ profiles: [{ name: "Storm bolter", active: true }] }],
      meleeWeapons: [],
      showWeapons: { rangedWeapons: true, meleeWeapons: true },
    };
    const result = buildCardsFromUnits([createUnit({ matchedCard: card, weapons: ["Power sword"] })]);
    // Should not filter weapons because _directRead is true
    expect(result[0].rangedWeapons[0].profiles[0].active).toBe(true);
  });

  it("filters weapons when not _directRead", () => {
    const card = {
      id: "card-1",
      name: "Captain",
      rangedWeapons: [
        {
          profiles: [
            { name: "Storm bolter", active: true },
            { name: "Plasma gun", active: true },
          ],
        },
      ],
      meleeWeapons: [],
      showWeapons: { rangedWeapons: true, meleeWeapons: true },
    };
    const result = buildCardsFromUnits([createUnit({ matchedCard: card, weapons: ["Storm bolter"] })]);
    expect(result[0].rangedWeapons[0].profiles[0].active).toBe(true);
    expect(result[0].rangedWeapons[0].profiles[1].active).toBe(false);
  });
});
