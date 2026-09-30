/**
 * Custom Schema Bindings Generator
 *
 * Generates BINDING_SCHEMAS and ARRAY_SOURCES shapes from a custom datasource
 * card type definition. Used by the Card Designer to dynamically support
 * custom datasource formats for data binding.
 */

/**
 * Generates a binding schema from a unit card type definition.
 * @param {import('./customSchema.helpers').CardTypeDefinition} cardTypeDef
 * @param {string} datasourceName - Display name of the datasource
 * @returns {{ name: string, groups: Array<{ name: string, bindings: Array<{ path: string, label: string, type: string }> }> }}
 */
const generateUnitBindings = (cardTypeDef, datasourceName) => {
  const schema = cardTypeDef.schema;
  const groups = [];

  // Basic Info group (always present)
  groups.push({
    name: "Basic Info",
    bindings: [
      { path: "name", label: "Name", type: "string" },
      { path: "cardType", label: "Card Type", type: "string" },
    ],
  });

  // Stats group
  if (schema.stats?.fields?.length > 0) {
    const bindings = [];
    const maxProfiles = schema.stats.allowMultipleProfiles ? 2 : 1;

    for (let profileIdx = 0; profileIdx < maxProfiles; profileIdx++) {
      const prefix = maxProfiles > 1 ? `Profile ${profileIdx + 1} ` : "";
      for (const field of schema.stats.fields) {
        bindings.push({
          path: `stats[${profileIdx}].${field.key}`,
          label: `${prefix}${field.label}`,
          type: "string",
        });
      }
    }

    groups.push({ name: schema.stats.label || "Stats", bindings });
  }

  // Weapons groups (one per weapon type)
  if (schema.weaponTypes?.types?.length > 0) {
    for (const weaponType of schema.weaponTypes.types) {
      const bindings = [];

      for (let weaponIdx = 0; weaponIdx < 2; weaponIdx++) {
        const prefix = `Weapon ${weaponIdx + 1} `;
        bindings.push({
          path: `weapons.${weaponType.key}[${weaponIdx}].name`,
          label: `${prefix}Name`,
          type: "string",
        });
        for (const col of weaponType.columns) {
          bindings.push({
            path: `weapons.${weaponType.key}[${weaponIdx}].${col.key}`,
            label: `${prefix}${col.label}`,
            type: "string",
          });
        }
      }

      groups.push({ name: weaponType.label, bindings });
    }
  }

  if (schema.abilities?.categories?.length > 0) {
    for (const category of schema.abilities.categories) {
      const bindings = [];

      for (let i = 0; i < 3; i++) {
        bindings.push({
          path: `abilities.${category.key}[${i}].name`,
          label: `Ability ${i + 1} Name`,
          type: "string",
        });
        bindings.push({
          path: `abilities.${category.key}[${i}].description`,
          label: `Ability ${i + 1} Description`,
          type: "string",
        });
      }

      groups.push({ name: category.label || category.key, bindings });
    }
  }

  // Keywords group
  if (schema.metadata) {
    const bindings = [];

    if (schema.metadata.hasKeywords) {
      for (let i = 0; i < 5; i++) {
        bindings.push({
          path: `keywords[${i}]`,
          label: `Keyword ${i + 1}`,
          type: "string",
        });
      }
    }

    if (schema.metadata.hasFactionKeywords) {
      bindings.push({
        path: "factionKeywords",
        label: "Faction Keywords",
        type: "array",
      });
    }

    if (bindings.length > 0) {
      groups.push({ name: "Keywords", bindings });
    }

    // Points group
    if (schema.metadata.hasPoints) {
      groups.push({
        name: "Points",
        bindings: [{ path: "points", label: "Points", type: "number" }],
      });
    }
  }

  return {
    name: `${datasourceName} - ${cardTypeDef.label}`,
    groups,
  };
};

/**
 * Generates a binding schema from a field-based card type definition (rule/enhancement/stratagem).
 * @param {import('./customSchema.helpers').CardTypeDefinition} cardTypeDef
 * @param {string} datasourceName - Display name of the datasource
 * @returns {{ name: string, groups: Array<{ name: string, bindings: Array<{ path: string, label: string, type: string }> }> }}
 */
