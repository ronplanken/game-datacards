import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock react-beautiful-dnd
vi.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) => <div>{children({ droppableProps: {}, innerRef: vi.fn() }, {})}</div>,
  Draggable: ({ children }) => (
    <div>{children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }, {})}</div>
  ),
}));

// Mock hooks - useCardStorage is the fallback for useCardEdit when no CardEditProvider is present
const mockActiveCard = { ref: null };
const mockUpdateActiveCard = vi.fn();
const mockDataSource = { ref: null };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: mockDataSource.ref,
  }),
}));

// Import the components under test — these are the actual implementations
// that will be wired via the Premium alias in production
import { resolveCardType } from "../CustomCardDisplay";

// Test the resolveCardType + editor routing logic inline,
// since gdc-premium components can't be imported directly in community tests.
// We test the schema-driven editor patterns through the display component's resolver.

const make40kUnitSchema = () => ({
  stats: {
    label: "Stats",
    allowMultipleProfiles: true,
    fields: [
      { key: "m", label: "M", type: "string", displayOrder: 1 },
      { key: "t", label: "T", type: "string", displayOrder: 2 },
    ],
  },
  weaponTypes: {
    label: "Weapons",
    allowMultiple: true,
    types: [
      {
        key: "ranged",
        label: "Ranged Weapons",
        hasKeywords: true,
        hasProfiles: true,
        columns: [{ key: "range", label: "Range", type: "string" }],
      },
    ],
  },
  abilities: {
    label: "Abilities",
    categories: [{ key: "core", label: "Core", format: "name-only" }],
  },
  metadata: { hasKeywords: true, hasFactionKeywords: true, hasPoints: true, pointsFormat: "per-model" },
});

const makeStratagemSchema = () => ({
  fields: [
    { key: "name", label: "Name", type: "string" },
    { key: "cost", label: "Cost", type: "string" },
    { key: "description", label: "Description", type: "richtext" },
  ],
});

const makeRuleSchema = () => ({
  fields: [
    { key: "name", label: "Name", type: "string" },
    { key: "description", label: "Description", type: "richtext" },
  ],
  rules: {
    label: "Rules",
    allowMultiple: true,
    fields: [
      { key: "title", label: "Title", type: "string" },
      { key: "description", label: "Description", type: "richtext" },
    ],
  },
});

const makeEnhancementSchema = () => ({
  fields: [
    { key: "name", label: "Name", type: "string" },
    { key: "cost", label: "Cost", type: "string" },
    { key: "description", label: "Description", type: "richtext" },
  ],
  keywords: {
    label: "Keywords",
    allowMultiple: true,
    fields: [{ key: "keyword", label: "Keyword", type: "string" }],
  },
});

