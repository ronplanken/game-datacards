import { describe, it, expect } from "vitest";
import { MOBILE_VERSION_CONFIG } from "../v3.2.0";

describe("Mobile WhatsNewWizard v3.2.0 config", () => {
  it("has version 3.2.0", () => {
    expect(MOBILE_VERSION_CONFIG.version).toBe("3.2.0");
  });

  it("has the updated release name", () => {
    expect(MOBILE_VERSION_CONFIG.releaseName).toBe("Accounts & Cloud Sync");
  });

  it("has 5 steps", () => {
    expect(MOBILE_VERSION_CONFIG.steps).toHaveLength(5);
  });

  it("has unique keys for all steps", () => {
    const keys = MOBILE_VERSION_CONFIG.steps.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("marks the first step as welcome", () => {
    expect(MOBILE_VERSION_CONFIG.steps[0].isWelcome).toBe(true);
  });

  it("marks the last step as thankYou", () => {
    expect(MOBILE_VERSION_CONFIG.steps[MOBILE_VERSION_CONFIG.steps.length - 1].isThankYou).toBe(true);
  });

  it("has requiresPaidTier only on the premium step", () => {
    const paidSteps = MOBILE_VERSION_CONFIG.steps.filter((s) => s.requiresPaidTier);
    expect(paidSteps).toHaveLength(1);
    expect(paidSteps[0].key).toBe("3.2.0-premium");
  });

  it("has steps in the correct order", () => {
    const titles = MOBILE_VERSION_CONFIG.steps.map((s) => s.title);
    expect(titles).toEqual(["Welcome", "Premium Features", "Cloud Sync", "Conflicts", "Thank You"]);
  });
});
