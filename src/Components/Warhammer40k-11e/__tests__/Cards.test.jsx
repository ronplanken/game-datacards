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

  it("marks its root as a datacard so dark mode keeps the light card colours", () => {
    const stratagem = { name: { en: "Test" }, type: "Battle Tactic", turn: "your", cost: 1, phase: [] };
    const { container } = render(<StratagemCard stratagem={stratagem} containerClass="mobile" />);
    expect(container.firstChild).toHaveClass("gdc-datacard");
    expect(container.firstChild).toHaveClass("mobile");
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

  it("marks its root as a datacard so dark mode keeps the light card colours", () => {
    const enhancement = { name: { en: "Test" }, detachment: "Test", cost: "10", description: { en: "Text" } };
    const { container } = render(<EnhancementCard enhancement={enhancement} />);
    expect(container.firstChild).toHaveClass("gdc-datacard");
  });
});
