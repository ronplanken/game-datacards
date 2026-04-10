/**
 * Resolves a card + game system into an array of editor section descriptors.
 * Each section describes what editor component to render and with what config.
 */

// 40k-10e stat field definitions
const STATS_40K_10E = [
  { key: "m", label: "M" },
  { key: "t", label: "T" },
  { key: "sv", label: "SV" },
  { key: "w", label: "W" },
  { key: "ld", label: "LD" },
  { key: "oc", label: "OC" },
];

// 40k-10e weapon column definitions
const WEAPON_COLUMNS_40K_10E = [
  { key: "range", label: "Range" },
  { key: "attacks", label: "A" },
  { key: "skill", label: "Skill" },
  { key: "strength", label: "S" },
  { key: "ap", label: "AP" },
  { key: "damage", label: "D" },
];

// AoS weapon column definitions
const WEAPON_COLUMNS_AOS = [
  { key: "range", label: "Rng" },
  { key: "attacks", label: "Atk" },
  { key: "hit", label: "Hit" },
  { key: "wound", label: "Wnd" },
  { key: "rend", label: "Rnd" },
  { key: "damage", label: "Dmg" },
  { key: "abilities", label: "Keywords", fullWidth: true },
];

// AoS stat field definitions
const STATS_AOS = [
  { key: "move", label: "Move" },
  { key: "save", label: "Save" },
  { key: "control", label: "Control" },
  { key: "health", label: "Health" },
  { key: "ward", label: "Ward" },
  { key: "wizard", label: "Wizard" },
  { key: "priest", label: "Priest" },
];

/**
 * Main resolver: takes a card, game system ID, and optional schema.
 * Returns array of section descriptors for the editor to render.
 */
export function resolveEditorSections(card, gameSystem, schema) {
  if (!card) return [];

  // Custom datasource with schema
  if (schema?.cardTypes?.length) {
    return resolveCustomSections(card, schema);
  }

  // Built-in systems
  const source = card.source || gameSystem;
  switch (source) {
    case "40k-10e":
      return resolve40k10eSections(card);
    case "aos":
      return resolveAosSections(card);
    default:
      return resolveGenericSections(card);
  }
}

function resolve40k10eSections(card) {
  // Determine card type based on available data
  const isUnit = Array.isArray(card.stats) || card.rangedWeapons || card.meleeWeapons;
  const isStratagem = card.when !== undefined || card.effect !== undefined;
  const isEnhancement = card.description !== undefined && card.cost !== undefined && !isUnit && !isStratagem;
  const isRule = Array.isArray(card.rules) && !isUnit;

  if (isUnit) return resolve40kUnitSections(card);
  if (isStratagem) return resolve40kStratagemSections();
  if (isEnhancement) return resolve40kEnhancementSections();
  if (isRule) return resolve40kRuleSections();

  return resolveGenericSections(card);
}

