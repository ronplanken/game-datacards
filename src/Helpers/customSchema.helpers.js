/**
 * Custom Schema Helpers
 *
 * Defines the schema data structure, presets, validation, and migration
 * for custom datasources. A schema describes the shape of cards — not
 * card data itself.
 */

// Valid base types for card type definitions
export const VALID_BASE_TYPES = ["unit", "rule", "enhancement", "stratagem"];

// Valid field types
export const VALID_FIELD_TYPES = ["string", "richtext", "enum", "boolean"];

// Valid base systems
export const VALID_BASE_SYSTEMS = ["40k-10e", "aos", "blank"];

// Valid ability formats
export const VALID_ABILITY_FORMATS = ["name-only", "name-description"];

// Valid column display modes (for weapon columns)
export const VALID_COLUMN_DISPLAY_MODES = ["column", "row"];

// Valid column visual modes (for row-display columns)
export const VALID_COLUMN_VISUAL_MODES = ["text", "badge"];

// Valid ability layout modes
export const VALID_ABILITY_LAYOUTS = ["full", "half", "third", "quarter"];

// Valid section formats
export const VALID_SECTION_FORMATS = ["list", "richtext"];

// Valid points formats
export const VALID_POINTS_FORMATS = ["per-model", "per-unit"];

// Schema version
export const SCHEMA_VERSION = "1.0.0";

// Default colours for custom datasources
export const DEFAULT_DATASOURCE_COLOURS = Object.freeze({ header: "#1a1a2e", banner: "#16213e" });

// --- JSDoc Type Definitions ---

/**
 * @typedef {"string" | "richtext" | "enum" | "boolean"} FieldType
 */

/**
 * @typedef {"unit" | "rule" | "enhancement" | "stratagem"} BaseType
 */

/**
 * @typedef {"40k-10e" | "aos" | "blank"} BaseSystem
 */

/**
 * @typedef {"name-only" | "name-description"} AbilityFormat
 */

/**
 * @typedef {"per-model" | "per-unit"} PointsFormat
 */

/**
 * A single field definition used throughout the schema.
 * @typedef {Object} FieldDefinition
 * @property {string} key - Unique key within the parent collection
 * @property {string} label - Human-readable label
 * @property {FieldType} type - Data type of the field
 * @property {number} [displayOrder] - Order for display (used in stat fields)
 * @property {string[]} [options] - Valid options when type is "enum"
 * @property {string} [onValue] - Display value when boolean field is true
 * @property {string} [offValue] - Display value when boolean field is false
 * @property {"left" | "right"} [position] - Which side of the header stats render on (AoS)
 * @property {string} [color] - Background color hex for the stat badge (AoS)
 */

/**
 * A single section definition within the sections schema.
 * @typedef {Object} SectionDefinition
 * @property {string} key - Unique key for the section
 * @property {string} label - Human-readable label
 * @property {"list" | "richtext"} format - Display format for the section
 */

/**
 * Sections definition for unit card types.
 * @typedef {Object} SectionsDefinition
 * @property {string} label - Section group label
 * @property {SectionDefinition[]} sections - Section definitions
 */

/**
 * Stats section for unit card types.
 * @typedef {Object} StatsDefinition
 * @property {string} label - Section label (e.g. "Stat Profiles")
 * @property {boolean} allowMultipleProfiles - Whether cards can have multiple stat profiles
 * @property {FieldDefinition[]} fields - Stat column definitions
 */

/**
 * A single weapon type definition with its column layout.
 * @typedef {Object} WeaponTypeDefinition
 * @property {string} key - Unique key (e.g. "ranged", "melee")
 * @property {string} label - Human-readable label (e.g. "Ranged Weapons")
 * @property {boolean} hasKeywords - Whether weapons of this type have keywords
 * @property {boolean} hasProfiles - Whether weapons of this type support profiles
 * @property {FieldDefinition[]} columns - Column definitions for the weapon table
 */

/**
 * Weapon types section for unit card types.
 * @typedef {Object} WeaponTypesDefinition
 * @property {string} label - Section label (e.g. "Weapon Types")
 * @property {boolean} allowMultiple - Whether multiple weapon entries are allowed
 * @property {WeaponTypeDefinition[]} types - Weapon type definitions
 */

/**
 * A single ability category definition.
 * @typedef {Object} AbilityCategoryDefinition
 * @property {string} key - Unique key (e.g. "core", "faction")
 * @property {string} label - Human-readable label
 * @property {AbilityFormat} format - Display format
 * @property {string} [header] - Optional header text displayed above the category
 * @property {boolean} [hasColor] - Whether abilities in this category support per-ability strip color (AoS)
 * @property {boolean} [hasPhase] - Whether abilities in this category support per-ability phase text (AoS)
 */

/**
 * Abilities section for unit card types.
 * @typedef {Object} AbilitiesDefinition
 * @property {string} label - Section label
 * @property {AbilityCategoryDefinition[]} categories - Ability category definitions
 */

/**
 * Metadata flags for unit card types.
 * @typedef {Object} UnitMetadataDefinition
 * @property {boolean} hasKeywords - Whether cards have keywords
 * @property {boolean} hasFactionKeywords - Whether cards have faction keywords
 * @property {boolean} hasPoints - Whether cards have points costs
 * @property {PointsFormat} pointsFormat - Points display format
 */

/**
 * Schema for unit card types. Uses named sub-objects for deeply nested structure.
 * @typedef {Object} UnitSchema
 * @property {StatsDefinition} stats - Stat profile definitions
 * @property {WeaponTypesDefinition} weaponTypes - Weapon type and column definitions
 * @property {AbilitiesDefinition} abilities - Ability category definitions
 * @property {SectionsDefinition} [sections] - Optional sections definitions
 * @property {UnitMetadataDefinition} metadata - Metadata flag definitions
 */

