import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StarcraftWeaponTable } from "../StarcraftWeaponTable";

vi.mock("../../../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => (
    <span data-tooltip-content={typeof content === "string" ? content : "rich"}>{children}</span>
  ),
}));

const weaponTypeDef = {
  key: "assault",
  label: "Assault",
  columns: [
    { key: "rng", label: "RNG", type: "string" },
    { key: "dmg", label: "DMG", type: "string" },
    { key: "keyword", label: "Keyword", type: "string" },
  ],
};

const glossary = [
  {
    key: "target-ground",
    name: "Target (Ground)",
    description: "May only target Ground models.",
    matchType: "exact",
    appliesTo: ["weapons"],
    displayMode: "explanation",
  },
  {
    key: "long-range",
    name: "Long Range",
    description: "Adds range when the bearer stays still.",
    matchType: "prefix",
    appliesTo: ["weapons"],
    displayMode: "tooltip",
  },
];

const weapons = [
  {
    name: "C-14 Rifle",
    profiles: [{ name: "C-14 Rifle", active: true, rng: "12", dmg: "1", keyword: 'Target (Ground), Long Range (18")' }],
  },
];

describe("StarcraftWeaponTable keyword glossary", () => {
  it("renders the keyword column as glossary tags with a tooltip", () => {
    const { container } = render(
      <StarcraftWeaponTable weapons={weapons} weaponTypeDef={weaponTypeDef} glossary={glossary} />,
    );
    // The comma-separated keyword cell is split into individual tags.
    expect(container.querySelectorAll(".ds-kw-tag")).toHaveLength(2);
    // The tooltip-mode "Long Range" keyword carries a hover tooltip.
    const trigger = container.querySelector("[data-tooltip-content]");
    expect(trigger.getAttribute("data-tooltip-content")).toMatch(/Adds range/i);
  });

  it("renders an explanation row for explanation-mode keywords", () => {
    render(<StarcraftWeaponTable weapons={weapons} weaponTypeDef={weaponTypeDef} glossary={glossary} />);
    expect(screen.getByTestId("ds-kw-explanations")).toBeInTheDocument();
    expect(screen.getByText("Target (Ground)")).toBeInTheDocument();
    expect(screen.getByText(/only target Ground models/i)).toBeInTheDocument();
  });

  it("keeps the keyword column as plain text when no glossary is supplied", () => {
    const { container } = render(<StarcraftWeaponTable weapons={weapons} weaponTypeDef={weaponTypeDef} />);
    expect(container.querySelector(".ds-kw-tag")).toBeNull();
    expect(screen.queryByTestId("ds-kw-explanations")).toBeNull();
    expect(screen.getByText('Target (Ground), Long Range (18")')).toBeInTheDocument();
  });
});
