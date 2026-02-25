import { describe, it, expect } from "vitest";
import {
  VERSION_REGISTRY,
  getVersionConfig,
  getLatestWizardVersion,
  getUnseenVersions,
  mergeVersionSteps,
} from "../index";

describe("WhatsNewWizard version registry", () => {
  it("includes v3.2.1", () => {
    const versions = VERSION_REGISTRY.map((v) => v.version);
    expect(versions).toContain("3.2.1");
  });

  it("is sorted in ascending version order", () => {
    const versions = VERSION_REGISTRY.map((v) => v.version);
    for (let i = 1; i < versions.length; i++) {
      expect(versions[i] > versions[i - 1]).toBe(true);
    }
  });

  it("has v3.2.1 as the latest version", () => {
    expect(getLatestWizardVersion()).toBe("3.2.1");
  });

  it("returns v3.2.1 config via getVersionConfig", () => {
    const config = getVersionConfig("3.2.1");
    expect(config).toBeDefined();
    expect(config.version).toBe("3.2.1");
    expect(config.releaseName).toBe("UI Improvements");
  });

  it("returns v3.2.1 as unseen for a user on v3.2.0", () => {
    const unseen = getUnseenVersions("3.2.0", "3.2.1");
    const versions = unseen.map((v) => v.version);
    expect(versions).toContain("3.2.1");
  });

  it("preserves v3.2.1 thank-you when merging multiple versions", () => {
    const unseen = getUnseenVersions("3.0.0", "3.2.1");
    const merged = mergeVersionSteps(unseen);
    const lastStep = merged[merged.length - 1];
    expect(lastStep.isThankYou).toBe(true);
    expect(lastStep.version).toBe("3.2.1");
  });
});
