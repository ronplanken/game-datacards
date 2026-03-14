import { useState, useCallback, useMemo } from "react";
import { WIZARD_MODES, BASE_TYPES, getWizardMode, resolveSteps } from "../constants";
import { getPresetStepDefaults } from "../../../Helpers/customSchema.helpers";

/**
 * Step IDs that carry type-specific state and should be reset
 * when the user changes their baseType selection.
 */
const TYPE_SPECIFIC_STEP_IDS = new Set([
  "stats",
  "weapons",
  "abilities",
  "sections",
  "unit-metadata",
  "fields",
  "rules",
  "keywords",
]);

/**
 * Checks whether a step's required data is satisfied based on stepData.
 *
 * @param {import('../constants').WizardStep} step - The step definition
 * @param {Object<string, object>} stepData - Accumulated data keyed by step id
 * @param {string|null} baseType - Currently selected baseType
 * @param {string[]} existingBaseTypes - Base types already defined in the existing datasource
 * @returns {boolean} Whether the user can proceed past this step
 */
const isStepValid = (step, stepData, baseType, existingBaseTypes) => {
  const data = stepData[step.id];

  switch (step.id) {
    case "metadata":
      return Boolean(data?.name?.trim());
    case "base-system":
      return Boolean(data?.baseSystem);
    case "card-type":
      return Boolean(baseType) && !existingBaseTypes.includes(baseType);
    case "review":
      return true;
    default:
      // Type-specific steps are valid by default (user can proceed without filling everything)
      return true;
  }
};

/**
 * Custom hook for managing DatasourceWizard state.
 *
 * Supports two wizard modes:
 * - `create`: Full flow — metadata -> base-system -> card-type -> [type-specific] -> review
 * - `add-card-type`: Shortened flow — card-type -> [type-specific] -> review
 *
 * The mode is derived from the presence of `existingDatasource`.
 *
 * @param {Object} options
 * @param {Object} [options.existingDatasource] - An existing datasource to add a card type to (triggers add-card-type mode)
 * @returns {Object} Wizard state and navigation actions
 */
