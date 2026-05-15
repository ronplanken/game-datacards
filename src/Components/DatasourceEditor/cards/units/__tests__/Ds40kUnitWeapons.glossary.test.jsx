import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Ds40kUnitWeapons } from "../Ds40kUnitWeapons";

vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span>{children}</span>,
}));

vi.mock("antd", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Popover: ({ children }) => <>{children}</>,
  Grid: { useBreakpoint: () => ({}) },
}));

// The renderer wraps tooltip-mode keywords in our custom Tooltip wrapper;
// flatten it so the trigger element is reachable for assertions.
vi.mock("../../../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => (
    <span data-tooltip-content={typeof content === "string" ? content : "rich"}>{children}</span>
  ),
}));

const weaponTypes = {
  label: "Weapons",
  types: [
    {
      key: "ranged",
      label: "Ranged Weapons",
      hasKeywords: true,
      hasProfiles: true,
      columns: [
        { key: "range", label: "Range", type: "string" },
        { key: "a", label: "A", type: "string" },
        { key: "bs", label: "BS", type: "string" },
        { key: "s", label: "S", type: "string" },
        { key: "ap", label: "AP", type: "string" },
        { key: "d", label: "D", type: "string" },
      ],
    },
  ],
};

const glossary = [
  {
    key: "one-shot",
    name: "One Shot",
    description: "The bearer can only shoot with this weapon once per battle.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "anti",
    name: "Anti-",
    description: "Critical Wounds vs matching keyword.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "sustained-hits",
    name: "Sustained Hits",
    description: "Extra hits on critical hits.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "ability-only",
    name: "One Shot",
    description: "Should never render under a weapon profile.",
    matchType: "exact",
    appliesTo: ["abilities"],
  },
];

const unitWith = (keywords) => ({
  name: "Test Unit",
  weapons: {
    ranged: [
      {
        profiles: [
          {
            name: "Test Gun",
            active: true,
            range: '24"',
            a: "1",
            bs: "3+",
            s: "4",
            ap: "0",
            d: "1",
            keywords,
          },
        ],
      },
    ],
  },
});

