import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  GlossaryKeywordTags,
  GlossaryExplanationRows,
  GlossaryText,
  getKeywordExplanations,
  splitKeywordString,
} from "../GlossaryKeywords";

// Flatten the Tooltip wrapper so the trigger element and its content are
// both reachable for assertions.
vi.mock("../../../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => (
    <span data-tooltip-content={typeof content === "string" ? content : "rich"}>{children}</span>
  ),
}));

const glossary = [
  {
    key: "one-shot",
    name: "One Shot",
    description: "Once per battle.",
    matchType: "exact",
    appliesTo: ["weapons"],
    displayMode: "explanation",
  },
  {
    key: "lance",
    name: "Lance",
    description: "+1 to Wound on the charge.",
    matchType: "exact",
    appliesTo: ["weapons"],
    displayMode: "tooltip",
  },
  {
    key: "anti",
    name: "Anti-",
    description: "Critical Wound vs matching keyword.",
    matchType: "prefix",
    appliesTo: ["weapons"],
    displayMode: "explanation",
  },
  {
    key: "rampage",
    name: "Rampage",
    description: "Make a bonus attack.",
    matchType: "exact",
    appliesTo: ["abilities"],
    displayMode: "tooltip",
  },
];

describe("splitKeywordString", () => {
  it("splits a comma-separated keyword cell", () => {
    expect(splitKeywordString("Lance, One Shot")).toEqual(["Lance", "One Shot"]);
  });

  it("does not split on commas inside parentheses", () => {
    expect(splitKeywordString('Target (Ground), Long Range (18"), Specialist')).toEqual([
      "Target (Ground)",
      'Long Range (18")',
      "Specialist",
    ]);
  });

  it("returns [] for empty / non-string input", () => {
    expect(splitKeywordString("")).toEqual([]);
    expect(splitKeywordString("   ")).toEqual([]);
    expect(splitKeywordString(null)).toEqual([]);
    expect(splitKeywordString(undefined)).toEqual([]);
  });
});

describe("getKeywordExplanations", () => {
  it("returns explanation-mode entries and drops tooltip-mode ones", () => {
    const entries = getKeywordExplanations(["One Shot", "Lance", "Anti-Infantry 4+"], glossary, "weapons");
    expect(entries.map((e) => e.key)).toEqual(["one-shot", "anti"]);
  });

  it("returns [] when there is no glossary", () => {
    expect(getKeywordExplanations(["One Shot"], [], "weapons")).toEqual([]);
    expect(getKeywordExplanations(["One Shot"], null, "weapons")).toEqual([]);
  });
});

describe("GlossaryKeywordTags", () => {
  it("renders nothing for an empty keyword list", () => {
    const { container } = render(<GlossaryKeywordTags keywords={[]} glossary={glossary} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a hover tooltip + has-info underline for tooltip-mode entries", () => {
    const { container } = render(<GlossaryKeywordTags keywords={["Lance"]} glossary={glossary} />);
    const trigger = container.querySelector("[data-tooltip-content]");
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("data-tooltip-content")).toMatch(/on the charge/i);
    expect(trigger.querySelector(".ds-kw-tag--has-info")).toBeTruthy();
  });

  it("leaves explanation-mode entries plain (no tooltip, no has-info)", () => {
    const { container } = render(<GlossaryKeywordTags keywords={["One Shot"]} glossary={glossary} />);
    expect(container.querySelector("[data-tooltip-content]")).toBeNull();
    const tag = container.querySelector(".ds-kw-tag");
    expect(tag).toBeTruthy();
    expect(tag.classList.contains("ds-kw-tag--has-info")).toBe(false);
  });

  it("applies per-keyword style (brackets / caps / weight)", () => {
    const styled = [
      {
        key: "lance",
        name: "Lance",
        description: "d",
        matchType: "exact",
        appliesTo: ["weapons"],
        style: { brackets: "square", casing: "normal", weight: "normal" },
      },
    ];
    const { container } = render(<GlossaryKeywordTags keywords={["Lance"]} glossary={styled} />);
    const tag = container.querySelector(".ds-kw-tag");
    expect(tag.textContent).toBe("[Lance]");
    expect(tag.classList.contains("ds-kw-tag--no-caps")).toBe(true);
    expect(tag.classList.contains("ds-kw-tag--no-bold")).toBe(true);
  });

  it("renders plain tags when there is no glossary", () => {
    const { container } = render(<GlossaryKeywordTags keywords={["Made Up"]} glossary={[]} />);
    const tag = container.querySelector(".ds-kw-tag");
    expect(tag).toBeTruthy();
    expect(tag.textContent).toBe("[Made Up]");
    expect(container.querySelector("[data-tooltip-content]")).toBeNull();
  });
});

describe("GlossaryExplanationRows", () => {
  it("renders one row per entry with name + description", () => {
    const entries = getKeywordExplanations(["One Shot", "Anti-Tank 2+"], glossary, "weapons");
    render(<GlossaryExplanationRows entries={entries} />);
    expect(screen.getByText("One Shot")).toBeInTheDocument();
    expect(screen.getByText(/once per battle/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Wound vs matching keyword/i)).toBeInTheDocument();
  });

  it("renders nothing for an empty entry list", () => {
    const { container } = render(<GlossaryExplanationRows entries={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("GlossaryText", () => {
  it("wraps an abilities-scoped tooltip keyword in a hover tooltip", () => {
    const { container } = render(
      <GlossaryText text="This model can Rampage in combat" glossary={glossary} scope="abilities" />,
    );
    const trigger = container.querySelector("[data-tooltip-content]");
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("data-tooltip-content")).toMatch(/bonus attack/i);
    expect(trigger.querySelector(".ds-kw-inline")).toBeTruthy();
  });

  it("returns the raw string when nothing matches", () => {
    const { container } = render(<GlossaryText text="Plain description" glossary={glossary} scope="abilities" />);
    expect(container.textContent).toBe("Plain description");
    expect(container.querySelector("[data-tooltip-content]")).toBeNull();
  });

  it("returns the raw string when there is no glossary", () => {
    const { container } = render(<GlossaryText text="Rampage now" glossary={[]} scope="abilities" />);
    expect(container.textContent).toBe("Rampage now");
  });
});
