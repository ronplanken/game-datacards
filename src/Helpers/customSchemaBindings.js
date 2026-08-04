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

  // Abilities group
  if (schema.abilities?.categories?.length > 0) {
    const bindings = [];

    for (let i = 0; i < 3; i++) {
      bindings.push({
        path: `abilities[${i}].name`,
        label: `Ability ${i + 1} Name`,
        type: "string",
      });
      bindings.push({
        path: `abilities[${i}].description`,
        label: `Ability ${i + 1} Description`,
        type: "string",
      });
      bindings.push({
        path: `abilities[${i}].category`,
        label: `Ability ${i + 1} Category`,
        type: "string",
      });
    }

    groups.push({ name: schema.abilities.label || "Abilities", bindings });
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

  // Abilities
  if (schema.abilities?.categories?.length > 0) {
    sources.push({
      path: "abilities",
      label: schema.abilities.label || "Abilities",
      itemFields: ["name", "description", "category"],
    });
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