describe("Ds40kUnitWeapons glossary explanations", () => {
  it("renders an explanation row when a weapon keyword matches the glossary", () => {
    const { container } = render(
      <Ds40kUnitWeapons unit={unitWith(["One Shot"])} weaponTypes={weaponTypes} keywordGlossary={glossary} />,
    );
    const special = container.querySelector(".special");
    expect(special).toBeTruthy();
    const ability = special.querySelector(".ability");
    expect(ability).toBeTruthy();
    expect(ability.querySelector(".name").textContent).toBe("One Shot");
    expect(screen.getByText(/once per battle/i)).toBeInTheDocument();
  });

  it("collapses multiple matched explanations into a single .special container", () => {
    const unit = {
      name: "Test Unit",
      weapons: {
        ranged: [
          {
            profiles: [
              { name: "Gun A", active: true, keywords: ["One Shot"] },
              { name: "Gun B", active: true, keywords: ["Anti-Infantry 4+"] },
            ],
          },
        ],
      },
    };
    const { container } = render(<Ds40kUnitWeapons unit={unit} weaponTypes={weaponTypes} keywordGlossary={glossary} />);
    expect(container.querySelectorAll(".special")).toHaveLength(1);
    expect(container.querySelectorAll(".special .ability")).toHaveLength(2);
  });

  it("renders nothing extra when there is no glossary", () => {
    render(<Ds40kUnitWeapons unit={unitWith(["One Shot"])} weaponTypes={weaponTypes} />);
    expect(screen.queryByText(/once per battle/i)).toBeNull();
  });

  it("renders no explanation row for keywords without a glossary match", () => {
    render(
      <Ds40kUnitWeapons
        unit={unitWith(["Custom Special Keyword"])}
        weaponTypes={weaponTypes}
        keywordGlossary={glossary}
      />,
    );
    expect(screen.queryByText(/once per battle/i)).toBeNull();
    expect(screen.queryByText(/Critical Wounds vs matching keyword/i)).toBeNull();
  });

  it("resolves parameterized matches for parametrised keywords", () => {
    render(
      <Ds40kUnitWeapons unit={unitWith(["Anti-Infantry 4+"])} weaponTypes={weaponTypes} keywordGlossary={glossary} />,
    );
    expect(screen.getByText(/Critical Wounds vs matching keyword/i)).toBeInTheDocument();
  });

  it("renders the full parameterized inline keyword while resolving the base explanation", () => {
    const { container } = render(
      <Ds40kUnitWeapons unit={unitWith(["Sustained Hits D6+2"])} weaponTypes={weaponTypes} keywordGlossary={glossary} />,
    );
    expect(container.querySelector(".keyword").textContent).toContain("Sustained Hits D6+2");
    expect(screen.getByText(/Extra hits on critical hits/i)).toBeInTheDocument();
  });

  it("deduplicates explanation rows within a weapon type", () => {
    const unit = {
      name: "Test Unit",
      weapons: {
        ranged: [
          {
            profiles: [
              { name: "Gun A", active: true, keywords: ["One Shot"] },
              { name: "Gun B", active: true, keywords: ["One Shot"] },
            ],
          },
        ],
      },
    };
    render(<Ds40kUnitWeapons unit={unit} weaponTypes={weaponTypes} keywordGlossary={glossary} />);
    expect(screen.getAllByText(/once per battle/i)).toHaveLength(1);
  });

  it("renders a hover tooltip on the inline tag and skips the explanation row for displayMode='tooltip'", () => {
    const tooltipGlossary = [
      {
        key: "one-shot",
        name: "One Shot",
        description: "The bearer can only shoot with this weapon once per battle.",
        matchType: "exact",
        appliesTo: ["weapons"],
        displayMode: "tooltip",
      },
    ];
    const { container } = render(
      <Ds40kUnitWeapons unit={unitWith(["One Shot"])} weaponTypes={weaponTypes} keywordGlossary={tooltipGlossary} />,
    );
    // No explanation row underneath the weapon profile
    expect(container.querySelector(".special .ability")).toBeNull();
    // Inline tag is wrapped in our (mocked) Tooltip with the description as content
    const tooltipTrigger = container.querySelector("[data-tooltip-content]");
    expect(tooltipTrigger).toBeTruthy();
    expect(tooltipTrigger.getAttribute("data-tooltip-content")).toMatch(/once per battle/i);
    // The inline tag is flagged as carrying extra info so CSS can underline it.
    expect(tooltipTrigger.querySelector(".keyword-button.has-info")).toBeTruthy();
  });

  it("leaves the inline tag plain for explanation-mode glossary entries (no has-info)", () => {
    // Explanation-mode entries put the description in the row below the
    // weapon table, not in a hover tooltip — so the inline tag stays
    // plain. Reserve the dotted underline for actual hover tooltips.
    const { container } = render(
      <Ds40kUnitWeapons unit={unitWith(["One Shot"])} weaponTypes={weaponTypes} keywordGlossary={glossary} />,
    );
    const button = container.querySelector(".keyword .keyword-button");
    expect(button).toBeTruthy();
    expect(button.classList.contains("has-info")).toBe(false);
  });

  it("leaves the inline tag plain when no glossary entry matches", () => {
    const { container } = render(
      <Ds40kUnitWeapons unit={unitWith(["Made Up Keyword"])} weaponTypes={weaponTypes} keywordGlossary={glossary} />,
    );
    const button = container.querySelector(".keyword .keyword-button");
    expect(button).toBeTruthy();
    expect(button.classList.contains("has-info")).toBe(false);
  });

  it("ignores glossary entries whose appliesTo does not include 'weapons'", () => {
    // Both glossary entries share the name "One Shot" but only one is scoped to weapons.
    render(<Ds40kUnitWeapons unit={unitWith(["One Shot"])} weaponTypes={weaponTypes} keywordGlossary={glossary} />);
    expect(screen.queryByText(/Should never render under a weapon profile/i)).toBeNull();
    expect(screen.getByText(/once per battle/i)).toBeInTheDocument();
  });
});
