import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// The points display localises tier keywords to the selected card language.
let mockLanguage = "en";
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: mockLanguage } }),
}));

// Render the popover's table inline instead of on hover into a portal, so the
// tier rows can be inspected directly.
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Popover: ({ content, children }) => (
      <div>
        {content}
        {children}
      </div>
    ),
  };
});

import { UnitPoints } from "../UnitCard/UnitPoints";

// 11e-shaped tiers: string values, language-keyed keyword, no active flags.
const points = [
  { models: "1", cost: "405", keyword: null, detachment: null },
  { models: "2", cost: "425", keyword: { en: "Imperium", de: "Imperium-DE" }, detachment: null },
];

describe("UnitPoints (11e card display)", () => {
  it("shows every tier with localised keywords when showAllPoints is on", () => {
    const { container } = render(<UnitPoints points={points} showAllPoints={true} showPointsModels={true} />);
    expect(container.textContent).toContain("1: 405 pts");
    expect(container.textContent).toContain("2 (Imperium): 425 pts");
  });

  it("shows the roster surcharge alongside the tiers", () => {
    const { container } = render(
      <UnitPoints
        points={points}
        additionalCost={{ cost: "20", afterSelections: 1 }}
        showAllPoints={true}
        showPointsModels={true}
      />,
    );
    expect(container.textContent).toContain("+20 pts/extra");
  });

  it("renders nothing without points", () => {
    const { container } = render(<UnitPoints points={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("localises tier keywords to the selected card language", () => {
    mockLanguage = "de";
    const { container } = render(<UnitPoints points={points} showAllPoints={true} showPointsModels={true} />);
    expect(container.textContent).toContain("2 (Imperium-DE): 425 pts");
    mockLanguage = "en";
  });
});

// A tier can be priced for one detachment or one faction only.
describe("UnitPoints restricted tiers (11e)", () => {
  const restricted = [
    { models: "5", cost: "75", keyword: null, faction: null, detachment: null },
    { models: "5", cost: "80", keyword: null, faction: { en: "Blood Angels", de: "Blutengel" }, detachment: null },
    { models: "1", cost: "300", keyword: null, faction: null, detachment: { en: "Pantheon of Woe" } },
  ];

  it("names the restriction on the chips when showAllPoints is on", () => {
    const { container } = render(<UnitPoints points={restricted} showAllPoints={true} showPointsModels={true} />);
    expect(container.textContent).toContain("5: 75 pts");
    expect(container.textContent).toContain("5: 80 pts (Blood Angels)");
    expect(container.textContent).toContain("1: 300 pts (Pantheon of Woe)");
  });

  it("names the restriction without the model count too", () => {
    const { container } = render(<UnitPoints points={restricted} showAllPoints={true} />);
    expect(container.textContent).toContain("80 pts (Blood Angels)");
  });

  it("lists the restriction in the popover table, set apart from the keyword", () => {
    const { container } = render(<UnitPoints points={restricted} />);
    const rows = Array.from(container.querySelectorAll("tr.points"));
    // The popover renders inline in the test DOM; the second tier is the
    // restricted one.
    expect(rows[1].textContent).toContain("5 (Blood Angels)");
    expect(rows[1].querySelector(".points_restriction")).not.toBeNull();
    expect(rows[0].querySelector(".points_restriction")).toBeNull();
  });

  it("localises the restriction to the selected card language", () => {
    mockLanguage = "de";
    const { container } = render(<UnitPoints points={restricted} showAllPoints={true} showPointsModels={true} />);
    expect(container.textContent).toContain("5: 80 pts (Blutengel)");
    mockLanguage = "en";
  });

  it("leaves unrestricted tiers exactly as they were", () => {
    const { container } = render(<UnitPoints points={points} showAllPoints={true} showPointsModels={true} />);
    expect(container.textContent).toBe("1: 405 pts2 (Imperium): 425 pts");
  });
});
