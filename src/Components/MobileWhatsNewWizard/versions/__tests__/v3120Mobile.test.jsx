import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepDataVersion } from "../v3.12.0/StepDataVersion";
import { MOBILE_VERSION_CONFIG } from "../v3.12.0";

describe("Mobile WhatsNewWizard v3.12.0 config", () => {
  it("has version 3.12.0", () => {
    expect(MOBILE_VERSION_CONFIG.version).toBe("3.12.0");
  });

  it("has the correct release name", () => {
    expect(MOBILE_VERSION_CONFIG.releaseName).toBe("Data Versions");
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

  it("marks only the last step as thankYou so the earlier steps always show", () => {
    const flagged = MOBILE_VERSION_CONFIG.steps.filter((s) => s.isThankYou);
    expect(flagged).toHaveLength(1);
    expect(flagged[0]).toBe(MOBILE_VERSION_CONFIG.steps[MOBILE_VERSION_CONFIG.steps.length - 1]);
  });

  it("has a single data version step", () => {
    expect(MOBILE_VERSION_CONFIG.steps.map((s) => s.key)).toEqual(["3.12.0-data-version"]);
  });
});

describe("Mobile WhatsNewWizard v3.12.0 data version step", () => {
  it("shows the screenshot of the data version setting", () => {
    render(<StepDataVersion />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("alt")).toMatch(/Data version/);
    expect(img.getAttribute("src")).toMatch(/data-version-mobile/);
  });

  it("explains where to find the setting and how to switch back", () => {
    render(<StepDataVersion />);
    expect(screen.getByText("Where to find it")).toBeTruthy();
    expect(screen.getByText("Back to the latest data")).toBeTruthy();
    expect(screen.getByText("All force dispositions")).toBeTruthy();
  });
});
