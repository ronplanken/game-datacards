import { describe, it, expect } from "vitest";
import {
  VERSION_REGISTRY,
  getVersionConfig,
  getLatestWizardVersion,
  getUnseenVersions,
  mergeVersionSteps,
} from "../index";

describe("WhatsNewWizard version registry", () => {
  it("includes v3.2.0", () => {
    const versions = VERSION_REGISTRY.map((v) => v.version);
    expect(versions).toContain("3.2.0");
  });

  it("is sorted in ascending version order", () => {
    const versions = VERSION_REGISTRY.map((v) => v.version);
    for (let i = 1; i < versions.length; i++) {
      expect(versions[i] > versions[i - 1]).toBe(true);
    }
  });

  it("has v3.2.0 as the latest version", () => {
    expect(getLatestWizardVersion()).toBe("3.2.0");
  });

  it("returns v3.2.0 config via getVersionConfig", () => {
    const config = getVersionConfig("3.2.0");
    expect(config).toBeDefined();
    expect(config.version).toBe("3.2.0");
    expect(config.releaseName).toBe("User Accounts & Cloud Sync");
  });

  it("returns v3.2.0 as unseen for a user on v3.1.2", () => {
    const unseen = getUnseenVersions("3.1.2", "3.2.0");
    const versions = unseen.map((v) => v.version);
    expect(versions).toContain("3.2.0");
  });

  it("preserves v3.2.0 thank-you when merging multiple versions", () => {
    const unseen = getUnseenVersions("3.0.0", "3.2.0");
    const merged = mergeVersionSteps(unseen);
    const lastStep = merged[merged.length - 1];
    expect(lastStep.isThankYou).toBe(true);
    expect(lastStep.version).toBe("3.2.0");
  });
});
