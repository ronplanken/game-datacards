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
  { key: "one-shot", name: "One Shot", description: "The bearer can only shoot with this weapon once per battle." },
  { key: "anti", name: "Anti-", description: "Critical Wounds vs matching keyword.", matchType: "prefix" },
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
  it("renders an explanation block when a weapon keyword matches the glossary", () => {
    const { container } = render(
      <Ds40kUnitWeapons unit={unitWith(["One Shot"])} weaponTypes={weaponTypes} weaponKeywordGlossary={glossary} />,
    );
    const explanation = container.querySelector(".special");
    expect(explanation).toBeTruthy();
    expect(explanation.querySelector(".heading .title").textContent).toBe("One Shot");
    expect(screen.getByText(/once per battle/i)).toBeInTheDocument();
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
        weaponKeywordGlossary={glossary}
      />,
    );
    expect(screen.queryByText(/once per battle/i)).toBeNull();
    expect(screen.queryByText(/Critical Wounds vs matching keyword/i)).toBeNull();
  });

  it("resolves prefix matches for parametrised keywords", () => {
    render(
      <Ds40kUnitWeapons
        unit={unitWith(["Anti-Infantry 4+"])}
        weaponTypes={weaponTypes}
        weaponKeywordGlossary={glossary}
      />,
    );
    expect(screen.getByText(/Critical Wounds vs matching keyword/i)).toBeInTheDocument();
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
    render(<Ds40kUnitWeapons unit={unit} weaponTypes={weaponTypes} weaponKeywordGlossary={glossary} />);
    expect(screen.getAllByText(/once per battle/i)).toHaveLength(1);
  });
});