/**
 * A repeatable collection definition (used by rules, keywords).
 * @typedef {Object} CollectionDefinition
 * @property {string} label - Section label
 * @property {boolean} allowMultiple - Whether multiple entries are allowed
 * @property {FieldDefinition[]} fields - Field definitions for each entry
 */

/**
 * Schema for rule card types.
 * @typedef {Object} RuleSchema
 * @property {FieldDefinition[]} fields - Top-level field definitions
 * @property {CollectionDefinition} rules - Nested rules collection
 */

/**
 * Schema for enhancement card types.
 * @typedef {Object} EnhancementSchema
 * @property {FieldDefinition[]} fields - Top-level field definitions
 * @property {CollectionDefinition} keywords - Keywords collection
 */

/**
 * Schema for stratagem card types.
 * @typedef {Object} StratagemSchema
 * @property {FieldDefinition[]} fields - Top-level field definitions
 */

/**
 * A card type definition within the datasource schema.
 * @typedef {Object} CardTypeDefinition
 * @property {string} key - Unique key within the datasource
 * @property {string} label - Human-readable label
 * @property {BaseType} baseType - Discriminator for schema shape
 * @property {UnitSchema | RuleSchema | EnhancementSchema | StratagemSchema} schema - Type-specific schema
 */

/**
 * The datasource schema definition.
 * @typedef {Object} DatasourceSchema
 * @property {string} version - Schema format version (e.g. "1.0.0")
 * @property {BaseSystem} baseSystem - Base game system this schema derives from
 * @property {CardTypeDefinition[]} cardTypes - Card type definitions
 */

/**
 * A complete custom datasource with schema.
 * @typedef {Object} CustomDatasource
 * @property {string} name - Datasource name
 * @property {string} version - Datasource content version
 * @property {string} id - Unique identifier
 * @property {string} author - Author name
 * @property {string} lastUpdated - ISO 8601 date
 * @property {DatasourceSchema} schema - Schema definition
 */

// --- Helper: Create a field definition ---

/**
 * Creates a field definition with defaults
 * @param {Object} overrides - Field properties to set
 * @param {string} overrides.key - Unique key
 * @param {string} overrides.label - Display label
 * @param {FieldType} [overrides.type="string"] - Field type
 * @param {number} [overrides.displayOrder] - Display order
 * @param {string[]} [overrides.options] - Enum options
 * @param {string} [overrides.onValue] - Display value when boolean is true
 * @param {string} [overrides.offValue] - Display value when boolean is false
 * @param {"left" | "right"} [overrides.position] - Stat badge position (AoS)
 * @param {string} [overrides.color] - Stat badge background color hex (AoS)
 * @returns {FieldDefinition}
 */
export const createFieldDefinition = ({
  key,
  label,
  type = "string",
  display,
  displayLabel,
  visual,
  displayOrder,
  options,
  special,
  specialColor,
  hideWhenEmpty,
  onValue,
  offValue,
  position,
  color,
}) => {
  const field = { key, label, type };
  if (display !== undefined) field.display = display;
  if (displayLabel !== undefined) field.displayLabel = displayLabel;
  if (visual !== undefined) field.visual = visual;
  if (displayOrder !== undefined) field.displayOrder = displayOrder;
  if (type === "enum" && options) field.options = [...options];
  if (special !== undefined) field.special = special;
  if (specialColor !== undefined) field.specialColor = specialColor;
  if (hideWhenEmpty !== undefined) field.hideWhenEmpty = hideWhenEmpty;
  if (type === "boolean" && onValue !== undefined) field.onValue = onValue;
  if (type === "boolean" && offValue !== undefined) field.offValue = offValue;
  if (position !== undefined) field.position = position;
  if (color !== undefined) field.color = color;
  return field;
};

// --- Helper: Create a collection definition ---

/**
 * Creates a collection definition with defaults
 * @param {Object} options - Collection properties
 * @param {string} options.label - Section label
 * @param {boolean} [options.allowMultiple=true] - Whether multiple entries are allowed
 * @param {FieldDefinition[]} [options.fields=[]] - Field definitions
 * @returns {CollectionDefinition}
 */
export const createCollectionDefinition = ({ label, allowMultiple = true, fields = [] }) => ({
  label,
  allowMultiple,
  fields: [...fields],
});

// --- Preset: Age of Sigmar ---

/**
 * Creates a schema preset matching the Age of Sigmar format.
 * Includes card types for warscrolls, spells, enhancements, and battle tactics.
 * @returns {DatasourceSchema}
 */