export const useDatasourceWizard = ({ existingDatasource } = {}) => {
  const mode = useMemo(() => getWizardMode(existingDatasource), [existingDatasource]);

  // Core navigation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState("forward");
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Selected base type — drives step list recomputation
  const [baseType, setBaseType] = useState(null);

  // Per-step accumulated data, keyed by step id
  const [stepData, setStepData] = useState({});

  // Resolve step list based on mode and current baseType
  const steps = useMemo(() => resolveSteps(mode, baseType), [mode, baseType]);

  // Derived values
  const currentStep = steps[currentStepIndex] || steps[0];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  /**
   * Get the base types that are already defined in the existing datasource.
   * Only relevant in add-card-type mode.
   */
  const existingBaseTypes = useMemo(() => {
    if (mode !== WIZARD_MODES.ADD_CARD_TYPE || !existingDatasource?.schema?.cardTypes) {
      return [];
    }
    return existingDatasource.schema.cardTypes.map((ct) => ct.baseType);
  }, [mode, existingDatasource]);

  /**
   * The base types available for selection, excluding those already
   * defined in the existing datasource (add-card-type mode only).
   */
  const availableBaseTypes = useMemo(() => {
    const all = Object.values(BASE_TYPES);
    if (existingBaseTypes.length === 0) return all;
    return all.filter((bt) => !existingBaseTypes.includes(bt));
  }, [existingBaseTypes]);

  // Per-step validation
  const canProceed = useMemo(() => {
    if (!currentStep) return false;
    return isStepValid(currentStep, stepData, baseType, existingBaseTypes);
  }, [currentStep, stepData, baseType, existingBaseTypes]);

  /**
   * Update data for a specific step.
   */
  const updateStepData = useCallback((stepId, data) => {
    setStepData((prev) => ({
      ...prev,
      [stepId]: typeof data === "function" ? data(prev[stepId]) : data,
    }));
  }, []);

  /**
   * Change the selected baseType. Resets type-specific step data and
   * adjusts currentStepIndex if the step list shrinks.
   * In add-card-type mode, rejects base types that already exist.
   */
  const changeBaseType = useCallback(
    (newBaseType) => {
      if (newBaseType === baseType) return;
      if (existingBaseTypes.includes(newBaseType)) return;

      // Reset type-specific data and seed with preset defaults
      setStepData((prev) => {
        const next = {};
        for (const key of Object.keys(prev)) {
          if (!TYPE_SPECIFIC_STEP_IDS.has(key)) {
            next[key] = prev[key];
          }
        }

        // Seed preset defaults based on selected base system
        const baseSystem = prev["base-system"]?.baseSystem || existingDatasource?.schema?.baseSystem;
        const presetDefaults = getPresetStepDefaults(baseSystem, newBaseType);
        if (presetDefaults) {
          Object.assign(next, presetDefaults);
        }

        return next;
      });

      // Clear completed steps for type-specific steps
      setCompletedSteps((prev) => {
        const next = new Set();
        for (const idx of prev) {
          const step = steps[idx];
          if (step && !TYPE_SPECIFIC_STEP_IDS.has(step.id)) {
            next.add(idx);
          }
        }
        return next;
      });

      setBaseType(newBaseType);
    },
    [baseType, existingBaseTypes, steps],
  );

  /**
   * Navigate to a specific step index.
   */
  const goToStep = useCallback(
    (stepIndex, direction = null) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return;

      const targetDirection = direction || (stepIndex > currentStepIndex ? "forward" : "backward");
      setTransitionDirection(targetDirection);

      // Mark current step as completed when moving forward
      if (stepIndex > currentStepIndex) {
        setCompletedSteps((prev) => new Set([...prev, currentStepIndex]));
      }

      setCurrentStepIndex(stepIndex);
    },
    [currentStepIndex, steps.length],
  );

  /**
   * Navigate to the next step.
   */
  const goNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1 && canProceed) {
      goToStep(currentStepIndex + 1, "forward");
    }
  }, [currentStepIndex, steps.length, canProceed, goToStep]);

  /**
   * Navigate to the previous step.
   */
  const goPrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1, "backward");
    }
  }, [currentStepIndex, goToStep]);

  /**
   * Assemble the final result from accumulated step data.
   * In create mode: returns a full datasource schema object.
   * In add-card-type mode: returns a single card type entry.
   */
  const assembleResult = useCallback(() => {
    const cardTypeData = stepData["card-type"] || {};
    const key = cardTypeData.key || baseType;
    const label = cardTypeData.label || baseType;

    // Build the card type schema based on baseType
    let cardTypeSchema = {};

    if (baseType === "unit") {
      cardTypeSchema = {
        stats: stepData["stats"]?.stats || { label: "Stats", allowMultipleProfiles: false, fields: [] },
        weaponTypes: stepData["weapons"]?.weaponTypes || { label: "Weapon Types", allowMultiple: true, types: [] },
        abilities: stepData["abilities"]?.abilities || {
          label: "Abilities",
          categories: [],
        },
        ...(stepData["sections"]?.sections ? { sections: stepData["sections"].sections } : {}),
        metadata: stepData["unit-metadata"]?.metadata || {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: false,
          pointsFormat: "per-model",
        },
      };
    } else {
      cardTypeSchema = { fields: stepData["fields"]?.fields || [] };

      if (baseType === "rule" && stepData["rules"]?.rules) {
        cardTypeSchema.rules = stepData["rules"].rules;
      }
      if (baseType === "enhancement" && stepData["keywords"]?.keywords) {
        cardTypeSchema.keywords = stepData["keywords"].keywords;
      }
    }

    const cardTypeEntry = {
      key,
      label,
      baseType,
      schema: cardTypeSchema,
    };

    if (mode === WIZARD_MODES.ADD_CARD_TYPE) {
      return cardTypeEntry;
    }

    // Full datasource schema
    const metadata = stepData["metadata"] || {};
    const baseSystemData = stepData["base-system"] || {};

    return {
      name: metadata.name || "",
      version: metadata.version || "1.0.0",
      author: metadata.author || "",
      schema: {
        version: "1.0.0",
        baseSystem: baseSystemData.baseSystem || "blank",
        cardTypes: [cardTypeEntry],
      },
    };
  }, [mode, baseType, stepData]);

  return {
    // Mode
    mode,

    // Navigation state
    currentStepIndex,
    currentStep,
    steps,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    completedSteps,
    transitionDirection,
    canProceed,

    // Navigation actions
    goToStep,
    goNext,
    goPrevious,

    // Base type
    baseType,
    changeBaseType,
    existingBaseTypes,
    availableBaseTypes,

    // Step data
    stepData,
    updateStepData,

    // Result
    assembleResult,
  };
};