function resolve40kUnitSections(card) {
  const sections = [{ key: "name", label: "Name", type: "name", config: {} }];

  // Stats
  if (Array.isArray(card.stats)) {
    sections.push({
      key: "stats",
      label: "Stats",
      type: "stats",
      config: {
        fields: STATS_40K_10E,
        allowMultipleProfiles: true,
        dataPath: "stats",
      },
    });
  }

  // Invulnerable save
  if (card.abilities?.invul) {
    sections.push({
      key: "invul",
      label: "Invulnerable Save",
      type: "invul",
      config: {},
    });
  }

  // Weapons
  const weaponTypes = [];
  if (card.rangedWeapons) {
    weaponTypes.push({
      key: "rangedWeapons",
      label: "Ranged Weapons",
      columns: WEAPON_COLUMNS_40K_10E,
      hasKeywords: true,
    });
  }
  if (card.meleeWeapons) {
    weaponTypes.push({
      key: "meleeWeapons",
      label: "Melee Weapons",
      columns: WEAPON_COLUMNS_40K_10E,
      hasKeywords: true,
    });
  }
  if (weaponTypes.length > 0) {
    sections.push({
      key: "weapons",
      label: "Weapons",
      type: "weapons",
      config: { types: weaponTypes, format: "40k" },
    });
  }

  // Abilities
  sections.push({
    key: "abilities",
    label: "Abilities",
    type: "abilities",
    config: {
      format: "40k",
      categories: [
        { key: "core", label: "Core Abilities", format: "name-only" },
        { key: "faction", label: "Faction Abilities", format: "name-only" },
        { key: "other", label: "Other Abilities", format: "name-description" },
        { key: "wargear", label: "Wargear Abilities", format: "name-description" },
        { key: "special", label: "Special Abilities", format: "name-description" },
      ],
    },
  });

  // Primarch abilities
  if (card.abilities?.primarch?.length) {
    sections.push({
      key: "primarch",
      label: "Primarch Abilities",
      type: "primarch",
      config: {},
    });
  }

  // Damaged profile
  if (card.abilities?.damaged) {
    sections.push({
      key: "damaged",
      label: "Damaged Profile",
      type: "damaged",
      config: {},
    });
  }

  // Wargear options
  if (card.wargear) {
    sections.push({
      key: "wargear",
      label: "Wargear Options",
      type: "stringList",
      config: { dataPath: "wargear", itemLabel: "Option" },
    });
  }

  // Unit composition
  if (card.composition) {
    sections.push({
      key: "composition",
      label: "Unit Composition",
      type: "stringList",
      config: { dataPath: "composition", itemLabel: "Entry" },
    });
  }

  // Loadout
  if (card.loadout !== undefined) {
    sections.push({
      key: "loadout",
      label: "Loadout",
      type: "textField",
      config: { dataPath: "loadout" },
    });
  }

  // Leader info
  if (card.leads) {
    sections.push({
      key: "leads",
      label: "Leader",
      type: "leaderInfo",
      config: { dataPath: "leads" },
    });
  }

  // Led by info
  if (card.leadBy) {
    sections.push({
      key: "leadBy",
      label: "Led By",
      type: "stringList",
      config: { dataPath: "leadBy", itemLabel: "Unit" },
    });
  }

  // Transport
  if (card.transport !== undefined) {
    sections.push({
      key: "transport",
      label: "Transport",
      type: "textField",
      config: { dataPath: "transport" },
    });
  }

  // Keywords
  if (card.keywords) {
    sections.push({
      key: "keywords",
      label: "Keywords",
      type: "keywords",
      config: { keywordsPath: "keywords", factionKeywordsPath: "factions" },
    });
  }

  // Points
  if (card.points !== undefined) {
    sections.push({
      key: "points",
      label: "Points",
      type: "points",
      config: { format: "scalar" },
    });
  }

  return sections;
}

function resolve40kStratagemSections() {
  return [
    { key: "name", label: "Name", type: "name", config: {} },
    {
      key: "fields",
      label: "Details",
      type: "fields",
      config: {
        fields: [
          { key: "type", label: "Type", type: "string" },
          { key: "cost", label: "Cost", type: "string" },
          { key: "turn", label: "Turn", type: "enum", options: ["your", "opponents", "either"] },
          { key: "when", label: "When", type: "richtext" },
          { key: "target", label: "Target", type: "richtext" },
          { key: "effect", label: "Effect", type: "richtext" },
          { key: "restrictions", label: "Restrictions", type: "richtext" },
        ],
      },
    },
  ];
}

function resolve40kEnhancementSections() {
  return [
    { key: "name", label: "Name", type: "name", config: {} },
    {
      key: "fields",
      label: "Details",
      type: "fields",
      config: {
        fields: [
          { key: "cost", label: "Cost", type: "string" },
          { key: "description", label: "Description", type: "richtext" },
        ],
      },
    },
  ];
}

function resolve40kRuleSections() {
  return [
    { key: "name", label: "Name", type: "name", config: {} },
    {
      key: "fields",
      label: "Details",
      type: "fields",
      config: {
        fields: [
          { key: "ruleType", label: "Rule Type", type: "enum", options: ["army", "detachment"] },
          { key: "detachment", label: "Detachment", type: "string" },
        ],
      },
    },
    {
      key: "rules",
      label: "Rules",
      type: "rulesList",
      config: {},
    },
  ];
}

function resolveAosSections(card) {
  const sections = [{ key: "name", label: "Name", type: "name", config: {} }];

  // Stats (flat object)
  if (card.stats) {
    sections.push({
      key: "stats",
      label: "Stats",
      type: "stats",
      config: {
        fields: STATS_AOS,
        allowMultipleProfiles: false,
        dataPath: "stats",
        flatObject: true,
      },
    });
  }

  // Weapons
  const weaponTypes = [];
  if (card.weapons?.ranged) {
    weaponTypes.push({ key: "ranged", label: "Ranged Weapons", columns: WEAPON_COLUMNS_AOS });
  }
  if (card.weapons?.melee) {
    weaponTypes.push({ key: "melee", label: "Melee Weapons", columns: WEAPON_COLUMNS_AOS });
  }
  if (weaponTypes.length > 0) {
    sections.push({
      key: "weapons",
      label: "Weapons",
      type: "weapons",
      config: { types: weaponTypes, format: "aos" },
    });
  }

  // Abilities (flat array)
  if (Array.isArray(card.abilities)) {
    sections.push({
      key: "abilities",
      label: "Abilities",
      type: "abilities",
      config: { format: "aos" },
    });
  }

  // Keywords
  if (card.keywords || card.factionKeywords) {
    sections.push({
      key: "keywords",
      label: "Keywords",
      type: "keywords",
      config: { keywordsPath: "keywords", factionKeywordsPath: "factionKeywords" },
    });
  }

  return sections;
}

