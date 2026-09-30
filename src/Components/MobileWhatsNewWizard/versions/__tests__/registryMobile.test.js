import { describe, it, expect } from "vitest";
import { getMobileUnseenVersions, mergeMobileVersionSteps } from "../index";

describe("Mobile WhatsNewWizard merging", () => {
  it("keeps single-step releases when several versions are merged", () => {
    const merged = mergeMobileVersionSteps(getMobileUnseenVersions("3.11.0", "3.13.0"));
    expect(merged.map((step) => step.key)).toEqual(["3.12.0-data-version", "3.13.0-compare-datasource"]);
    expect(merged[merged.length - 1].isThankYou).toBe(true);
  });

  it("still drops the dedicated thank-you step of an older multi-step release", () => {
    const merged = mergeMobileVersionSteps(getMobileUnseenVersions("3.0.0", "3.11.0"));
    const keys = merged.map((step) => step.key);
    expect(keys).not.toContain("3.1.0-thankyou");
    expect(keys).not.toContain("3.2.0-thankyou");
    expect(keys[keys.length - 1]).toBe("3.11.0-11th-edition");
  });
});