export const createAoSPreset = () => ({
  version: SCHEMA_VERSION,
  baseSystem: "aos",
  cardTypes: [
    {
      key: "warscroll",
      label: "Warscroll",
      baseType: "unit",
      schema: {
        stats: {
          label: "Characteristics",
          allowMultipleProfiles: false,
          fields: [
            createFieldDefinition({ key: "move", label: "Move", type: "string", displayOrder: 1, position: "left" }),
            createFieldDefinition({
              key: "save",
              label: "Save",
              type: "string",
              displayOrder: 2,
              position: "left",
              color: "#3a5228",
            }),
            createFieldDefinition({
              key: "control",
              label: "Control",
              type: "string",
              displayOrder: 3,
              position: "left",
            }),
            createFieldDefinition({
              key: "health",
              label: "Health",
              type: "string",
              displayOrder: 4,
              position: "left",
            }),
            createFieldDefinition({ key: "ward", label: "Ward", type: "string", displayOrder: 5, position: "right" }),
            createFieldDefinition({
              key: "wizard",
              label: "Wizard",
              type: "string",
              displayOrder: 6,
              position: "right",
            }),
            createFieldDefinition({
              key: "priest",
              label: "Priest",
              type: "string",
              displayOrder: 7,
              position: "right",
            }),
          ],
        },
        weaponTypes: {
          label: "Weapon Types",
          allowMultiple: true,
          types: [
            {
              key: "ranged",
              label: "Ranged Weapons",
              hasKeywords: true,
              hasProfiles: false,
              columns: [
                createFieldDefinition({ key: "range", label: "Range", type: "string" }),
                createFieldDefinition({ key: "attacks", label: "Atk", type: "string" }),
                createFieldDefinition({ key: "hit", label: "Hit", type: "string" }),
                createFieldDefinition({ key: "wound", label: "Wnd", type: "string" }),
                createFieldDefinition({ key: "rend", label: "Rend", type: "string" }),
                createFieldDefinition({ key: "damage", label: "Dmg", type: "string" }),
              ],
            },
            {
              key: "melee",
              label: "Melee Weapons",
              hasKeywords: true,
              hasProfiles: false,
              columns: [
                createFieldDefinition({ key: "attacks", label: "Atk", type: "string" }),
                createFieldDefinition({ key: "hit", label: "Hit", type: "string" }),
                createFieldDefinition({ key: "wound", label: "Wnd", type: "string" }),
                createFieldDefinition({ key: "rend", label: "Rend", type: "string" }),
                createFieldDefinition({ key: "damage", label: "Dmg", type: "string" }),
              ],
            },
          ],
        },
        abilities: {
          label: "Abilities",
          categories: [{ key: "abilities", label: "Abilities", format: "name-description" }],
        },
        sections: {
          label: "Sections",
          sections: [
            { key: "wargear-options", label: "Wargear Options", format: "list" },
            { key: "unit-composition", label: "Unit Composition", format: "list" },
          ],
        },
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: true,
          pointsFormat: "per-unit",
        },
      },
    },
    {
      key: "spell",
      label: "Spell",
      baseType: "rule",
      schema: {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", type: "string" }),
          createFieldDefinition({ key: "castingValue", label: "Casting Value", type: "string" }),
          createFieldDefinition({
            key: "type",
            label: "Type",
            type: "enum",
            required: true,
            options: ["spell", "prayer", "manifestation"],
          }),
        ],
        rules: createCollectionDefinition({
          label: "Effects",
          allowMultiple: false,
          fields: [
            createFieldDefinition({ key: "declare", label: "Declare", type: "richtext" }),
            createFieldDefinition({ key: "effect", label: "Effect", type: "richtext" }),
          ],
        }),
      },
    },
    {
      key: "enhancement",
      label: "Enhancement",
      baseType: "enhancement",
      schema: {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", type: "string" }),
          createFieldDefinition({ key: "cost", label: "Cost", type: "string" }),
          createFieldDefinition({
            key: "type",
            label: "Type",
            type: "enum",
            required: true,
            options: ["heroic-trait", "artefact", "prayer", "spell-lore"],
          }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext" }),
        ],
        keywords: createCollectionDefinition({
          label: "Keywords",
          allowMultiple: true,
          fields: [createFieldDefinition({ key: "keyword", label: "Keyword", type: "string" })],
        }),
      },
    },
    {
      key: "battle-tactic",
      label: "Battle Tactic",
      baseType: "stratagem",
      schema: {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", type: "string" }),
          createFieldDefinition({
            key: "type",
            label: "Type",
            type: "enum",
            required: true,
            options: ["battle-tactic", "grand-strategy"],
          }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext" }),
        ],
      },
    },
  ],
});

// --- Preset Step Defaults ---

/**
 * Returns pre-filled wizard step data for a given base system and card base type.
 * Looks up the matching card type in the system preset and extracts the schema
 * into the step data format the wizard expects.
 *
 * Returns null if no preset match exists (e.g. blank system, or a base type
 * not defined in the preset).
 *
 * @param {BaseSystem} baseSystem - The selected base system
 * @param {BaseType} baseType - The selected card base type
 * @returns {Object<string, object>|null} Step data keyed by step ID, or null
 */
export const getPresetStepDefaults = (baseSystem, baseType) => {
  if (baseSystem === "blank") return null;

  const preset = baseSystem === "40k-10e" ? create40kPreset() : baseSystem === "aos" ? createAoSPreset() : null;
  if (!preset) return null;

  const cardType = preset.cardTypes.find((ct) => ct.baseType === baseType);
  if (!cardType) return null;

  const defaults = {
    "card-type": { key: cardType.key, label: cardType.label },
  };

  if (baseType === "unit") {
    defaults["stats"] = { stats: cardType.schema.stats };
    defaults["weapons"] = { weaponTypes: cardType.schema.weaponTypes };
    defaults["abilities"] = { abilities: cardType.schema.abilities };
    if (cardType.schema.sections) {
      defaults["sections"] = { sections: cardType.schema.sections };
    }
    defaults["unit-metadata"] = { metadata: cardType.schema.metadata };
  } else {
    defaults["fields"] = { fields: cardType.schema.fields };
    if (cardType.schema.rules) {
      defaults["rules"] = { rules: cardType.schema.rules };
    }
    if (cardType.schema.keywords) {
      defaults["keywords"] = { keywords: cardType.schema.keywords };
    }
  }

  return defaults;
};

// --- Preset: Blank ---