function resolveCustomSections(card, schema) {
  const cardTypeDef = schema.cardTypes?.find((ct) => ct.key === card.cardType);
  if (!cardTypeDef) return resolveGenericSections(card);

  const sections = [{ key: "name", label: "Name", type: "name", config: {} }];
  const s = cardTypeDef.schema;

  if (cardTypeDef.baseType === "unit") {
    // Stats
    if (s.stats?.fields?.length) {
      sections.push({
        key: "stats",
        label: s.stats.label || "Stats",
        type: "stats",
        config: {
          fields: s.stats.fields,
          allowMultipleProfiles: s.stats.allowMultipleProfiles ?? true,
          dataPath: "stats",
        },
      });
    }

    // Weapons
    if (s.weaponTypes?.types?.length) {
      const types = s.weaponTypes.types.map((wt) => ({
        key: wt.key,
        label: wt.label,
        columns: wt.columns || [],
        hasKeywords: wt.hasKeywords,
        hasProfiles: wt.hasProfiles,
      }));
      sections.push({
        key: "weapons",
        label: s.weaponTypes.label || "Weapons",
        type: "weapons",
        config: { types, format: "custom" },
      });
    }

    // Abilities
    if (s.abilities?.categories?.length) {
      sections.push({
        key: "abilities",
        label: s.abilities.label || "Abilities",
        type: "abilities",
        config: {
          format: "custom",
          categories: s.abilities.categories.map((cat) => ({
            key: cat.key,
            label: cat.label,
            format: cat.format || "name-description",
          })),
        },
      });
    }

    // Sections (custom)
    if (s.sections?.sections?.length) {
      sections.push({
        key: "customSections",
        label: s.sections.label || "Sections",
        type: "customSections",
        config: { sections: s.sections.sections },
      });
    }

    // Keywords
    if (s.metadata?.hasKeywords || s.metadata?.hasFactionKeywords) {
      sections.push({
        key: "keywords",
        label: "Keywords",
        type: "keywords",
        config: {
          keywordsPath: s.metadata?.hasKeywords ? "keywords" : null,
          factionKeywordsPath: s.metadata?.hasFactionKeywords ? "factionKeywords" : null,
        },
      });
    }

    // Points
    if (s.metadata?.hasPoints) {
      sections.push({
        key: "points",
        label: "Points",
        type: "points",
        config: { format: s.metadata.pointsFormat || "per-unit" },
      });
    }
  } else {
    // Rule, enhancement, stratagem base types — flat fields
    if (s.fields?.length) {
      sections.push({
        key: "fields",
        label: "Details",
        type: "fields",
        config: { fields: s.fields },
      });
    }

    // Collections (rules, keywords)
    if (s.rules?.fields?.length) {
      sections.push({
        key: "rulesCollection",
        label: s.rules.label || "Rules",
        type: "fieldCollection",
        config: {
          collectionPath: "rules",
          fields: s.rules.fields,
          allowMultiple: s.rules.allowMultiple ?? true,
        },
      });
    }

    if (s.keywords?.fields?.length) {
      sections.push({
        key: "keywordsCollection",
        label: s.keywords.label || "Keywords",
        type: "fieldCollection",
        config: {
          collectionPath: "keywords",
          fields: s.keywords.fields,
          allowMultiple: s.keywords.allowMultiple ?? true,
        },
      });
    }
  }

  return sections;
}

function resolveGenericSections(card) {
  const sections = [{ key: "name", label: "Name", type: "name", config: {} }];

  // Try to detect editable fields
  if (card.description !== undefined) {
    sections.push({
      key: "fields",
      label: "Details",
      type: "fields",
      config: {
        fields: [{ key: "description", label: "Description", type: "richtext" }],
      },
    });
  }

  if (card.keywords) {
    sections.push({
      key: "keywords",
      label: "Keywords",
      type: "keywords",
      config: { keywordsPath: "keywords", factionKeywordsPath: "factions" },
    });
  }

  return sections;
}