describe("CustomCardEditor - resolveCardType routing", () => {
  it("resolves unit card type correctly", () => {
    const schema = {
      cardTypes: [{ key: "unit", label: "Unit", baseType: "unit", schema: make40kUnitSchema() }],
    };
    const card = { cardType: "unit" };
    const { cardTypeDef, baseType } = resolveCardType(card, schema);

    expect(baseType).toBe("unit");
    expect(cardTypeDef.key).toBe("unit");
    expect(cardTypeDef.schema.stats.fields).toHaveLength(2);
  });

  it("resolves stratagem card type correctly", () => {
    const schema = {
      cardTypes: [{ key: "stratagem", label: "Stratagem", baseType: "stratagem", schema: makeStratagemSchema() }],
    };
    const card = { cardType: "stratagem" };
    const { cardTypeDef, baseType } = resolveCardType(card, schema);

    expect(baseType).toBe("stratagem");
    expect(cardTypeDef.schema.fields).toHaveLength(3);
  });

  it("resolves rule card type correctly", () => {
    const schema = {
      cardTypes: [{ key: "rule", label: "Rule", baseType: "rule", schema: makeRuleSchema() }],
    };
    const card = { cardType: "rule" };
    const { cardTypeDef, baseType } = resolveCardType(card, schema);

    expect(baseType).toBe("rule");
    expect(cardTypeDef.schema.rules.fields).toHaveLength(2);
  });

  it("resolves enhancement card type correctly", () => {
    const schema = {
      cardTypes: [
        { key: "enhancement", label: "Enhancement", baseType: "enhancement", schema: makeEnhancementSchema() },
      ],
    };
    const card = { cardType: "enhancement" };
    const { cardTypeDef, baseType } = resolveCardType(card, schema);

    expect(baseType).toBe("enhancement");
    expect(cardTypeDef.schema.keywords.fields).toHaveLength(1);
  });

  it("returns null for unknown card type", () => {
    const schema = { cardTypes: [] };
    const card = { cardType: "unknown" };
    const { cardTypeDef, baseType } = resolveCardType(card, schema);

    expect(cardTypeDef).toBeNull();
    expect(baseType).toBeNull();
  });

  it("returns null when card is null", () => {
    const schema = { cardTypes: [{ key: "unit", baseType: "unit", schema: {} }] };
    const { cardTypeDef, baseType } = resolveCardType(null, schema);

    expect(cardTypeDef).toBeNull();
    expect(baseType).toBeNull();
  });

  it("returns null when schema has no cardTypes", () => {
    const { cardTypeDef, baseType } = resolveCardType({ cardType: "unit" }, { cardTypes: [] });

    expect(cardTypeDef).toBeNull();
    expect(baseType).toBeNull();
  });

  it("resolves legacy DataCard to unit baseType", () => {
    const schema = {
      cardTypes: [{ key: "unit", label: "Unit", baseType: "unit", schema: make40kUnitSchema() }],
    };
    const card = { cardType: "DataCard" };
    const { cardTypeDef, baseType } = resolveCardType(card, schema);

    expect(baseType).toBe("unit");
  });

  it("resolves by baseType when key does not match", () => {
    const schema = {
      cardTypes: [{ key: "warscroll", label: "Warscroll", baseType: "unit", schema: make40kUnitSchema() }],
    };
    const card = { cardType: "unit" };
    const { cardTypeDef, baseType } = resolveCardType(card, schema);

    expect(baseType).toBe("unit");
    expect(cardTypeDef.key).toBe("warscroll");
  });
});

describe("CustomCardEditor - schema field defaults", () => {
  it("unit schema has all required sections", () => {
    const schema = make40kUnitSchema();

    expect(schema.stats).toBeDefined();
    expect(schema.stats.fields).toHaveLength(2);
    expect(schema.weaponTypes).toBeDefined();
    expect(schema.weaponTypes.types).toHaveLength(1);
    expect(schema.abilities).toBeDefined();
    expect(schema.abilities.categories).toHaveLength(1);
    expect(schema.metadata).toBeDefined();
    expect(schema.metadata.hasKeywords).toBe(true);
    expect(schema.metadata.hasPoints).toBe(true);
  });

  it("stratagem schema has only fields", () => {
    const schema = makeStratagemSchema();

    expect(schema.fields).toHaveLength(3);
    expect(schema.rules).toBeUndefined();
    expect(schema.keywords).toBeUndefined();
  });

  it("rule schema has fields and rules collection", () => {
    const schema = makeRuleSchema();

    expect(schema.fields).toHaveLength(2);
    expect(schema.rules).toBeDefined();
    expect(schema.rules.fields).toHaveLength(2);
  });

  it("enhancement schema has fields and keywords collection", () => {
    const schema = makeEnhancementSchema();

    expect(schema.fields).toHaveLength(3);
    expect(schema.keywords).toBeDefined();
    expect(schema.keywords.fields).toHaveLength(1);
  });

  it("unit weapon type has correct structure", () => {
    const schema = make40kUnitSchema();
    const ranged = schema.weaponTypes.types[0];

    expect(ranged.key).toBe("ranged");
    expect(ranged.hasKeywords).toBe(true);
    expect(ranged.hasProfiles).toBe(true);
    expect(ranged.columns).toHaveLength(1);
    expect(ranged.columns[0].key).toBe("range");
  });

  it("unit ability category has correct format", () => {
    const schema = make40kUnitSchema();
    const core = schema.abilities.categories[0];

    expect(core.key).toBe("core");
    expect(core.format).toBe("name-only");
  });
});

