import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CustomCardAbilities } from "../CustomCardAbilities";

const make40kAbilitiesSchema = () => ({
  label: "Abilities",
  categories: [
    { key: "core", label: "Core", format: "name-only" },
    { key: "faction", label: "Faction", format: "name-only" },
    { key: "other", label: "Unit Abilities", format: "name-description" },
  ],
});

describe("CustomCardAbilities", () => {
  it("renders null when abilitiesSchema is null", () => {
    const { container } = render(<CustomCardAbilities unit={{}} abilitiesSchema={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders null when there are no abilities", () => {
    const { container } = render(
      <CustomCardAbilities unit={{ abilities: {} }} abilitiesSchema={make40kAbilitiesSchema()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders name-only abilities as comma-separated list", () => {
    const unit = {
      abilities: {
        core: ["Deep Strike", "Scouts"],
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.getByTestId("custom-abilities")).toBeInTheDocument();
    expect(screen.getByText("Core")).toBeInTheDocument();
    expect(screen.getByText("Deep Strike, Scouts")).toBeInTheDocument();
  });

  it("renders name-description abilities with name and description", () => {
    const unit = {
      abilities: {
        other: [
          { name: "Leader", description: "Can be attached to units", showAbility: true, showDescription: true },
          { name: "Deadly Demise", description: "D3 mortal wounds", showAbility: true, showDescription: true },
        ],
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.getByText("Leader")).toBeInTheDocument();
    expect(screen.getByText("Can be attached to units")).toBeInTheDocument();
    expect(screen.getByText("Deadly Demise")).toBeInTheDocument();
    expect(screen.getByText("D3 mortal wounds")).toBeInTheDocument();
  });

  it("hides description when showDescription is false", () => {
    const unit = {
      abilities: {
        other: [{ name: "Leader", description: "Hidden text", showAbility: true, showDescription: false }],
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.getByText("Leader")).toBeInTheDocument();
    expect(screen.queryByText("Hidden text")).not.toBeInTheDocument();
  });

  it("hides abilities when showAbility is false", () => {
    const unit = {
      abilities: {
        other: [{ name: "Hidden Ability", description: "Nope", showAbility: false }],
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.queryByText("Hidden Ability")).not.toBeInTheDocument();
  });

  it("respects showAbilities per category", () => {
    const unit = {
      abilities: {
        core: ["Deep Strike"],
        faction: ["Oath of Moment"],
      },
      showAbilities: {
        core: false,
        faction: true,
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.queryByText("Deep Strike")).not.toBeInTheDocument();
    expect(screen.getByText("Oath of Moment")).toBeInTheDocument();
  });

  it("renders abilities heading from schema label", () => {
    const unit = {
      abilities: {
        core: ["Deep Strike"],
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.getByText("Abilities")).toBeInTheDocument();
  });

  it("renders custom schema label for abilities heading", () => {
    const schema = {
      label: "Special Powers",
      categories: [{ key: "powers", label: "Powers", format: "name-only" }],
    };
    const unit = {
      abilities: {
        powers: ["Fireball", "Lightning"],
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={schema} />);

    expect(screen.getByText("Special Powers")).toBeInTheDocument();
    expect(screen.getByText("Fireball, Lightning")).toBeInTheDocument();
  });

  it("supports flat array abilities with category field", () => {
    const unit = {
      abilities: [
        { name: "Deep Strike", category: "core", showAbility: true },
        { name: "Leader", category: "other", description: "Attach to units", showAbility: true },
      ],
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.getByText("Deep Strike")).toBeInTheDocument();
    expect(screen.getByText("Leader")).toBeInTheDocument();
  });

  it("renders multiple categories", () => {
    const unit = {
      abilities: {
        core: ["Deep Strike"],
        faction: ["Oath of Moment"],
        other: [{ name: "Leader", description: "Can attach", showAbility: true, showDescription: true }],
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.getByText("Core")).toBeInTheDocument();
    expect(screen.getByText("Deep Strike")).toBeInTheDocument();
    expect(screen.getByText("Faction")).toBeInTheDocument();
    expect(screen.getByText("Oath of Moment")).toBeInTheDocument();
    expect(screen.getByText("Leader")).toBeInTheDocument();
    expect(screen.getByText("Can attach")).toBeInTheDocument();
  });

  it("skips empty categories", () => {
    const unit = {
      abilities: {
        core: ["Deep Strike"],
        // faction is empty
        // other is empty
      },
    };
    render(<CustomCardAbilities unit={unit} abilitiesSchema={make40kAbilitiesSchema()} />);

    expect(screen.getByText("Core")).toBeInTheDocument();
    expect(screen.queryByText("Faction")).not.toBeInTheDocument();
    expect(screen.queryByText("Unit Abilities")).not.toBeInTheDocument();
  });
});
