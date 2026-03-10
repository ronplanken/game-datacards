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

// Valid points formats
export const VALID_POINTS_FORMATS = ["per-model", "per-unit"];

// Schema version
export const SCHEMA_VERSION = "1.0.0";

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
 * @property {boolean} [required] - Whether the field is required
 * @property {string[]} [options] - Valid options when type is "enum"
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
 */

/**
 * Abilities section for unit card types.
 * @typedef {Object} AbilitiesDefinition
 * @property {string} label - Section label
 * @property {AbilityCategoryDefinition[]} categories - Ability category definitions
 * @property {boolean} hasInvulnerableSave - Whether the card type supports invulnerable saves
 * @property {boolean} hasDamagedAbility - Whether the card type supports damaged abilities
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
 * @param {boolean} [overrides.required] - Whether required
 * @param {number} [overrides.displayOrder] - Display order
 * @param {string[]} [overrides.options] - Enum options
 * @returns {FieldDefinition}
 */
export const createFieldDefinition = ({ key, label, type = "string", required, displayOrder, options }) => {
  const field = { key, label, type };
  if (displayOrder !== undefined) field.displayOrder = displayOrder;
  if (required !== undefined) field.required = required;
  if (type === "enum" && options) field.options = [...options];
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
            createFieldDefinition({ key: "move", label: "Move", type: "string", displayOrder: 1 }),
            createFieldDefinition({ key: "save", label: "Save", type: "string", displayOrder: 2 }),
            createFieldDefinition({ key: "control", label: "Control", type: "string", displayOrder: 3 }),
            createFieldDefinition({ key: "health", label: "Health", type: "string", displayOrder: 4 }),
            createFieldDefinition({ key: "ward", label: "Ward", type: "string", displayOrder: 5 }),
            createFieldDefinition({ key: "wizard", label: "Wizard", type: "string", displayOrder: 6 }),
            createFieldDefinition({ key: "priest", label: "Priest", type: "string", displayOrder: 7 }),
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
                createFieldDefinition({ key: "range", label: "Range", type: "string", required: true }),
                createFieldDefinition({ key: "attacks", label: "Atk", type: "string", required: true }),
                createFieldDefinition({ key: "hit", label: "Hit", type: "string", required: true }),
                createFieldDefinition({ key: "wound", label: "Wnd", type: "string", required: true }),
                createFieldDefinition({ key: "rend", label: "Rend", type: "string", required: true }),
                createFieldDefinition({ key: "damage", label: "Dmg", type: "string", required: true }),
              ],
            },
            {
              key: "melee",
              label: "Melee Weapons",
              hasKeywords: true,
              hasProfiles: false,
              columns: [
                createFieldDefinition({ key: "attacks", label: "Atk", type: "string", required: true }),
                createFieldDefinition({ key: "hit", label: "Hit", type: "string", required: true }),
                createFieldDefinition({ key: "wound", label: "Wnd", type: "string", required: true }),
                createFieldDefinition({ key: "rend", label: "Rend", type: "string", required: true }),
                createFieldDefinition({ key: "damage", label: "Dmg", type: "string", required: true }),
              ],
            },
          ],
        },
        abilities: {
          label: "Abilities",
          categories: [{ key: "abilities", label: "Abilities", format: "name-description" }],
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
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
          createFieldDefinition({ key: "name", label: "Name", type: "string", required: true }),
          createFieldDefinition({ key: "castingValue", label: "Casting Value", type: "string", required: false }),
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
            createFieldDefinition({ key: "declare", label: "Declare", type: "richtext", required: false }),
            createFieldDefinition({ key: "effect", label: "Effect", type: "richtext", required: true }),
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
          createFieldDefinition({ key: "name", label: "Name", type: "string", required: true }),
          createFieldDefinition({ key: "cost", label: "Cost", type: "string", required: false }),
          createFieldDefinition({
            key: "type",
            label: "Type",
            type: "enum",
            required: true,
            options: ["heroic-trait", "artefact", "prayer", "spell-lore"],
          }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext", required: true }),
        ],
        keywords: createCollectionDefinition({
          label: "Keywords",
          allowMultiple: true,
          fields: [createFieldDefinition({ key: "keyword", label: "Keyword", type: "string", required: true })],
        }),
      },
    },
    {
      key: "battle-tactic",
      label: "Battle Tactic",
      baseType: "stratagem",
      schema: {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", type: "string", required: true }),
          createFieldDefinition({
            key: "type",
            label: "Type",
            type: "enum",
            required: true,
            options: ["battle-tactic", "grand-strategy"],
          }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext", required: true }),
        ],
      },
    },
  ],
});

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
  if (field.required !== undefined && typeof field.required !== "boolean") {
    errors.push(`${path}: "required" must be a boolean`);
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
    if (typeof schema.abilities.hasInvulnerableSave !== "boolean") {
      errors.push(`${path}.abilities: "hasInvulnerableSave" must be a boolean`);
    }
    if (typeof schema.abilities.hasDamagedAbility !== "boolean") {
      errors.push(`${path}.abilities: "hasDamagedAbility" must be a boolean`);
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
        if (cat.key) {
          if (catKeys.has(cat.key)) {
            errors.push(`${catPath}: duplicate category key "${cat.key}"`);
          }
          catKeys.add(cat.key);
        }
      });
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
                createFieldDefinition({ key: "range", label: "Range", type: "string", required: true }),
                createFieldDefinition({ key: "a", label: "A", type: "string", required: true }),
                createFieldDefinition({ key: "bs", label: "BS", type: "string", required: true }),
                createFieldDefinition({ key: "s", label: "S", type: "string", required: true }),
                createFieldDefinition({ key: "ap", label: "AP", type: "string", required: true }),
                createFieldDefinition({ key: "d", label: "D", type: "string", required: true }),
              ],
            },
            {
              key: "melee",
              label: "Melee Weapons",
              hasKeywords: true,
              hasProfiles: true,
              columns: [
                createFieldDefinition({ key: "range", label: "Range", type: "string", required: true }),
                createFieldDefinition({ key: "a", label: "A", type: "string", required: true }),
                createFieldDefinition({ key: "ws", label: "WS", type: "string", required: true }),
                createFieldDefinition({ key: "s", label: "S", type: "string", required: true }),
                createFieldDefinition({ key: "ap", label: "AP", type: "string", required: true }),
                createFieldDefinition({ key: "d", label: "D", type: "string", required: true }),
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
          ],
          hasInvulnerableSave: true,
          hasDamagedAbility: true,
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
          createFieldDefinition({ key: "name", label: "Name", type: "string", required: true }),
          createFieldDefinition({ key: "ruleType", label: "Rule Type", type: "string", required: true }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext", required: false }),
        ],
        rules: createCollectionDefinition({
          label: "Rules",
          allowMultiple: true,
          fields: [
            createFieldDefinition({ key: "title", label: "Title", type: "string", required: true }),
            createFieldDefinition({ key: "description", label: "Description", type: "richtext", required: true }),
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
          createFieldDefinition({ key: "name", label: "Name", type: "string", required: true }),
          createFieldDefinition({ key: "cost", label: "Cost", type: "string", required: true }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext", required: true }),
        ],
        keywords: createCollectionDefinition({
          label: "Keywords",
          allowMultiple: true,
          fields: [createFieldDefinition({ key: "keyword", label: "Keyword", type: "string", required: true })],
        }),
      },
    },
    {
      key: "stratagem",
      label: "Stratagem",
      baseType: "stratagem",
      schema: {
        fields: [
          createFieldDefinition({ key: "name", label: "Name", type: "string", required: true }),
          createFieldDefinition({ key: "cost", label: "Cost", type: "string", required: true }),
          createFieldDefinition({
            key: "phase",
            label: "Phase",
            type: "enum",
            required: true,
            options: ["command", "movement", "shooting", "charge", "fight", "any"],
          }),
          createFieldDefinition({ key: "type", label: "Stratagem Type", type: "string", required: true }),
          createFieldDefinition({ key: "description", label: "Description", type: "richtext", required: true }),
        ],
      },
    },
  ],
});