const generateFieldBindings = (cardTypeDef, datasourceName) => {
  const schema = cardTypeDef.schema;
  const groups = [];

  // Fields group
  if (schema.fields?.length > 0) {
    const bindings = schema.fields.map((field) => ({
      path: field.key,
      label: field.label,
      type: field.type === "boolean" ? "boolean" : "string",
    }));
    groups.push({ name: "Fields", bindings });
  }

  // Collection groups (rules, keywords)
  const collectionKeys = ["rules", "keywords"];
  for (const collKey of collectionKeys) {
    const collection = schema[collKey];
    if (!collection?.fields?.length) continue;

    const bindings = [];
    for (let i = 0; i < 3; i++) {
      for (const field of collection.fields) {
        bindings.push({
          path: `${collKey}[${i}].${field.key}`,
          label: `${collection.label} ${i + 1} ${field.label}`,
          type: field.type === "boolean" ? "boolean" : "string",
        });
      }
    }
    groups.push({ name: collection.label, bindings });
  }

  return {
    name: `${datasourceName} - ${cardTypeDef.label}`,
    groups,
  };
};

/**
 * Generates a BINDING_SCHEMAS-compatible object from a card type definition.
 *
 * @param {import('./customSchema.helpers').CardTypeDefinition} cardTypeDef - The card type definition
 * @param {string} [datasourceName="Custom"] - Display name of the datasource
 * @returns {{ name: string, groups: Array<{ name: string, bindings: Array<{ path: string, label: string, type: string }> }> }}
 */
export const generateBindingsFromSchema = (cardTypeDef, datasourceName = "Custom") => {
  if (!cardTypeDef?.schema) {
    return { name: datasourceName, groups: [] };
  }

  if (cardTypeDef.baseType === "unit") {
    return generateUnitBindings(cardTypeDef, datasourceName);
  }

  return generateFieldBindings(cardTypeDef, datasourceName);
};

/**
 * Generates array sources for unit card types.
 * @param {import('./customSchema.helpers').CardTypeDefinition} cardTypeDef
 * @returns {Array<{ path: string, label: string, itemFields: string[] }>}
 */
const generateUnitArraySources = (cardTypeDef) => {
  const schema = cardTypeDef.schema;
  const sources = [];

  // Stats
  if (schema.stats?.fields?.length > 0) {
    sources.push({
      path: "stats",
      label: schema.stats.label || "Stats",
      itemFields: schema.stats.fields.map((f) => f.key),
    });
  }

  // Weapons (one source per weapon type)
  if (schema.weaponTypes?.types?.length > 0) {
    for (const weaponType of schema.weaponTypes.types) {
      sources.push({
        path: `weapons.${weaponType.key}`,
        label: weaponType.label,
        itemFields: ["name", ...weaponType.columns.map((c) => c.key)],
      });
    }
  }

  if (schema.abilities?.categories?.length > 0) {
    for (const category of schema.abilities.categories) {
      sources.push({
        path: `abilities.${category.key}`,
        label: category.label || category.key,
        itemFields: ["name", "description"],
      });
    }
  }

  // Keywords
  if (schema.metadata?.hasKeywords) {
    sources.push({
      path: "keywords",
      label: "Keywords",
      itemFields: [],
    });
  }

  // Faction keywords
  if (schema.metadata?.hasFactionKeywords) {
    sources.push({
      path: "factionKeywords",
      label: "Faction Keywords",
      itemFields: [],
    });
  }

  return sources;
};

/**
 * Generates array sources for field-based card types.
 * @param {import('./customSchema.helpers').CardTypeDefinition} cardTypeDef
 * @returns {Array<{ path: string, label: string, itemFields: string[] }>}
 */
const generateFieldArraySources = (cardTypeDef) => {
  const schema = cardTypeDef.schema;
  const sources = [];

  const collectionKeys = ["rules", "keywords"];
  for (const collKey of collectionKeys) {
    const collection = schema[collKey];
    if (!collection?.fields?.length) continue;

    sources.push({
      path: collKey,
      label: collection.label,
      itemFields: collection.fields.map((f) => f.key),
    });
  }

  return sources;
};

/**
 * Generates an ARRAY_SOURCES-compatible array from a card type definition.
 *
 * @param {import('./customSchema.helpers').CardTypeDefinition} cardTypeDef - The card type definition
 * @returns {Array<{ path: string, label: string, itemFields: string[] }>}
 */
