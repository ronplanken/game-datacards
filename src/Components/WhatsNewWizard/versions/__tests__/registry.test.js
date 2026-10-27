import { describe, it, expect } from "vitest";
import { compare } from "compare-versions";
import {
  VERSION_REGISTRY,
  getVersionConfig,
  getLatestWizardVersion,
  getUnseenVersions,
  mergeVersionSteps,
  RECENT_SINGLE_STEP_VERSIONS,
} from "../index";

describe("WhatsNewWizard version registry", () => {
  it("includes v3.2.2", () => {
    const versions = VERSION_REGISTRY.map((v) => v.version);
    expect(versions).toContain("3.2.2");
  });

  it("is sorted in ascending version order", () => {
    const versions = VERSION_REGISTRY.map((v) => v.version);
    for (let i = 1; i < versions.length; i++) {
      expect(compare(versions[i], versions[i - 1], ">")).toBe(true);
    }
  });

  it("has v3.13.0 as the latest version", () => {
    expect(getLatestWizardVersion()).toBe("3.13.0");
  });

  it("returns v3.2.2 config via getVersionConfig", () => {
    const config = getVersionConfig("3.2.2");
    expect(config).toBeDefined();
    expect(config.version).toBe("3.2.2");
    expect(config.releaseName).toBe("Sharing, Rebuilt");
  });

  it("returns v3.2.2 as unseen for a user on v3.2.1", () => {
    const unseen = getUnseenVersions("3.2.1", "3.2.2");
    const versions = unseen.map((v) => v.version);
    expect(versions).toContain("3.2.2");
  });

  it("preserves v3.2.2 thank-you when merging multiple versions", () => {
    const unseen = getUnseenVersions("3.0.0", "3.2.2");
    const merged = mergeVersionSteps(unseen);
    const lastStep = merged[merged.length - 1];
    expect(lastStep.isThankYou).toBe(true);
    expect(lastStep.version).toBe("3.2.2");
  });

  it("keeps single-step releases when several versions are merged", () => {
    const merged = mergeVersionSteps(getUnseenVersions("3.11.0", "3.13.0"));
    expect(merged.map((step) => step.key)).toEqual(["3.12.0-data-version", "3.13.0-compare-datasource"]);
    expect(merged[merged.length - 1].isThankYou).toBe(true);
  });

  it("only keeps single-step releases among the most recent unseen versions", () => {
    const unseen = getUnseenVersions("3.5.0", "3.13.0");
    const merged = mergeVersionSteps(unseen);
    expect(RECENT_SINGLE_STEP_VERSIONS).toBe(3);
    expect(merged.map((step) => step.version)).toEqual(unseen.slice(-3).map((v) => v.version));
  });

  it("keeps the step count bounded for a long-idle user", () => {
    const merged = mergeVersionSteps(getUnseenVersions("3.0.0", "3.13.0"));
    const keys = merged.map((step) => step.key);
    expect(keys.slice(-3)).toEqual(["3.11.0-11th-edition", "3.12.0-data-version", "3.13.0-compare-datasource"]);
    expect(keys).not.toContain("3.10.0-patch-notes");
  });

  it("still drops the dedicated thank-you step of an older multi-step release", () => {
    const merged = mergeVersionSteps(getUnseenVersions("3.0.0", "3.2.1"));
    const keys = merged.map((step) => step.key);
    expect(keys).not.toContain("3.1.0-thankyou");
    expect(keys).not.toContain("3.2.0-thankyou");
    expect(keys).toContain("3.2.1-update");
    expect(keys[keys.length - 1]).toBe("3.2.1-update");
  });
});