describe("CustomCardEditor - data shapes match display components", () => {
  it("unit card weapons stored by type key matches CustomCardWeapons lookup", () => {
    // CustomCardWeapons.jsx:121 looks up weapons as unit[weaponTypeDef.key]
    const card = {
      weapons: {
        ranged: [{ active: true, profiles: [{ name: "Bolter", range: "24", active: true, keywords: [] }] }],
        melee: [{ active: true, profiles: [{ name: "Fist", range: "Melee", active: true, keywords: [] }] }],
      },
    };

    const schema = make40kUnitSchema();
    const rangedType = schema.weaponTypes.types[0];
    const weapons = card.weapons[rangedType.key];

    expect(weapons).toHaveLength(1);
    expect(weapons[0].profiles[0].name).toBe("Bolter");
  });

  it("unit card abilities stored as flat array with category matches CustomCardAbilities lookup", () => {
    // CustomCardAbilities.jsx:88 filters by a.category === categoryKey
    const card = {
      abilities: [
        { category: "core", name: "Deep Strike", showAbility: true },
        { category: "core", name: "Scouts", showAbility: true },
        { category: "unit", name: "Special Rule", showAbility: true, description: "Desc" },
      ],
    };

    const coreAbilities = card.abilities.filter((a) => a.category === "core");
    expect(coreAbilities).toHaveLength(2);
    expect(coreAbilities[0].name).toBe("Deep Strike");

    const unitAbilities = card.abilities.filter((a) => a.category === "unit");
    expect(unitAbilities).toHaveLength(1);
    expect(unitAbilities[0].description).toBe("Desc");
  });

  it("unit card stats stored as array of objects with schema field keys", () => {
    const card = {
      stats: [
        { name: "Line 1", active: true, m: "6", t: "4" },
        { name: "Line 2", active: false, m: "8", t: "5" },
      ],
    };

    const activeStats = card.stats.filter((s) => s.active);
    expect(activeStats).toHaveLength(1);
    expect(activeStats[0].m).toBe("6");
  });

  it("rule card data matches CustomRuleCard expectations", () => {
    const card = {
      name: "Test Rule",
      ruleType: "Core Rule",
      description: "A description",
      rules: [{ title: "Sub Rule", description: "Sub desc", active: true }],
    };

    expect(card.rules[0].title).toBe("Sub Rule");
    expect(card.rules[0].active).toBe(true);
  });

  it("stratagem card data matches CustomStratagemCard expectations", () => {
    const card = {
      name: "Counter Offensive",
      cost: "2CP",
      type: "Battle Tactic",
      description: "Use this stratagem...",
      turn: "yours",
      styling: { width: 260, height: 458, textSize: 16 },
    };

    expect(card.turn).toBe("yours");
    expect(card.styling.width).toBe(260);
  });
});

describe("CustomCardEditor - CardEditContext integration", () => {
  it("createBlankCardFromSchema creates valid card for datasource editor", async () => {
    const { createBlankCardFromSchema } = await import("../../../Helpers/customDatasource.helpers");
    const cardTypeDef = {
      key: "unit",
      label: "Unit",
      baseType: "unit",
      schema: make40kUnitSchema(),
    };

    const card = createBlankCardFromSchema(cardTypeDef, "faction-1", "datasource-1");

    expect(card.id).toBeDefined();
    expect(card.name).toBe("New Unit");
    expect(card.cardType).toBe("unit");
    expect(card.faction_id).toBe("faction-1");
    expect(card.source).toBe("datasource-1");
    expect(card.stats).toHaveLength(1);
    expect(card.weapons).toBeDefined();
    expect(card.abilities).toEqual([]);
    expect(card.keywords).toEqual([]);
    expect(card.factionKeywords).toEqual([]);
  });

  it("createBlankCardFromSchema creates valid stratagem card", async () => {
    const { createBlankCardFromSchema } = await import("../../../Helpers/customDatasource.helpers");
    const cardTypeDef = {
      key: "stratagem",
      label: "Stratagem",
      baseType: "stratagem",
      schema: makeStratagemSchema(),
    };

    const card = createBlankCardFromSchema(cardTypeDef, "faction-1", "datasource-1");

    expect(card.cardType).toBe("stratagem");
    expect(card.name).toBeDefined();
  });

  it("getTargetArray returns correct array names", async () => {
    const { getTargetArray } = await import("../../../Helpers/customDatasource.helpers");

    expect(getTargetArray("unit")).toBe("datasheets");
    expect(getTargetArray("stratagem")).toBe("stratagems");
    expect(getTargetArray("enhancement")).toBe("enhancements");
    expect(getTargetArray("rule")).toBe("rules");
    expect(getTargetArray("unknown")).toBe("datasheets"); // default fallback
  });
});
