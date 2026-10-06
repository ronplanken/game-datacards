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

// Weapon types with `hasKeywords` store their keywords as an array on the
// profile (`profile.keywords`) instead of in a schema column — the shape the
// card editors write. Those tags have to resolve against the glossary too.
describe("StarcraftWeaponTable profile keyword arrays", () => {
  const keywordArrayTypeDef = {
    key: "assault",
    label: "Assault",
    hasKeywords: true,
    hasProfiles: true,
    columns: [
      { key: "rng", label: "RNG", type: "string" },
      { key: "dmg", label: "DMG", type: "string" },
    ],
  };

  const arrayWeapons = [
    {
      name: "Tendril Strike",
      profiles: [{ name: "Tendril Strike", active: true, rng: "2", dmg: "1", keywords: ["Repeating", "Long Range"] }],
    },
  ];

  it("renders profile keywords as glossary tags in a keywords column", () => {
    const { container } = render(
      <StarcraftWeaponTable weapons={arrayWeapons} weaponTypeDef={keywordArrayTypeDef} glossary={glossary} />,
    );
    const headers = [...container.querySelectorAll("th")].map((th) => th.textContent);
    expect(headers).toContain("Keywords");
    // Both tags render, and the glossary-matched one carries its tooltip.
    expect(container.querySelectorAll(".ds-kw-tag")).toHaveLength(2);
    expect(container.querySelector("[data-tooltip-content]").getAttribute("data-tooltip-content")).toMatch(
      /Adds range/i,
    );
    // The raw array must never reach the cell as a stringified value.
    expect(screen.queryByText("Repeating,Long Range")).toBeNull();
  });

  it("renders explanation rows for profile keywords", () => {
    const explanationGlossary = [
      {
        key: "repeating",
        name: "Repeating",
        description: "Roll the attack dice twice.",
        matchType: "exact",
        appliesTo: ["weapons"],
        displayMode: "explanation",
      },
    ];
    render(
      <StarcraftWeaponTable
        weapons={arrayWeapons}
        weaponTypeDef={keywordArrayTypeDef}
        glossary={explanationGlossary}
      />,
    );
    expect(screen.getByTestId("ds-kw-explanations")).toBeInTheDocument();
    expect(screen.getByText(/Roll the attack dice twice/i)).toBeInTheDocument();
  });

  it("falls back to the parent weapon's keywords when the profile has none", () => {
    const weaponLevel = [
      {
        name: "Tendril Strike",
        keywords: ["Repeating"],
        profiles: [{ name: "Tendril Strike", active: true, rng: "2", dmg: "1" }],
      },
    ];
    const { container } = render(
      <StarcraftWeaponTable weapons={weaponLevel} weaponTypeDef={keywordArrayTypeDef} glossary={glossary} />,
    );
    expect(container.querySelectorAll(".ds-kw-tag")).toHaveLength(1);
  });

  it("lists profile keywords as plain text when no glossary is supplied", () => {
    const { container } = render(<StarcraftWeaponTable weapons={arrayWeapons} weaponTypeDef={keywordArrayTypeDef} />);
    expect(container.querySelector(".ds-kw-tag")).toBeNull();
    expect(screen.getByText("Repeating, Long Range")).toBeInTheDocument();
  });

  it("drops a schema column keyed after the reserved keywords field", () => {
    // Older/imported schemas can carry a column keyed `keywords`; rendering it
    // dumped the raw array into the cell ("Repeating,Long Range").
    const withReservedColumn = {
      ...keywordArrayTypeDef,
      columns: [...keywordArrayTypeDef.columns, { key: "keywords", label: "Keyword tags", type: "string" }],
    };
    const { container } = render(
      <StarcraftWeaponTable weapons={arrayWeapons} weaponTypeDef={withReservedColumn} glossary={glossary} />,
    );
    const headers = [...container.querySelectorAll("th")].map((th) => th.textContent);
    // Only one keyword column, carrying the schema column's label.
    expect(headers.filter((h) => /keyword/i.test(h))).toEqual(["Keyword tags"]);
    expect(screen.queryByText("Repeating,Long Range")).toBeNull();
    expect(container.querySelectorAll(".ds-kw-tag")).toHaveLength(2);
  });

  it("omits the keywords column when no profile carries a keyword", () => {
    const bare = [{ name: "Tendril Strike", profiles: [{ name: "Tendril Strike", active: true, rng: "2", dmg: "1" }] }];
    const { container } = render(
      <StarcraftWeaponTable weapons={bare} weaponTypeDef={keywordArrayTypeDef} glossary={glossary} />,
    );
    const headers = [...container.querySelectorAll("th")].map((th) => th.textContent);
    expect(headers).toEqual(["Name", "RNG", "DMG"]);
  });

  it("renders profile keywords on the mobile card layout", () => {
    const { container } = render(
      <StarcraftWeaponTable weapons={arrayWeapons} weaponTypeDef={keywordArrayTypeDef} glossary={glossary} isMobile />,
    );
    expect(container.querySelectorAll(".ds-kw-tag")).toHaveLength(2);
  });
});
