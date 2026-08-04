import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StarcraftAbility } from "../StarcraftAbility";

vi.mock("../../../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => (
    <span data-tooltip-content={typeof content === "string" ? content : "rich"}>{children}</span>
  ),
}));

const glossary = [
  {
    key: "cloak",
    name: "Cloak",
    description: 'The model cannot be targeted from over 12" away.',
    matchType: "exact",
    appliesTo: ["abilities"],
    displayMode: "tooltip",
  },
];

describe("StarcraftAbility keyword glossary", () => {
  it("underlines an abilities-scoped tooltip keyword in the description", () => {
    const { container } = render(
      <StarcraftAbility
        ability={{ name: "Stealth Field", description: "Gains Cloak while stationary." }}
        category={{}}
        glossary={glossary}
      />,
    );
    const trigger = container.querySelector("[data-tooltip-content]");
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("data-tooltip-content")).toMatch(/cannot be targeted/i);
    expect(trigger.querySelector(".ds-kw-inline")).toBeTruthy();
  });

  it("renders the description verbatim when no glossary keyword matches", () => {
    render(
      <StarcraftAbility
        ability={{ name: "Charge", description: "Move an extra 3 inches." }}
        category={{}}
        glossary={glossary}
      />,
    );
    expect(screen.getByText("Move an extra 3 inches.")).toBeInTheDocument();
  });
});