export const generateArraySourcesFromSchema = (cardTypeDef) => {
  if (!cardTypeDef?.schema) {
    return [];
  }

  if (cardTypeDef.baseType === "unit") {
    return generateUnitArraySources(cardTypeDef);
  }

  return generateFieldArraySources(cardTypeDef);
};

/**
 * Parses a custom format string into datasource ID and card type key.
 * Format: "custom-{datasourceId}:{cardTypeKey}"
 *
 * @param {string} format - The format string
 * @returns {{ datasourceId: string, cardTypeKey: string } | null}
 */
export const parseCustomFormat = (format) => {
  if (!format || !format.startsWith("custom-")) return null;

  const withoutPrefix = format.slice(7); // Remove "custom-"
  const colonIndex = withoutPrefix.indexOf(":");
  if (colonIndex === -1) return null;

  const datasourceId = "custom-" + withoutPrefix.slice(0, colonIndex);
  const cardTypeKey = withoutPrefix.slice(colonIndex + 1);

  if (!datasourceId || !cardTypeKey) return null;

  return { datasourceId, cardTypeKey };
};

/**
 * Builds a custom format string from a datasource ID and card type key.
 *
 * @param {string} datasourceId - The datasource ID (e.g., "custom-abc-123")
 * @param {string} cardTypeKey - The card type key (e.g., "unit")
 * @returns {string} Format string (e.g., "custom-abc-123:unit")
 */
export const buildCustomFormat = (datasourceId, cardTypeKey) => {
  return `${datasourceId}:${cardTypeKey}`;
};

const booleanDisplayCache = new WeakMap();

const hasCustomBooleanText = (def) =>
  def?.type === "boolean" && (def.onValue !== undefined || def.offValue !== undefined);

const toBooleanDisplay = (value, def) => {
  if (value === true) return def.onValue !== undefined ? def.onValue : value;
  if (value === false || value == null) return def.offValue !== undefined ? def.offValue : value;
  return value;
};

const applyToRow = (row, defs) => {
  if (!row || typeof row !== "object" || Array.isArray(row)) return row;
  const result = { ...row };
  for (const def of defs) {
    const value = toBooleanDisplay(row[def.key], def);
    if (value !== undefined) result[def.key] = value;
  }
  return result;
};

const applyToWeapon = (weapon, defs) => {
  const result = applyToRow(weapon, defs);
  if (result && Array.isArray(result.profiles)) {
    result.profiles = result.profiles.map((profile) => applyToRow(profile, defs));
  }
  return result;
};

const buildBooleanDisplayCard = (card, schema) => {
  const statDefs = (schema.stats?.fields || []).filter(hasCustomBooleanText);
  const weaponTypes = (schema.weaponTypes?.types || [])
    .map((type) => ({ key: type.key, defs: (type.columns || []).filter(hasCustomBooleanText) }))
    .filter((type) => type.defs.length > 0);

  if (statDefs.length === 0 && weaponTypes.length === 0) return card;

  const result = { ...card };

  if (statDefs.length > 0 && Array.isArray(card.stats)) {
    result.stats = card.stats.map((row) => applyToRow(row, statDefs));
  }

  if (weaponTypes.length > 0 && card.weapons && typeof card.weapons === "object" && !Array.isArray(card.weapons)) {
    result.weapons = { ...card.weapons };
    for (const { key, defs } of weaponTypes) {
      if (Array.isArray(card.weapons[key])) {
        result.weapons[key] = card.weapons[key].map((weapon) => applyToWeapon(weapon, defs));
      }
    }
  }

  return result;
};

export const applyBooleanDisplayValues = (card, cardTypeDef) => {
  if (!card || typeof card !== "object" || !cardTypeDef?.schema) return card;

  let byDef = booleanDisplayCache.get(card);
  if (!byDef) {
    byDef = new WeakMap();
    booleanDisplayCache.set(card, byDef);
  }

  const cached = byDef.get(cardTypeDef);
  if (cached) return cached;

  const result = buildBooleanDisplayCard(card, cardTypeDef.schema);
  byDef.set(cardTypeDef, result);
  return result;
};
