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
