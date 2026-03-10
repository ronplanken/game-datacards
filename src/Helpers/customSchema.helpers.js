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
