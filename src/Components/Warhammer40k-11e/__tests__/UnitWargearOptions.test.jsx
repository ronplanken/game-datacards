import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

let mockLanguage = "en";
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: mockLanguage } }),
}));

import { UnitWargear } from "../UnitCard/UnitWargear";

const grav = {
  instruction: { en: "Any number of models can each have their grav-cannon replaced.", de: "Ersetze die Grav-Kanone." },
  options: [
    { name: { en: "Twin lascannon", de: "Doppel-Laserkanone" }, cost: "5" },
    { name: { en: "Heavy bolter" }, cost: "0" },
  ],
};

describe("11e card back wargear options", () => {
  it("lists each group's instruction and options, pricing only the paid ones", () => {
    const { container } = render(<UnitWargear unit={{ wargear: [], wargearOptions: [grav] }} />);
    expect(container.textContent).toContain("Any number of models can each have their grav-cannon replaced.");
    expect(container.textContent).toContain("Twin lascannon (+5 pts)");
    expect(container.textContent).toContain("Heavy bolter");
    expect(container.textContent).not.toContain("Heavy bolter (+0 pts)");
  });

  it("collapses the duplicate groups the 11e data repeats per model", () => {
    const { container } = render(<UnitWargear unit={{ wargearOptions: [grav, { ...grav }] }} />);
    expect(container.querySelectorAll(".wargear-group")).toHaveLength(1);
  });

  it("drops a flat 'None' when there are real options to show instead", () => {
    const { container } = render(<UnitWargear unit={{ wargear: [{ en: "None" }], wargearOptions: [grav] }} />);
    expect(container.textContent).not.toContain("None");
    expect(container.textContent).toContain("Twin lascannon (+5 pts)");
  });

  it("shows the flat text first when both have real content", () => {
    const { container } = render(
      <UnitWargear unit={{ wargear: [{ en: "Take a plasma pistol." }], wargearOptions: [grav] }} />,
    );
    const items = Array.from(container.querySelectorAll(".content > .item"));
    expect(items[0].textContent).toContain("Take a plasma pistol.");
    expect(items[1].textContent).toContain("Twin lascannon (+5 pts)");
  });

  it("falls back to the flat text alone when there are no structured options", () => {
    const { container } = render(<UnitWargear unit={{ wargear: [{ en: "Take a plasma pistol." }] }} />);
    expect(container.textContent).toContain("Take a plasma pistol.");
    expect(container.querySelectorAll(".wargear-group")).toHaveLength(0);
  });

  it("renders an empty section when neither has anything to say", () => {
    const { container } = render(<UnitWargear unit={{ wargear: [{ en: "None" }], wargearOptions: [] }} />);
    expect(container.textContent).toBe("");
  });

  it("stays hidden when showWargear is false", () => {
    const { container } = render(<UnitWargear unit={{ wargearOptions: [grav], showWargear: false }} />);
    expect(container.textContent).toBe("");
  });

  it("localises instructions and option names to the card language", () => {
    mockLanguage = "de";
    const { container } = render(<UnitWargear unit={{ wargearOptions: [grav] }} />);
    expect(container.textContent).toContain("Ersetze die Grav-Kanone.");
    expect(container.textContent).toContain("Doppel-Laserkanone (+5 pts)");
    mockLanguage = "en";
  });
});
