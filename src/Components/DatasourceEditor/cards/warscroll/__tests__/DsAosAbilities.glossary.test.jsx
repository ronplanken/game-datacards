import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DsAosAbilities } from "../DsAosAbilities";

vi.mock("../../../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => (
    <span data-tooltip-content={typeof content === "string" ? content : "rich"}>{children}</span>
  ),
}));

const abilitiesSchema = {
  categories: [{ key: "passive", label: "Passive", format: "description" }],
};

const glossary = [
  {
    key: "ward",
    name: "Ward",
    description: "Roll a dice each time the model would lose a wound.",
    matchType: "exact",
    appliesTo: ["abilities"],
    displayMode: "tooltip",
  },
];

const cardWith = (description) => ({
  abilities: { passive: [{ name: "Blessed", description, showAbility: true }] },
});

describe("DsAosAbilities keyword glossary", () => {
  it("underlines an abilities-scoped tooltip keyword in the ability description", () => {
    const { container } = render(
      <DsAosAbilities
        card={cardWith("This unit has a Ward against spells.")}
        abilitiesSchema={abilitiesSchema}
        grandAlliance="order"
        glossary={glossary}
      />,
    );
    const trigger = container.querySelector("[data-tooltip-content]");
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("data-tooltip-content")).toMatch(/lose a wound/i);
    expect(trigger.querySelector(".ds-kw-inline")).toBeTruthy();
  });

  it("renders the description normally when no glossary keyword matches", () => {
    const { container } = render(
      <DsAosAbilities
        card={cardWith("A plain passive ability.")}
        abilitiesSchema={abilitiesSchema}
        grandAlliance="order"
        glossary={glossary}
      />,
    );
    expect(screen.getByText("A plain passive ability.")).toBeInTheDocument();
    expect(container.querySelector("[data-tooltip-content]")).toBeNull();
  });
});
