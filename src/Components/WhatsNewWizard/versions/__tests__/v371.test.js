import { describe, it, expect } from "vitest";
import { VERSION_CONFIG } from "../v3.7.1";

describe("Desktop WhatsNewWizard v3.7.1 config", () => {
  it("has version 3.7.1", () => {
    expect(VERSION_CONFIG.version).toBe("3.7.1");
  });

  it("has the correct release name", () => {
    expect(VERSION_CONFIG.releaseName).toBe("Editor Help & Bug Fixes");
  });

  it("has at least 1 step", () => {
    expect(VERSION_CONFIG.steps.length).toBeGreaterThanOrEqual(1);
  });

  it("has unique keys for all steps", () => {
    const keys = VERSION_CONFIG.steps.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("has title and component on every step", () => {
    VERSION_CONFIG.steps.forEach((step) => {
      expect(step.title).toBeTruthy();
      expect(step.component).toBeTruthy();
    });
  });

  it("marks the last step as thankYou", () => {
    expect(VERSION_CONFIG.steps[VERSION_CONFIG.steps.length - 1].isThankYou).toBe(true);
  });
});