/**
 * Creates a minimal blank schema preset with no predefined card types.
 * Users add their own card types from scratch.
 * @returns {DatasourceSchema}
 */
export const createBlankPreset = () => ({
  version: SCHEMA_VERSION,
  baseSystem: "blank",
  cardTypes: [],
});

// --- Validation ---

/**
 * Validation result object.
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the schema passed all checks
 * @property {string[]} errors - List of error messages (empty if valid)
 */

/**
 * Validates a field definition for correctness.
 * @param {object} field - The field definition to validate
 * @param {string} path - Dot-separated path for error messages
 * @returns {string[]} Array of error messages
 */
const validateFieldDefinition = (field, path) => {
  const errors = [];
  if (!field || typeof field !== "object") {
    errors.push(`${path}: must be an object`);
    return errors;
  }
  if (!field.key || typeof field.key !== "string") {
    errors.push(`${path}: missing or invalid "key" (must be a non-empty string)`);
  }
  if (!field.label || typeof field.label !== "string") {
    errors.push(`${path}: missing or invalid "label" (must be a non-empty string)`);
  }
  if (!field.type || !VALID_FIELD_TYPES.includes(field.type)) {
    errors.push(`${path}: invalid "type" "${field.type}" (must be one of ${VALID_FIELD_TYPES.join(", ")})`);
  }
  if (field.type === "enum") {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      errors.push(`${path}: enum field must have a non-empty "options" array`);
    }
  }
  if (field.displayOrder !== undefined && typeof field.displayOrder !== "number") {
    errors.push(`${path}: "displayOrder" must be a number`);
  }
  if (field.onValue !== undefined && typeof field.onValue !== "string") {
    errors.push(`${path}: "onValue" must be a string`);
  }
  if (field.offValue !== undefined && typeof field.offValue !== "string") {
    errors.push(`${path}: "offValue" must be a string`);
  }
  if (field.position !== undefined && !["left", "right", "above", "below"].includes(field.position)) {
    errors.push(`${path}: "position" must be "left", "right", "above", or "below"`);
  }
  if (field.size !== undefined && !["large", "small"].includes(field.size)) {
    errors.push(`${path}: "size" must be "large" or "small"`);
  }
  if (field.color !== undefined && typeof field.color !== "string") {
    errors.push(`${path}: "color" must be a string`);
  }
  if (field.display !== undefined && !VALID_COLUMN_DISPLAY_MODES.includes(field.display)) {
    errors.push(
      `${path}: invalid "display" "${field.display}" (must be one of ${VALID_COLUMN_DISPLAY_MODES.join(", ")})`,
    );
  }
  if (field.displayLabel !== undefined && typeof field.displayLabel !== "boolean") {
    errors.push(`${path}: "displayLabel" must be a boolean`);
  }
  if (field.visual !== undefined && !VALID_COLUMN_VISUAL_MODES.includes(field.visual)) {
    errors.push(`${path}: invalid "visual" "${field.visual}" (must be one of ${VALID_COLUMN_VISUAL_MODES.join(", ")})`);
  }
  return errors;
};

/**
 * Validates an array of field definitions, including duplicate key checks.
 * @param {object[]} fields - Array of field definitions
 * @param {string} path - Dot-separated path for error messages
 * @returns {string[]} Array of error messages
 */
const validateFieldArray = (fields, path) => {
  const errors = [];
  if (!Array.isArray(fields)) {
    errors.push(`${path}: must be an array`);
    return errors;
  }
  const keys = new Set();
  fields.forEach((field, i) => {
    errors.push(...validateFieldDefinition(field, `${path}[${i}]`));
    if (field?.key) {
      if (keys.has(field.key)) {
        errors.push(`${path}[${i}]: duplicate key "${field.key}"`);
      }
      keys.add(field.key);
    }
  });
  return errors;
};

/**
 * Validates a collection definition (rules, keywords).
 * @param {object} collection - The collection to validate
 * @param {string} path - Dot-separated path for error messages
 * @returns {string[]} Array of error messages
 */
const validateCollectionDefinition = (collection, path) => {
  const errors = [];
  if (!collection || typeof collection !== "object") {
    errors.push(`${path}: must be an object`);
    return errors;
  }
  if (!collection.label || typeof collection.label !== "string") {
    errors.push(`${path}: missing or invalid "label"`);
  }
  if (typeof collection.allowMultiple !== "boolean") {
    errors.push(`${path}: "allowMultiple" must be a boolean`);
  }
  errors.push(...validateFieldArray(collection.fields, `${path}.fields`));
  return errors;
};

/**
 * Validates a unit-type card schema.
 * @param {object} schema - The unit schema
 * @param {string} path - Dot-separated path for error messages
 * @returns {string[]} Array of error messages
 */
