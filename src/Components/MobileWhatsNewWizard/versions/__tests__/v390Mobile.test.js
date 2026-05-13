import { describe, it, expect } from "vitest";
import { MOBILE_VERSION_CONFIG } from "../v3.9.0";

describe("Mobile WhatsNewWizard v3.9.0 config", () => {
  it("has version 3.9.0", () => {
    expect(MOBILE_VERSION_CONFIG.version).toBe("3.9.0");
  });

  it("has the correct release name", () => {
    expect(MOBILE_VERSION_CONFIG.releaseName).toBe("Keyword Glossary");
  });

  it("has at least 1 step", () => {
    expect(MOBILE_VERSION_CONFIG.steps.length).toBeGreaterThanOrEqual(1);
  });

  it("has unique keys for all steps", () => {
    const keys = MOBILE_VERSION_CONFIG.steps.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("has title and component on every step", () => {
    MOBILE_VERSION_CONFIG.steps.forEach((step) => {
      expect(step.title).toBeTruthy();
      expect(step.component).toBeTruthy();
    });
  });

  it("marks the last step as thankYou", () => {
    expect(MOBILE_VERSION_CONFIG.steps[MOBILE_VERSION_CONFIG.steps.length - 1].isThankYou).toBe(true);
  });
});
