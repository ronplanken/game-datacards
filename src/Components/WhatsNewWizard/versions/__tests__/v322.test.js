import { describe, it, expect } from "vitest";
import { VERSION_CONFIG } from "../v3.2.2";

describe("Desktop WhatsNewWizard v3.2.2 config", () => {
  it("has version 3.2.2", () => {
    expect(VERSION_CONFIG.version).toBe("3.2.2");
  });

  it("has the correct release name", () => {
    expect(VERSION_CONFIG.releaseName).toBe("Sharing, Rebuilt");
  });

  it("has 1 step", () => {
    expect(VERSION_CONFIG.steps).toHaveLength(1);
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

  it("marks the step as thankYou", () => {
    expect(VERSION_CONFIG.steps[0].isThankYou).toBe(true);
  });
});