const validateUnitSchema = (schema, path) => {
  const errors = [];

  // Stats
  if (!schema.stats || typeof schema.stats !== "object") {
    errors.push(`${path}.stats: must be an object`);
  } else {
    if (!schema.stats.label || typeof schema.stats.label !== "string") {
      errors.push(`${path}.stats: missing or invalid "label"`);
    }
    if (typeof schema.stats.allowMultipleProfiles !== "boolean") {
      errors.push(`${path}.stats: "allowMultipleProfiles" must be a boolean`);
    }
    errors.push(...validateFieldArray(schema.stats.fields, `${path}.stats.fields`));
  }

  // Weapon types
  if (!schema.weaponTypes || typeof schema.weaponTypes !== "object") {
    errors.push(`${path}.weaponTypes: must be an object`);
  } else {
    if (!schema.weaponTypes.label || typeof schema.weaponTypes.label !== "string") {
      errors.push(`${path}.weaponTypes: missing or invalid "label"`);
    }
    if (typeof schema.weaponTypes.allowMultiple !== "boolean") {
      errors.push(`${path}.weaponTypes: "allowMultiple" must be a boolean`);
    }
    if (!Array.isArray(schema.weaponTypes.types)) {
      errors.push(`${path}.weaponTypes.types: must be an array`);
    } else {
      const weaponKeys = new Set();
      schema.weaponTypes.types.forEach((wt, i) => {
        const wtPath = `${path}.weaponTypes.types[${i}]`;
        if (!wt || typeof wt !== "object") {
          errors.push(`${wtPath}: must be an object`);
          return;
        }
        if (!wt.key || typeof wt.key !== "string") {
          errors.push(`${wtPath}: missing or invalid "key"`);
        }
        if (!wt.label || typeof wt.label !== "string") {
          errors.push(`${wtPath}: missing or invalid "label"`);
        }
        if (typeof wt.hasKeywords !== "boolean") {
          errors.push(`${wtPath}: "hasKeywords" must be a boolean`);
        }
        if (typeof wt.hasProfiles !== "boolean") {
          errors.push(`${wtPath}: "hasProfiles" must be a boolean`);
        }
        errors.push(...validateFieldArray(wt.columns, `${wtPath}.columns`));
        if (wt.key) {
          if (weaponKeys.has(wt.key)) {
            errors.push(`${wtPath}: duplicate weapon type key "${wt.key}"`);
          }
          weaponKeys.add(wt.key);
        }
      });
    }
  }

  // Abilities
  if (!schema.abilities || typeof schema.abilities !== "object") {
    errors.push(`${path}.abilities: must be an object`);
  } else {
    if (!schema.abilities.label || typeof schema.abilities.label !== "string") {
      errors.push(`${path}.abilities: missing or invalid "label"`);
    }
    if (!Array.isArray(schema.abilities.categories)) {
      errors.push(`${path}.abilities.categories: must be an array`);
    } else {
      const catKeys = new Set();
      schema.abilities.categories.forEach((cat, i) => {
        const catPath = `${path}.abilities.categories[${i}]`;
        if (!cat || typeof cat !== "object") {
          errors.push(`${catPath}: must be an object`);
          return;
        }
        if (!cat.key || typeof cat.key !== "string") {
          errors.push(`${catPath}: missing or invalid "key"`);
        }
        if (!cat.label || typeof cat.label !== "string") {
          errors.push(`${catPath}: missing or invalid "label"`);
        }
        if (!VALID_ABILITY_FORMATS.includes(cat.format)) {
          errors.push(
            `${catPath}: invalid "format" "${cat.format}" (must be one of ${VALID_ABILITY_FORMATS.join(", ")})`,
          );
        }
        if (cat.layout !== undefined && !VALID_ABILITY_LAYOUTS.includes(cat.layout)) {
          errors.push(
            `${catPath}: invalid "layout" "${cat.layout}" (must be one of ${VALID_ABILITY_LAYOUTS.join(", ")})`,
          );
        }
        if (cat.hasColor !== undefined && typeof cat.hasColor !== "boolean") {
          errors.push(`${catPath}: "hasColor" must be a boolean`);
        }
        if (cat.hasPhase !== undefined && typeof cat.hasPhase !== "boolean") {
          errors.push(`${catPath}: "hasPhase" must be a boolean`);
        }
        if (cat.key) {
          if (catKeys.has(cat.key)) {
            errors.push(`${catPath}: duplicate category key "${cat.key}"`);
          }
          catKeys.add(cat.key);
        }
      });
    }
  }

  // Sections (optional)
  if (schema.sections !== undefined) {
    if (!schema.sections || typeof schema.sections !== "object") {
      errors.push(`${path}.sections: must be an object`);
    } else {
      if (!schema.sections.label || typeof schema.sections.label !== "string") {
        errors.push(`${path}.sections: missing or invalid "label"`);
      }
      if (!Array.isArray(schema.sections.sections)) {
        errors.push(`${path}.sections.sections: must be an array`);
      } else {
        const sectionKeys = new Set();
        schema.sections.sections.forEach((section, i) => {
          const sPath = `${path}.sections.sections[${i}]`;
          if (!section || typeof section !== "object") {
            errors.push(`${sPath}: must be an object`);
            return;
          }
          if (!section.key || typeof section.key !== "string") {
            errors.push(`${sPath}: missing or invalid "key"`);
          }
          if (!section.label || typeof section.label !== "string") {
            errors.push(`${sPath}: missing or invalid "label"`);
          }
          if (!VALID_SECTION_FORMATS.includes(section.format)) {
            errors.push(
              `${sPath}: invalid "format" "${section.format}" (must be one of ${VALID_SECTION_FORMATS.join(", ")})`,
            );
          }
          if (section.key) {
            if (sectionKeys.has(section.key)) {
              errors.push(`${sPath}: duplicate section key "${section.key}"`);
            }
            sectionKeys.add(section.key);
          }
        });
      }
    }
  }

  // Metadata
  if (!schema.metadata || typeof schema.metadata !== "object") {
    errors.push(`${path}.metadata: must be an object`);
  } else {
    if (typeof schema.metadata.hasKeywords !== "boolean") {
      errors.push(`${path}.metadata: "hasKeywords" must be a boolean`);
    }
    if (typeof schema.metadata.hasFactionKeywords !== "boolean") {
      errors.push(`${path}.metadata: "hasFactionKeywords" must be a boolean`);
    }
    if (typeof schema.metadata.hasPoints !== "boolean") {
      errors.push(`${path}.metadata: "hasPoints" must be a boolean`);
    }
    if (!VALID_POINTS_FORMATS.includes(schema.metadata.pointsFormat)) {
      errors.push(
        `${path}.metadata: invalid "pointsFormat" "${schema.metadata.pointsFormat}" (must be one of ${VALID_POINTS_FORMATS.join(", ")})`,
      );
    }
  }

  return errors;
};

