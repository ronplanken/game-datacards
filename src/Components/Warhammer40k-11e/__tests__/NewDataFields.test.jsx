import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, Grid: { useBreakpoint: () => ({}) } };
});

import { UnitExtra } from "../UnitCard/UnitExtra";
import { UnitLoadout } from "../UnitCard/UnitLoadout";
import { UnitWeapons } from "../UnitCard/UnitWeapons";
import { StratagemCard } from "../StratagemCard";

describe("11e UnitExtra: wargear / special abilities", () => {
  it("renders wargear abilities under their own heading", () => {
    const unit = {
      abilities: { wargear: [{ name: { en: "Vexilla" }, description: { en: "Add 1 to Objective Control." } }] },
    };
    const { getByText } = render(<UnitExtra unit={unit} />);
    expect(getByText("Wargear abilities")).toBeInTheDocument();
    expect(getByText("Vexilla")).toBeInTheDocument();
  });

  it("hides wargear abilities when showAbilities.wargear is false", () => {
    const unit = {
      abilities: { wargear: [{ name: { en: "Vexilla" }, description: { en: "Add 1 to Objective Control." } }] },
      showAbilities: { wargear: false },
    };
    const { queryByText } = render(<UnitExtra unit={unit} />);
    expect(queryByText("Wargear abilities")).not.toBeInTheDocument();
  });

  it("renders the Support attach text for support characters (lives in abilities.special)", () => {
    // Support units carry no top-level `leader` field; their "can be attached to"
    // text is a special ability, so it must render from there.
    const unit = {
      abilities: {
        core: [{ name: { en: "Support" } }],
        special: [
          {
            name: { en: "Support" },
            description: { en: "This model can be attached to the following units:\n\n■ **GUARDIAN DEFENDERS**" },
          },
        ],
      },
    };
    const { getAllByText, getByText } = render(<UnitExtra unit={unit} />);
    // Shown twice: as a core-ability chip and as the special-ability heading.
    expect(getAllByText("Support").length).toBeGreaterThanOrEqual(1);
    expect(getByText(/can be attached to the following units/)).toBeInTheDocument();
  });

  it("hides special abilities when showAbilities.special is false", () => {
    const unit = {
      abilities: { special: [{ name: { en: "Jetbike Outriders" }, description: { en: "Attach instead." } }] },
      showAbilities: { special: false },
    };
    const { queryByText } = render(<UnitExtra unit={unit} />);
    expect(queryByText("Jetbike Outriders")).not.toBeInTheDocument();
  });

  it("renders special abilities", () => {
    const unit = {
      abilities: { special: [{ name: { en: "Jetbike Outriders" }, description: { en: "Can be attached instead." } }] },
    };
    const { getByText } = render(<UnitExtra unit={unit} />);
    expect(getByText("Jetbike Outriders")).toBeInTheDocument();
  });

  it("does not render primarch abilities in the abilities column", () => {
    const unit = {
      abilities: {
        primarch: [{ name: { en: "Warmaster" }, abilities: [{ name: { en: "X" }, description: { en: "Y" } }] }],
      },
    };
    const { queryByText } = render(<UnitExtra unit={unit} />);
    expect(queryByText("Warmaster")).not.toBeInTheDocument();
  });
});

describe("11e UnitWeapons: primarch abilities", () => {
  it("renders primarch ability groups and their sub-abilities below the weapons", () => {
    const unit = {
      abilities: {
        primarch: [
          {
            name: { en: "Warmaster" },
            abilities: [{ name: { en: "Paragon of Hatred" }, description: { en: "Re-roll the hit roll." } }],
          },
        ],
      },
    };
    const { getByText } = render(<UnitWeapons unit={unit} />);
    expect(getByText("Warmaster")).toBeInTheDocument();
    expect(getByText(/Paragon of Hatred/)).toBeInTheDocument();
    expect(getByText(/Re-roll the hit roll/)).toBeInTheDocument();
  });

  it("hides primarch abilities when showAbilities.primarch is false", () => {
    const unit = {
      abilities: {
        primarch: [{ name: { en: "Warmaster" }, abilities: [{ name: { en: "X" }, description: { en: "Y" } }] }],
      },
      showAbilities: { primarch: false },
    };
    const { queryByText } = render(<UnitWeapons unit={unit} />);
    expect(queryByText("Warmaster")).not.toBeInTheDocument();
  });

  it("renders primarch groups after the weapon tables", () => {
    const unit = {
      meleeWeapons: [{ name: { en: "Chainsword" }, profiles: [{ name: { en: "Chainsword" }, keywords: [] }] }],
      abilities: {
        primarch: [{ name: { en: "Warmaster" }, abilities: [] }],
      },
    };
    const { container } = render(<UnitWeapons unit={unit} />);
    const blocks = container.querySelectorAll(".weapons > *");
    expect(blocks[blocks.length - 1]).toHaveClass("primarch");
  });
});

describe("11e UnitLoadout: transport", () => {
  it("renders transport text when present", () => {
    const unit = { transport: { en: "This model has a transport capacity of 12 **INFANTRY** models." } };
    const { getByText } = render(<UnitLoadout unit={unit} />);
    expect(getByText("Transport")).toBeInTheDocument();
    expect(getByText(/transport capacity of 12/)).toBeInTheDocument();
  });

  it("hides transport when showTransport is false", () => {
    const unit = {
      transport: { en: "This model has a transport capacity of 12 **INFANTRY** models." },
      showTransport: false,
    };
    const { queryByText } = render(<UnitLoadout unit={unit} />);
    expect(queryByText("Transport")).not.toBeInTheDocument();
  });
});

describe("11e StratagemCard: restrictions", () => {
  it("renders a restrictions section when present", () => {
    const stratagem = {
      name: { en: "Talons Interlocked" },
      when: { en: "Your Command phase." },
      effect: { en: "Do a thing." },
      restrictions: { en: "You cannot use this Stratagem more than once per battle." },
      phase: [],
      cost: "1",
    };
    const { getByText } = render(<StratagemCard stratagem={stratagem} />);
    expect(getByText("restrictions:")).toBeInTheDocument();
    expect(getByText(/more than once per battle/)).toBeInTheDocument();
  });
});
