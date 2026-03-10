/**
 * Wizard mode constants.
 *
 * @readonly
 * @enum {string}
 */
export const WIZARD_MODES = Object.freeze({
  /** Full creation flow: metadata -> base-system -> card-type -> [type-specific] -> review */
  CREATE: "create",
  /** Add a card type to an existing datasource: card-type -> [type-specific] -> review */
  ADD_CARD_TYPE: "add-card-type",
});

/**
 * Derive the wizard mode from the presence of an existing datasource.
 *
 * @param {object|null|undefined} existingDatasource - An existing datasource object, or falsy for creation.
 * @returns {string} One of {@link WIZARD_MODES}.
 */
export const getWizardMode = (existingDatasource) => {
  return existingDatasource ? WIZARD_MODES.ADD_CARD_TYPE : WIZARD_MODES.CREATE;
};

/**
 * Base type constants for card types.
 *
 * @readonly
 * @enum {string}
 */
export const BASE_TYPES = Object.freeze({
  UNIT: "unit",
  RULE: "rule",
  ENHANCEMENT: "enhancement",
  STRATAGEM: "stratagem",
});

/**
 * @typedef {Object} WizardStep
 * @property {string} id - Unique step identifier
 * @property {string} title - Human-readable step title
 * @property {boolean} required - Whether the step must be completed before proceeding
 */

/**
 * Steps shared across all creation flows. These appear at the beginning
 * of the wizard in `create` mode only (skipped in `add-card-type` mode).
 *
 * @type {WizardStep[]}
 */
export const CREATION_STEPS = Object.freeze([
  { id: "metadata", title: "Datasource Info", required: true },
  { id: "base-system", title: "Base System", required: true },
]);

/**
 * The card-type selection step, shared by both wizard modes.
 *
 * @type {WizardStep}
 */
export const CARD_TYPE_STEP = Object.freeze({ id: "card-type", title: "Card Type", required: true });

/**
 * The final review step, shared by both wizard modes.
 *
 * @type {WizardStep}
 */
export const REVIEW_STEP = Object.freeze({ id: "review", title: "Review", required: false });

/**
 * Type-specific step sequences, keyed by `baseType`.
 * These are inserted between the card-type step and the review step.
 *
 * @type {Object<string, WizardStep[]>}
 */
export const TYPE_SPECIFIC_STEPS = Object.freeze({
  [BASE_TYPES.UNIT]: Object.freeze([
    { id: "stats", title: "Stats", required: true },
    { id: "weapons", title: "Weapons", required: true },
    { id: "abilities", title: "Abilities", required: true },
    { id: "unit-metadata", title: "Unit Metadata", required: false },
  ]),
  [BASE_TYPES.RULE]: Object.freeze([
    { id: "fields", title: "Fields", required: true },
    { id: "rules", title: "Rules", required: false },
  ]),
  [BASE_TYPES.ENHANCEMENT]: Object.freeze([
    { id: "fields", title: "Fields", required: true },
    { id: "keywords", title: "Keywords", required: false },
  ]),
  [BASE_TYPES.STRATAGEM]: Object.freeze([{ id: "fields", title: "Fields", required: true }]),
});

/**
 * Resolve the full ordered step list for a given wizard mode and base type.
 *
 * @param {string} mode - One of {@link WIZARD_MODES}.
 * @param {string|null} baseType - The selected baseType, or null if not yet chosen.
 * @returns {WizardStep[]} The ordered list of steps for this wizard configuration.
 */
export const resolveSteps = (mode, baseType) => {
  const prefix = mode === WIZARD_MODES.CREATE ? [...CREATION_STEPS, CARD_TYPE_STEP] : [CARD_TYPE_STEP];
  const typeSteps = baseType && TYPE_SPECIFIC_STEPS[baseType] ? [...TYPE_SPECIFIC_STEPS[baseType]] : [];
  return [...prefix, ...typeSteps, REVIEW_STEP];
};
