import { describe, it, expect } from "vitest";
import { VERSION_CONFIG } from "../v3.2.0";

describe("Desktop WhatsNewWizard v3.2.0 config", () => {
  it("has version 3.2.0", () => {
    expect(VERSION_CONFIG.version).toBe("3.2.0");
  });

  it("has the correct release name", () => {
    expect(VERSION_CONFIG.releaseName).toBe("User Accounts & Cloud Sync");
  });

  it("has 6 steps", () => {
    expect(VERSION_CONFIG.steps).toHaveLength(6);
  });

  it("has unique keys for all steps", () => {
    const keys = VERSION_CONFIG.steps.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("has keys prefixed with 3.2.0-", () => {
    VERSION_CONFIG.steps.forEach((step) => {
      expect(step.key).toMatch(/^3\.2\.0-/);
    });
  });

  it("has title and component on every step", () => {
    VERSION_CONFIG.steps.forEach((step) => {
      expect(step.title).toBeTruthy();
      expect(step.component).toBeTruthy();
    });
  });

  it("marks the first step as welcome", () => {
    expect(VERSION_CONFIG.steps[0].isWelcome).toBe(true);
  });

  it("marks the last step as thankYou", () => {
    expect(VERSION_CONFIG.steps[VERSION_CONFIG.steps.length - 1].isThankYou).toBe(true);
  });

  it("does not have requiresPaidTier on any step", () => {
    VERSION_CONFIG.steps.forEach((step) => {
      expect(step.requiresPaidTier).toBeFalsy();
    });
  });

  it("has steps in the correct order", () => {
    const titles = VERSION_CONFIG.steps.map((s) => s.title);
    expect(titles).toEqual([
      "Welcome",
      "User Accounts",
      "Cloud Sync",
      "Sync Status & Limits",
      "Resolving Conflicts",
      "Thank You",
    ]);
  });
});
