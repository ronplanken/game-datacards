import { describe, it, expect } from "vitest";
import { WIZARD_MODES, getWizardMode } from "../constants";

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
});
