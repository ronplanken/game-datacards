import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepCompareDatasource } from "../v3.13.0/StepCompareDatasource";
import { MOBILE_VERSION_CONFIG } from "../v3.13.0";
import { MOBILE_VERSION_REGISTRY } from "../index";

describe("Mobile WhatsNewWizard v3.13.0 config", () => {
  it("has version 3.13.0", () => {
    expect(MOBILE_VERSION_CONFIG.version).toBe("3.13.0");
  });

  it("has the correct release name", () => {
    expect(MOBILE_VERSION_CONFIG.releaseName).toBe("Compare with Datasource");
  });

  it("has title and component on every step", () => {
    MOBILE_VERSION_CONFIG.steps.forEach((step) => {
      expect(step.title).toBeTruthy();
      expect(step.component).toBeTruthy();
    });
  });

  it("marks only the last step as thankYou", () => {
    const flagged = MOBILE_VERSION_CONFIG.steps.filter((s) => s.isThankYou);
    expect(flagged).toHaveLength(1);
    expect(flagged[0]).toBe(MOBILE_VERSION_CONFIG.steps[MOBILE_VERSION_CONFIG.steps.length - 1]);
  });

  it("is the latest mobile version", () => {
    expect(MOBILE_VERSION_REGISTRY[MOBILE_VERSION_REGISTRY.length - 1].version).toBe("3.13.0");
  });
});

describe("Mobile WhatsNewWizard v3.13.0 compare step", () => {
  it("uses the mobile wizard classes", () => {
    const { container } = render(<StepCompareDatasource />);
    expect(container.querySelector(".mwnw-features")).toBeTruthy();
    expect(container.querySelector(".wnw-feature-header")).toBeNull();
  });

  it("shows both mobile screenshots", () => {
    render(<StepCompareDatasource />);
    const sources = screen.getAllByRole("img").map((img) => img.getAttribute("src"));
    expect(sources.some((src) => /compare-datasource-menu-mobile/.test(src))).toBe(true);
    expect(sources.some((src) => /compare-datasource-dialog-mobile/.test(src))).toBe(true);
  });

  it("explains where to find it, the selection and what is kept", () => {
    render(<StepCompareDatasource />);
    expect(screen.getByText("Where to find it")).toBeTruthy();
    expect(screen.getByText("You choose what to update")).toBeTruthy();
    expect(screen.getByText("Your list choices stay")).toBeTruthy();
  });
});