/**
 * Validates a rule-type card schema.
 * @param {object} schema - The rule schema
 * @param {string} path - Dot-separated path for error messages
 * @returns {string[]} Array of error messages
 */
const validateRuleSchema = (schema, path) => {
  const errors = [];
  errors.push(...validateFieldArray(schema.fields, `${path}.fields`));
  errors.push(...validateCollectionDefinition(schema.rules, `${path}.rules`));
  return errors;
};

/**
 * Validates an enhancement-type card schema.
 * @param {object} schema - The enhancement schema
 * @param {string} path - Dot-separated path for error messages
 * @returns {string[]} Array of error messages
 */
const validateEnhancementSchema = (schema, path) => {
  const errors = [];
  errors.push(...validateFieldArray(schema.fields, `${path}.fields`));
  errors.push(...validateCollectionDefinition(schema.keywords, `${path}.keywords`));
  return errors;
};

/**
 * Validates a stratagem-type card schema.
 * @param {object} schema - The stratagem schema
 * @param {string} path - Dot-separated path for error messages
 * @returns {string[]} Array of error messages
 */
const validateStratagemSchema = (schema, path) => {
  return validateFieldArray(schema.fields, `${path}.fields`);
};

/**
 * Validates a complete datasource schema for structural integrity.
 * Checks version, baseSystem, cardTypes, and all nested definitions.
 * @param {object} schema - The datasource schema to validate
 * @returns {ValidationResult} Result with valid flag and error list
 */
export const validateSchema = (schema) => {
  const errors = [];

  if (!schema || typeof schema !== "object") {
    return { valid: false, errors: ["Schema must be an object"] };
  }

  // Version
  if (!schema.version || typeof schema.version !== "string") {
    errors.push('Missing or invalid "version" (must be a non-empty string)');
  }

  // Base system
  if (!VALID_BASE_SYSTEMS.includes(schema.baseSystem)) {
    errors.push(`Invalid "baseSystem" "${schema.baseSystem}" (must be one of ${VALID_BASE_SYSTEMS.join(", ")})`);
  }

  // Card types
  if (!Array.isArray(schema.cardTypes)) {
    errors.push('"cardTypes" must be an array');
    return { valid: false, errors };
  }

  const cardTypeKeys = new Set();
  schema.cardTypes.forEach((ct, i) => {
    const ctPath = `cardTypes[${i}]`;

    if (!ct || typeof ct !== "object") {
      errors.push(`${ctPath}: must be an object`);
      return;
    }

    if (!ct.key || typeof ct.key !== "string") {
      errors.push(`${ctPath}: missing or invalid "key"`);
    }
    if (!ct.label || typeof ct.label !== "string") {
      errors.push(`${ctPath}: missing or invalid "label"`);
    }
    if (!VALID_BASE_TYPES.includes(ct.baseType)) {
      errors.push(`${ctPath}: invalid "baseType" "${ct.baseType}" (must be one of ${VALID_BASE_TYPES.join(", ")})`);
      return;
    }
    if (!ct.schema || typeof ct.schema !== "object") {
      errors.push(`${ctPath}: missing or invalid "schema"`);
      return;
    }

    // Duplicate key check
    if (ct.key) {
      if (cardTypeKeys.has(ct.key)) {
        errors.push(`${ctPath}: duplicate card type key "${ct.key}"`);
      }
      cardTypeKeys.add(ct.key);
    }

    // Type-specific validation
    const schemaPath = `${ctPath}.schema`;
    switch (ct.baseType) {
      case "unit":
        errors.push(...validateUnitSchema(ct.schema, schemaPath));
        break;
      case "rule":
        errors.push(...validateRuleSchema(ct.schema, schemaPath));
        break;
      case "enhancement":
        errors.push(...validateEnhancementSchema(ct.schema, schemaPath));
        break;
      case "stratagem":
        errors.push(...validateStratagemSchema(ct.schema, schemaPath));
        break;
    }
  });

  return { valid: errors.length === 0, errors };
};

// --- Migration Helpers ---

/**
 * Returns the default value for a given field type.
 * @param {FieldDefinition} fieldDef - The field definition
 * @returns {string | boolean} Default value for the field type
 */
export const getDefaultValueForType = (fieldDef) => {
  switch (fieldDef.type) {
    case "boolean":
      return false;
    case "enum":
      return fieldDef.options?.[0] ?? "";
    case "richtext":
    case "string":
    default:
      return "";
  }
};

/**
 * Migrates a flat object of field values from old field definitions to new ones.
 * Preserves values for fields present in both, adds defaults for new fields,
 * drops values for removed fields, and coerces values when types change.
 * @param {object} data - The source data object
 * @param {FieldDefinition[]} oldFields - Previous field definitions
 * @param {FieldDefinition[]} newFields - Updated field definitions
 * @returns {object} Migrated data with keys matching newFields
 */
