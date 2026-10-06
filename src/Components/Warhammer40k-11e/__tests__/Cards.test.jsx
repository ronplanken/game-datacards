import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

// 11e cards read the selected language from settings; pin it to English.
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

// antd Grid.useBreakpoint needs window.matchMedia which jsdom lacks; stub it.
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, Grid: { useBreakpoint: () => ({}) } };
});

import { StratagemCard } from "../StratagemCard";
import { EnhancementCard } from "../EnhancementCard";

describe("StratagemCard (11e)", () => {
  it("renders localised fields, keyword markup and CP cost", () => {
    const stratagem = {
      name: { en: "Armour of Contempt" },
      type: "Battle Tactic",
      detachment: "Gladius Task Force",
      turn: "either",
      cost: 1,
      phase: ["fight"],
      when: { en: "Your opponent's Shooting phase." },
      target: { en: "One <k>Adeptus Astartes</k> unit." },
      effect: { en: "Worsen the Armour Penetration by 1." },
      faction_id: "uuid",
    };
    const { container, getByText } = render(<StratagemCard stratagem={stratagem} />);
    expect(getByText("Armour of Contempt")).toBeInTheDocument();
    expect(container.textContent).toContain("1 CP");
    expect(container.querySelector(".gdc-keyword")?.textContent).toBe("Adeptus Astartes");
  });
});

describe("EnhancementCard (11e)", () => {
  it("renders localised name, cost and markup description", () => {
    const enhancement = {
      name: { en: "Temporal Corridor" },
      detachment: "Librarius Conclave",
      cost: "15",
      description: { en: "<k>Psyker</k> model only." },
      faction_id: "uuid",
    };
    const { container, getByText } = render(<EnhancementCard enhancement={enhancement} />);
    expect(getByText("Temporal Corridor")).toBeInTheDocument();
    expect(container.textContent).toContain("15");
    expect(container.querySelector(".gdc-keyword")?.textContent).toBe("Psyker");
  });
});
