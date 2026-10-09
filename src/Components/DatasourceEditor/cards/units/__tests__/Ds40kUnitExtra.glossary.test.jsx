import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Ds40kUnitExtra } from "../Ds40kUnitExtra";

vi.mock("antd", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Popover: ({ children }) => <>{children}</>,
  Grid: { useBreakpoint: () => ({}) },
}));

// Flatten the custom Tooltip wrapper so the trigger element and its content are
// reachable for assertions.
vi.mock("../../../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => (
    <span data-tooltip-content={typeof content === "string" ? content : "rich"}>{children}</span>
  ),
}));

const abilitiesSchema = {
  label: "Abilities",
  categories: [{ key: "core", label: "Core", format: "name-only" }],
};

const unitWith = (abilities) => ({
  name: "Test Unit",
  abilities,
});

describe("Ds40kUnitExtra name-only glossary tooltips", () => {
  it("renders a hover tooltip for a name-only ability that matches the glossary", () => {
    const glossary = [
      {
        key: "support",
        name: "Support",
        description: "Support units can be attached to a bodyguard unit.",
        matchType: "exact",
        appliesTo: ["abilities"],
      },
    ];
    const { container } = render(
      <Ds40kUnitExtra
        unit={unitWith({ core: ["Support"] })}
        abilitiesSchema={abilitiesSchema}
        keywordGlossary={glossary}
      />,
    );
    const tooltip = container.querySelector("[data-tooltip-content]");
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute("data-tooltip-content")).toMatch(/Support units can be attached/i);
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("renders a name-only ability without a glossary match as plain text", () => {
    const glossary = [
      {
        key: "support",
        name: "Support",
        description: "Support units can be attached to a bodyguard unit.",
        matchType: "exact",
        appliesTo: ["abilities"],
      },
    ];
    const { container } = render(
      <Ds40kUnitExtra
        unit={unitWith({ core: ["Custom Special Ability"] })}
        abilitiesSchema={abilitiesSchema}
        keywordGlossary={glossary}
      />,
    );
    expect(screen.getByText("Custom Special Ability")).toBeInTheDocument();
    expect(container.querySelector("[data-tooltip-content]")).toBeNull();
  });

  it("keeps the built-in 40K tooltip when a name has no glossary entry (10e fallback)", () => {
    const glossary = [
      {
        key: "support",
        name: "Support",
        description: "Support units can be attached to a bodyguard unit.",
        matchType: "exact",
        appliesTo: ["abilities"],
      },
    ];
    const { container } = render(
      <Ds40kUnitExtra
        unit={unitWith({ core: ["Leader"] })}
        abilitiesSchema={abilitiesSchema}
        keywordGlossary={glossary}
      />,
    );
    const tooltip = container.querySelector("[data-tooltip-content]");
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute("data-tooltip-content")).toMatch(/Character units with the Leader ability/i);
  });

  it("renders multiple name-only abilities separated by commas, each resolved", () => {
    const glossary = [
      {
        key: "leader",
        name: "Leader",
        description: "Leads a bodyguard unit.",
        matchType: "exact",
        appliesTo: ["abilities"],
      },
      {
        key: "support",
        name: "Support",
        description: "Support units can be attached to a bodyguard unit.",
        matchType: "exact",
        appliesTo: ["abilities"],
      },
    ];
    const { container } = render(
      <Ds40kUnitExtra
        unit={unitWith({ core: ["Leader", "Support"] })}
        abilitiesSchema={abilitiesSchema}
        keywordGlossary={glossary}
      />,
    );
    const tooltips = container.querySelectorAll("[data-tooltip-content]");
    expect(tooltips).toHaveLength(2);
    expect(tooltips[0].getAttribute("data-tooltip-content")).toMatch(/Leads a bodyguard unit/i);
    expect(tooltips[1].getAttribute("data-tooltip-content")).toMatch(/Support units can be attached/i);
    expect(container.querySelector(".value").textContent).toContain(", ");
  });

  it("ignores glossary entries whose appliesTo does not include 'abilities'", () => {
    const glossary = [
      {
        key: "support",
        name: "Support",
        description: "Should never render under a core ability.",
        matchType: "exact",
        appliesTo: ["weapons"],
      },
    ];
    const { container } = render(
      <Ds40kUnitExtra
        unit={unitWith({ core: ["Support"] })}
        abilitiesSchema={abilitiesSchema}
        keywordGlossary={glossary}
      />,
    );
    expect(container.querySelector("[data-tooltip-content]")).toBeNull();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("resolves a parameterized ability name to its base glossary entry", () => {
    const glossary = [
      {
        key: "feel-no-pain",
        name: "Feel No Pain",
        description: "Ignore wounds on a roll of X+.",
        matchType: "parameterized",
        appliesTo: ["abilities"],
      },
    ];
    const { container } = render(
      <Ds40kUnitExtra
        unit={unitWith({ core: ["Feel No Pain 5+"] })}
        abilitiesSchema={abilitiesSchema}
        keywordGlossary={glossary}
      />,
    );
    const tooltip = container.querySelector("[data-tooltip-content]");
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute("data-tooltip-content")).toMatch(/Ignore wounds on a roll of X\+/i);
  });
});
