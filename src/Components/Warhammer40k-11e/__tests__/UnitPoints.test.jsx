import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UnitPoints } from "../UnitCard/UnitPoints";

// 11e-shaped tiers: string values, language-keyed keyword, no active flags.
const points = [
  { models: "1", cost: "405", keyword: null, detachment: null },
  { models: "2", cost: "425", keyword: { en: "Imperium" }, detachment: null },
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
});