const migrateFieldValues = (data, oldFields, newFields) => {
  const result = {};
  const oldFieldMap = new Map((oldFields || []).map((f) => [f.key, f]));

  for (const field of newFields) {
    if (data && field.key in data && oldFieldMap.has(field.key)) {
      const oldField = oldFieldMap.get(field.key);
      if (oldField.type === field.type) {
        // Same type — preserve value
        result[field.key] = data[field.key];
      } else if (field.type === "enum") {
        // Coerce to enum — keep if valid option, otherwise use default
        result[field.key] = field.options?.includes(data[field.key]) ? data[field.key] : getDefaultValueForType(field);
      } else if (field.type === "boolean") {
        result[field.key] = Boolean(data[field.key]);
      } else {
        // Coerce to string/richtext
        result[field.key] = data[field.key] != null ? String(data[field.key]) : getDefaultValueForType(field);
      }
    } else {
      // New field or not present in data — use default
      result[field.key] = getDefaultValueForType(field);
    }
  }

  return result;
};

/**
 * Migrates collection entries (e.g. rules[], keywords[]) from old to new field definitions.
 * @param {object[]} entries - Array of collection entry objects
 * @param {CollectionDefinition} oldCollection - Previous collection definition
 * @param {CollectionDefinition} newCollection - Updated collection definition
 * @returns {object[]} Migrated entries
 */
const migrateCollectionEntries = (entries, oldCollection, newCollection) => {
  if (!Array.isArray(entries) || !newCollection) return [];
  if (!oldCollection) return entries;
  return entries.map((entry) => migrateFieldValues(entry, oldCollection.fields || [], newCollection.fields || []));
};

/**
 * Detects whether a card type schema is a unit schema (has named sub-objects).
 * @param {object} schema - The card type schema
 * @returns {boolean}
 */
const isUnitSchema = (schema) => {
  return schema && typeof schema === "object" && "stats" in schema && "weaponTypes" in schema;
};

/**
 * Migrates a unit card's data to a new unit schema.
 * @param {object} card - Unit card data
 * @param {UnitSchema} oldSchema - Previous unit schema
 * @param {UnitSchema} newSchema - Updated unit schema
 * @returns {object} Migrated unit card data
 */
const migrateUnitCard = (card, oldSchema, newSchema) => {
  const result = {};

  // Migrate stat profiles
  if (newSchema.stats) {
    if (Array.isArray(card.stats)) {
      result.stats = card.stats.map((profile) =>
        migrateFieldValues(profile, oldSchema.stats?.fields || [], newSchema.stats.fields),
      );
    } else {
      result.stats = [];
    }
  }

  // Migrate weapons by weapon type key
  if (newSchema.weaponTypes) {
    result.weapons = {};
    const oldTypeMap = new Map((oldSchema.weaponTypes?.types || []).map((t) => [t.key, t]));

    for (const weaponType of newSchema.weaponTypes.types) {
      const oldType = oldTypeMap.get(weaponType.key);
      const existingWeapons = card.weapons?.[weaponType.key];

      if (Array.isArray(existingWeapons) && oldType) {
        result.weapons[weaponType.key] = existingWeapons.map((weapon) => {
          const migrated = migrateFieldValues(weapon, oldType.columns, weaponType.columns);
          // Preserve weapon name (always present, not a schema column)
          if ("name" in weapon) migrated.name = weapon.name;
          return migrated;
        });
      } else {
        result.weapons[weaponType.key] = [];
      }
    }
  }

  // Migrate abilities — filter to categories that still exist
  if (newSchema.abilities) {
    const newCategoryKeys = new Set(newSchema.abilities.categories.map((c) => c.key));
    result.abilities = Array.isArray(card.abilities)
      ? card.abilities.filter((a) => newCategoryKeys.has(a.category))
      : [];
  }

  // Migrate sections
  if (newSchema.sections?.sections) {
    const newSectionKeys = new Set(newSchema.sections.sections.map((s) => s.key));
    result.sections = {};
    for (const section of newSchema.sections.sections) {
      if (card.sections && section.key in card.sections) {
        result.sections[section.key] = card.sections[section.key];
      } else {
        result.sections[section.key] = [];
      }
    }
  }

  // Migrate metadata-driven fields
  if (newSchema.metadata) {
    if (newSchema.metadata.hasKeywords) {
      result.keywords = Array.isArray(card.keywords) ? [...card.keywords] : [];
    }
    if (newSchema.metadata.hasFactionKeywords) {
      result.factionKeywords = Array.isArray(card.factionKeywords) ? [...card.factionKeywords] : [];
    }
    if (newSchema.metadata.hasPoints) {
      result.points = card.points != null ? card.points : null;
    }
  }

  return result;
};

/**
 * Migrates a field-based card (rule, enhancement, stratagem) to a new schema.
 * @param {object} card - Card data
 * @param {RuleSchema | EnhancementSchema | StratagemSchema} oldSchema - Previous schema
 * @param {RuleSchema | EnhancementSchema | StratagemSchema} newSchema - Updated schema
 * @returns {object} Migrated card data
 */
const migrateFieldCard = (card, oldSchema, newSchema) => {
  const result = migrateFieldValues(card, oldSchema.fields || [], newSchema.fields || []);

  // Migrate known collection types
  const collectionKeys = ["rules", "keywords"];
  for (const key of collectionKeys) {
    if (newSchema[key]) {
      result[key] = migrateCollectionEntries(card[key], oldSchema[key], newSchema[key]);
    }
  }

  return result;
};

/**
 * Migrates card data when the schema definition changes.
 * Handles all base types: preserves data for unchanged fields,
 * adds defaults for new fields, drops data for removed fields,
 * and attempts type coercion for type changes.
 *
 * @param {object} card - The card data to migrate
 * @param {object} oldSchema - The previous card type schema (the `schema` property of a CardTypeDefinition)
 * @param {object} newSchema - The updated card type schema
 * @returns {object} Migrated card data conforming to newSchema
 */
