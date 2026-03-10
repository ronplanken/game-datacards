import { describe, it, expect } from "vitest";
import {
  WIZARD_MODES,
  getWizardMode,
  BASE_TYPES,
  CREATION_STEPS,
  CARD_TYPE_STEP,
  REVIEW_STEP,
  TYPE_SPECIFIC_STEPS,
  resolveSteps,
} from "../constants";

describe("DatasourceWizard constants", () => {
  describe("WIZARD_MODES", () => {
    it("defines create mode", () => {
      expect(WIZARD_MODES.CREATE).toBe("create");
    });

    it("defines add-card-type mode", () => {
      expect(WIZARD_MODES.ADD_CARD_TYPE).toBe("add-card-type");
    });

    it("is frozen (immutable)", () => {
      expect(Object.isFrozen(WIZARD_MODES)).toBe(true);
    });
  });

  describe("getWizardMode", () => {
    it("returns CREATE when no existing datasource is provided", () => {
      expect(getWizardMode(null)).toBe(WIZARD_MODES.CREATE);
      expect(getWizardMode(undefined)).toBe(WIZARD_MODES.CREATE);
    });

    it("returns ADD_CARD_TYPE when an existing datasource is provided", () => {
      const existingDatasource = { name: "Test", schema: { cardTypes: [] } };
      expect(getWizardMode(existingDatasource)).toBe(WIZARD_MODES.ADD_CARD_TYPE);
    });

    it("returns CREATE for other falsy values", () => {
      expect(getWizardMode(false)).toBe(WIZARD_MODES.CREATE);
      expect(getWizardMode(0)).toBe(WIZARD_MODES.CREATE);
      expect(getWizardMode("")).toBe(WIZARD_MODES.CREATE);
    });

    it("returns ADD_CARD_TYPE for any truthy value", () => {
      expect(getWizardMode({})).toBe(WIZARD_MODES.ADD_CARD_TYPE);
      expect(getWizardMode({ name: "My DS" })).toBe(WIZARD_MODES.ADD_CARD_TYPE);
    });
  });

  describe("BASE_TYPES", () => {
    it("defines all four base types", () => {
      expect(BASE_TYPES.UNIT).toBe("unit");
      expect(BASE_TYPES.RULE).toBe("rule");
      expect(BASE_TYPES.ENHANCEMENT).toBe("enhancement");
      expect(BASE_TYPES.STRATAGEM).toBe("stratagem");
    });

    it("is frozen (immutable)", () => {
      expect(Object.isFrozen(BASE_TYPES)).toBe(true);
    });
  });

  describe("CREATION_STEPS", () => {
    it("contains metadata and base-system steps in order", () => {
      expect(CREATION_STEPS).toHaveLength(2);
      expect(CREATION_STEPS[0].id).toBe("metadata");
      expect(CREATION_STEPS[1].id).toBe("base-system");
    });

    it("marks both steps as required", () => {
      expect(CREATION_STEPS[0].required).toBe(true);
      expect(CREATION_STEPS[1].required).toBe(true);
    });

    it("is frozen (immutable)", () => {
      expect(Object.isFrozen(CREATION_STEPS)).toBe(true);
    });
  });

  describe("CARD_TYPE_STEP", () => {
    it("has correct id and is required", () => {
      expect(CARD_TYPE_STEP.id).toBe("card-type");
      expect(CARD_TYPE_STEP.required).toBe(true);
    });

    it("is frozen (immutable)", () => {
      expect(Object.isFrozen(CARD_TYPE_STEP)).toBe(true);
    });
  });

  describe("REVIEW_STEP", () => {
    it("has correct id and is not required", () => {
      expect(REVIEW_STEP.id).toBe("review");
      expect(REVIEW_STEP.required).toBe(false);
    });

    it("is frozen (immutable)", () => {
      expect(Object.isFrozen(REVIEW_STEP)).toBe(true);
    });
  });

  describe("TYPE_SPECIFIC_STEPS", () => {
    it("defines steps for all four base types", () => {
      expect(TYPE_SPECIFIC_STEPS).toHaveProperty("unit");
      expect(TYPE_SPECIFIC_STEPS).toHaveProperty("rule");
      expect(TYPE_SPECIFIC_STEPS).toHaveProperty("enhancement");
      expect(TYPE_SPECIFIC_STEPS).toHaveProperty("stratagem");
    });

    it("unit has stats -> weapons -> abilities -> unit-metadata", () => {
      const ids = TYPE_SPECIFIC_STEPS.unit.map((s) => s.id);
      expect(ids).toEqual(["stats", "weapons", "abilities", "unit-metadata"]);
    });

    it("rule has fields -> rules", () => {
      const ids = TYPE_SPECIFIC_STEPS.rule.map((s) => s.id);
      expect(ids).toEqual(["fields", "rules"]);
    });

    it("enhancement has fields -> keywords", () => {
      const ids = TYPE_SPECIFIC_STEPS.enhancement.map((s) => s.id);
      expect(ids).toEqual(["fields", "keywords"]);
    });

    it("stratagem has fields only", () => {
      const ids = TYPE_SPECIFIC_STEPS.stratagem.map((s) => s.id);
      expect(ids).toEqual(["fields"]);
    });

    it("is frozen (immutable)", () => {
      expect(Object.isFrozen(TYPE_SPECIFIC_STEPS)).toBe(true);
      expect(Object.isFrozen(TYPE_SPECIFIC_STEPS.unit)).toBe(true);
      expect(Object.isFrozen(TYPE_SPECIFIC_STEPS.rule)).toBe(true);
      expect(Object.isFrozen(TYPE_SPECIFIC_STEPS.enhancement)).toBe(true);
      expect(Object.isFrozen(TYPE_SPECIFIC_STEPS.stratagem)).toBe(true);
    });

    it("every step has id, title, and required properties", () => {
      Object.values(TYPE_SPECIFIC_STEPS)
        .flat()
        .forEach((step) => {
          expect(step).toHaveProperty("id");
          expect(step).toHaveProperty("title");
          expect(step).toHaveProperty("required");
          expect(typeof step.id).toBe("string");
          expect(typeof step.title).toBe("string");
          expect(typeof step.required).toBe("boolean");
        });
    });
  });

  describe("resolveSteps", () => {
    describe("create mode", () => {
      it("returns creation prefix + card-type + review when no baseType selected", () => {
        const steps = resolveSteps(WIZARD_MODES.CREATE, null);
        const ids = steps.map((s) => s.id);
        expect(ids).toEqual(["metadata", "base-system", "card-type", "review"]);
      });

      it("includes unit-specific steps between card-type and review", () => {
        const steps = resolveSteps(WIZARD_MODES.CREATE, "unit");
        const ids = steps.map((s) => s.id);
        expect(ids).toEqual([
          "metadata",
          "base-system",
          "card-type",
          "stats",
          "weapons",
          "abilities",
          "unit-metadata",
          "review",
        ]);
      });

      it("includes rule-specific steps between card-type and review", () => {
        const steps = resolveSteps(WIZARD_MODES.CREATE, "rule");
        const ids = steps.map((s) => s.id);
        expect(ids).toEqual(["metadata", "base-system", "card-type", "fields", "rules", "review"]);
      });

      it("includes enhancement-specific steps between card-type and review", () => {
        const steps = resolveSteps(WIZARD_MODES.CREATE, "enhancement");
        const ids = steps.map((s) => s.id);
        expect(ids).toEqual(["metadata", "base-system", "card-type", "fields", "keywords", "review"]);
      });

      it("includes stratagem-specific steps between card-type and review", () => {
        const steps = resolveSteps(WIZARD_MODES.CREATE, "stratagem");
        const ids = steps.map((s) => s.id);
        expect(ids).toEqual(["metadata", "base-system", "card-type", "fields", "review"]);
      });
    });

    describe("add-card-type mode", () => {
      it("skips creation steps when no baseType selected", () => {
        const steps = resolveSteps(WIZARD_MODES.ADD_CARD_TYPE, null);
        const ids = steps.map((s) => s.id);
        expect(ids).toEqual(["card-type", "review"]);
      });

      it("includes unit-specific steps without creation prefix", () => {
        const steps = resolveSteps(WIZARD_MODES.ADD_CARD_TYPE, "unit");
        const ids = steps.map((s) => s.id);
        expect(ids).toEqual(["card-type", "stats", "weapons", "abilities", "unit-metadata", "review"]);
      });

      it("includes rule-specific steps without creation prefix", () => {
        const steps = resolveSteps(WIZARD_MODES.ADD_CARD_TYPE, "rule");
        const ids = steps.map((s) => s.id);
        expect(ids).toEqual(["card-type", "fields", "rules", "review"]);
      });
    });

    it("handles unknown baseType by returning no type-specific steps", () => {
      const steps = resolveSteps(WIZARD_MODES.CREATE, "unknown-type");
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(["metadata", "base-system", "card-type", "review"]);
    });

    it("always ends with the review step", () => {
      const allCombinations = [
        [WIZARD_MODES.CREATE, null],
        [WIZARD_MODES.CREATE, "unit"],
        [WIZARD_MODES.CREATE, "rule"],
        [WIZARD_MODES.CREATE, "enhancement"],
        [WIZARD_MODES.CREATE, "stratagem"],
        [WIZARD_MODES.ADD_CARD_TYPE, null],
        [WIZARD_MODES.ADD_CARD_TYPE, "unit"],
      ];

      allCombinations.forEach(([mode, baseType]) => {
        const steps = resolveSteps(mode, baseType);
        expect(steps[steps.length - 1].id).toBe("review");
      });
    });

    it("always starts with card-type step in add-card-type mode", () => {
      const steps = resolveSteps(WIZARD_MODES.ADD_CARD_TYPE, "unit");
      expect(steps[0].id).toBe("card-type");
    });

    it("always starts with metadata step in create mode", () => {
      const steps = resolveSteps(WIZARD_MODES.CREATE, "unit");
      expect(steps[0].id).toBe("metadata");
    });
  });
});
