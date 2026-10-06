import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepCompareDatasource } from "../v3.13.0/StepCompareDatasource";
import { VERSION_CONFIG } from "../v3.13.0";
import { getUnseenVersions, mergeVersionSteps } from "../index";

describe("Desktop WhatsNewWizard v3.13.0 config", () => {
  it("has version 3.13.0", () => {
    expect(VERSION_CONFIG.version).toBe("3.13.0");
  });

  it("has the correct release name", () => {
    expect(VERSION_CONFIG.releaseName).toBe("Compare with Datasource");
  });

  it("has title and component on every step", () => {
    VERSION_CONFIG.steps.forEach((step) => {
      expect(step.title).toBeTruthy();
      expect(step.component).toBeTruthy();
    });
  });

  it("marks only the last step as thankYou", () => {
    const flagged = VERSION_CONFIG.steps.filter((s) => s.isThankYou);
    expect(flagged).toHaveLength(1);
    expect(flagged[0]).toBe(VERSION_CONFIG.steps[VERSION_CONFIG.steps.length - 1]);
  });

  it("has a single compare step", () => {
    expect(VERSION_CONFIG.steps.map((s) => s.key)).toEqual(["3.13.0-compare-datasource"]);
  });

  it("is shown to a user coming from 3.12.0", () => {
    const merged = mergeVersionSteps(getUnseenVersions("3.12.0", "3.13.0"));
    expect(merged.map((s) => s.key)).toEqual(["3.13.0-compare-datasource"]);
  });
});

describe("Desktop WhatsNewWizard v3.13.0 compare step", () => {
  it("shows both screenshots", () => {
    render(<StepCompareDatasource />);
    const sources = screen.getAllByRole("img").map((img) => img.getAttribute("src"));
    expect(sources.some((src) => /compare-datasource-menu/.test(src))).toBe(true);
    expect(sources.some((src) => /compare-datasource-dialog/.test(src))).toBe(true);
  });

  it("explains where to find it, the selection and what is kept", () => {
    render(<StepCompareDatasource />);
    expect(screen.getByText("Where to find it")).toBeTruthy();
    expect(screen.getByText("You choose what to update")).toBeTruthy();
    expect(screen.getByText("Your list choices stay")).toBeTruthy();
  });
});