export const migrateCardToSchema = (card, oldSchema, newSchema) => {
  if (!card || typeof card !== "object") return {};
  if (!newSchema || typeof newSchema !== "object") return { ...card };
  if (!oldSchema || typeof oldSchema !== "object") return { ...card };

  if (isUnitSchema(newSchema)) {
    return migrateUnitCard(card, oldSchema, newSchema);
  }
  return migrateFieldCard(card, oldSchema, newSchema);
};

// --- Preset: Warhammer 40K 10th Edition ---

/**
 * Creates a schema preset matching the Warhammer 40K 10th Edition format.
 * Includes card types for units, rules, enhancements, and stratagems.
 * @returns {DatasourceSchema}
 */
export const create40kPreset = () => ({
  version: SCHEMA_VERSION,
  baseSystem: "40k-10e",
  cardTypes: [
    {
      key: "unit",
      label: "Unit",
      baseType: "unit",
      schema: {
        stats: {
          label: "Stat Profiles",
          allowMultipleProfiles: true,
          fields: [
            createFieldDefinition({ key: "m", label: "M", type: "string", displayOrder: 1 }),
            createFieldDefinition({ key: "t", label: "T", type: "string", displayOrder: 2 }),
            createFieldDefinition({ key: "sv", label: "SV", type: "string", displayOrder: 3 }),
            createFieldDefinition({ key: "w", label: "W", type: "string", displayOrder: 4 }),
            createFieldDefinition({ key: "ld", label: "LD", type: "string", displayOrder: 5 }),
            createFieldDefinition({ key: "oc", label: "OC", type: "string", displayOrder: 6 }),
            createFieldDefinition({
              key: "inv",
              label: "INV",
              type: "string",
              displayOrder: 7,
              special: true,
              specialColor: "#5b21b6",
              hideWhenEmpty: true,
            }),
          ],
        },
        weaponTypes: {
          label: "Weapon Types",
          allowMultiple: true,
          types: [
            {
              key: "ranged",
              label: "Ranged Weapons",
              hasKeywords: true,
              hasProfiles: true,
              columns: [
                createFieldDefinition({ key: "range", label: "Range", type: "string" }),
                createFieldDefinition({ key: "a", label: "A", type: "string" }),
                createFieldDefinition({ key: "bs", label: "BS", type: "string" }),
                createFieldDefinition({ key: "s", label: "S", type: "string" }),
                createFieldDefinition({ key: "ap", label: "AP", type: "string" }),
                createFieldDefinition({ key: "d", label: "D", type: "string" }),
              ],
            },
            {
              key: "melee",
              label: "Melee Weapons",
              hasKeywords: true,
              hasProfiles: true,
              columns: [
                createFieldDefinition({ key: "range", label: "Range", type: "string" }),
                createFieldDefinition({ key: "a", label: "A", type: "string" }),
                createFieldDefinition({ key: "ws", label: "WS", type: "string" }),
                createFieldDefinition({ key: "s", label: "S", type: "string" }),
                createFieldDefinition({ key: "ap", label: "AP", type: "string" }),
                createFieldDefinition({ key: "d", label: "D", type: "string" }),
              ],
            },
          ],
        },
        abilities: {
          label: "Abilities",
          categories: [
            { key: "core", label: "Core", format: "name-only" },
            { key: "faction", label: "Faction", format: "name-description" },
            { key: "unit", label: "Unit Abilities", format: "name-description" },
            { key: "damaged", label: "Damaged", format: "name-description", header: "Damaged" },
          ],
        },
        sections: {
          label: "Sections",
          sections: [
            { key: "wargear-options", label: "Wargear Options", format: "list" },
            { key: "unit-composition", label: "Unit Composition", format: "list" },
            { key: "loadout", label: "Loadout", format: "richtext" },
          ],
        },
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: true,
          pointsFormat: "per-model",
        },
      },
    },
    {
      key: "rule",
      label: "Rule",
      baseType: "rule",
      schema: {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", type: "string" }),
          createFieldDefinition({ key: "ruleType", label: "Rule Type", type: "string" }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext" }),
        ],
        rules: createCollectionDefinition({
          label: "Rules",
          allowMultiple: true,
          fields: [
            createFieldDefinition({ key: "title", label: "Title", type: "string" }),
            createFieldDefinition({ key: "description", label: "Description", type: "richtext" }),
            createFieldDefinition({
              key: "format",
              label: "Format",
              type: "enum",
              options: ["name-description", "name-only", "table"],
            }),
          ],
        }),
      },
    },
    {
      key: "enhancement",
      label: "Enhancement",
      baseType: "enhancement",
      schema: {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", type: "string" }),
          createFieldDefinition({ key: "cost", label: "Cost", type: "string" }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext" }),
        ],
        keywords: createCollectionDefinition({
          label: "Keywords",
          allowMultiple: true,
          fields: [createFieldDefinition({ key: "keyword", label: "Keyword", type: "string" })],
        }),
      },
    },
    {
      key: "stratagem",
      label: "Stratagem",
      baseType: "stratagem",
      schema: {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", type: "string" }),
          createFieldDefinition({ key: "cost", label: "Cost", type: "string" }),
          createFieldDefinition({
            key: "phase",
            label: "Phase",
            type: "enum",
            required: true,
            options: ["command", "movement", "shooting", "charge", "fight", "any"],
          }),
          createFieldDefinition({ key: "type", label: "Stratagem Type", type: "string" }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext" }),
        ],
      },
    },
  ],
});
