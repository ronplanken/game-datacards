import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { replaceKeywords } from "../UnitAbilityDescription";

// Mock tooltip components to render keyword text visibly
vi.mock("../KeywordTooltip", () => ({
  KeywordTooltip: ({ keyword }) => <span data-testid="keyword-tooltip">{keyword}</span>,
  tooltipProps: {},
}));

vi.mock("../RuleTooltip", () => ({
  RuleTooltip: ({ keyword }) => <span data-testid="rule-tooltip">{keyword}</span>,
}));

vi.mock("../../../MarkdownSpanWrapDisplay", () => ({
  MarkdownSpanWrapDisplay: ({ content }) => <span>{content}</span>,
}));

vi.mock("../../../Tooltip/Tooltip", () => ({
  Tooltip: ({ content, children }) => (
    <span data-testid="glossary-tooltip" data-content={content}>
      {children}
    </span>
  ),
}));

function renderKeywords(input, glossary) {
  const result = replaceKeywords(input, glossary);
  const { container } = render(<div>{result}</div>);
  return container;
}

function getTooltipKeywords(container, testId) {
  return Array.from(container.querySelectorAll(`[data-testid="${testId}"]`)).map((el) => el.textContent);
}

describe("replaceKeywords", () => {
  describe("null/empty input", () => {
    it("returns undefined for null input", () => {
      expect(replaceKeywords(null)).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(replaceKeywords("")).toBeUndefined();
    });
  });

  describe("false positive prevention - word boundaries", () => {
    it("does not match 'Blast' inside 'Blaster'", () => {
      const container = renderKeywords("Equipped with a Blaster weapon");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).not.toContain("blast");
    });

    it("does not match 'Stealth' inside 'Stealthsuit'", () => {
      const container = renderKeywords("Wearing a Stealthsuit for protection");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).not.toContain("stealth");
    });

    it("does not match 'Psychic' inside 'Psychically'", () => {
      const container = renderKeywords("Psychically attuned warrior");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).not.toContain("psychic");
    });

    it("does not match 'Lance' inside 'Freelance'", () => {
      const container = renderKeywords("A Freelance operative");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).not.toContain("lance");
    });
  });

  describe("false positive prevention - phrase context", () => {
    it("does not match 'Precision' in 'Tactical Precision:'", () => {
      const container = renderKeywords("Tactical Precision: This unit rerolls hits");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).not.toContain("precision");
    });

    it("does not match 'Stealth' in 'Advanced Stealth:'", () => {
      const container = renderKeywords("Advanced Stealth: This unit cannot be targeted");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).not.toContain("stealth");
    });

    it("does not match 'Blast' in 'Focused Blast:'", () => {
      const container = renderKeywords("Focused Blast: Each time this unit shoots");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).not.toContain("blast");
    });
  });

  describe("true positive preservation - standalone keywords", () => {
    it("matches standalone 'Precision'", () => {
      const container = renderKeywords("This weapon has Precision and deals extra damage");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).toContain("precision");
    });

    it("matches standalone 'Blast'", () => {
      const container = renderKeywords("This weapon has Blast and Torrent");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).toContain("blast");
      expect(keywords).toContain("torrent");
    });

    it("matches standalone 'Stealth'", () => {
      const container = renderKeywords("This unit has Stealth");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).toContain("stealth");
    });

    it("matches 'Sustained Hits 2'", () => {
      const container = renderKeywords("This weapon has Sustained Hits 2");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).toContain("sustained hits 2");
    });

    it("matches 'Anti-Infantry 4+'", () => {
      const container = renderKeywords("This weapon has Anti-Infantry 4+");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).toContain("anti-infantry 4+");
    });

    it("matches keyword at start of string", () => {
      const container = renderKeywords("Precision is key to this ability");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).toContain("precision");
    });

    it("matches keyword before punctuation", () => {
      const container = renderKeywords("This weapon has Precision.");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).toContain("precision");
    });
  });

  describe("bracket keywords always match", () => {
    it("matches [Precision] even after a capitalized word", () => {
      const container = renderKeywords("Tactical [Precision] ability");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).toContain("precision");
    });

    it("matches [Stealth] as a rule keyword", () => {
      const container = renderKeywords("This unit has [Stealth]");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).toContain("stealth");
    });
  });

  describe("Deadly Demise variants", () => {
    it("matches 'Deadly Demise 1'", () => {
      const container = renderKeywords("This model has Deadly Demise 1");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).toContain("deadly demise 1");
    });

    it("matches 'Deadly Demise D3'", () => {
      const container = renderKeywords("This model has Deadly Demise D3");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).toContain("deadly demise d3");
    });

    it("matches 'Deadly Demise D6'", () => {
      const container = renderKeywords("This model has Deadly Demise D6");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).toContain("deadly demise d6");
    });

    it("matches 'Deadly Demise 2D6'", () => {
      const container = renderKeywords("This model has Deadly Demise 2D6");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).toContain("deadly demise 2d6");
    });

    it("matches 'Deadly Demise D6+2'", () => {
      const container = renderKeywords("This model has Deadly Demise D6+2");
      const rules = getTooltipKeywords(container, "rule-tooltip");
      expect(rules).toContain("deadly demise d6+2");
    });
  });

  describe("inline keyword flow", () => {
    it("renders bracket keyword as a span, not a button", () => {
      const container = renderKeywords("This weapon has the [ASSAULT] ability.");
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
      const keywordSpan = container.querySelector(".keyword");
      expect(keywordSpan).not.toBeNull();
      expect(keywordSpan.tagName).toBe("SPAN");
    });
  });

  describe("backslash escape", () => {
    it("renders escaped keyword as plain text without backslash", () => {
      const container = renderKeywords("This unit has \\Precision aiming");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).not.toContain("precision");
      expect(container.textContent).toContain("Precision");
    });

    it("does not affect non-escaped keywords in the same string", () => {
      const container = renderKeywords("\\Precision and Blast are different");
      const keywords = getTooltipKeywords(container, "keyword-tooltip");
      expect(keywords).not.toContain("precision");
      expect(keywords).toContain("blast");
    });
  });

  describe("datasource glossary keywords", () => {
    const glossary = [
      {
        key: "shadow-step",
        name: "Shadow Step",
        description: "This unit can move through walls.",
        matchType: "exact",
        appliesTo: ["abilities"],
        displayMode: "tooltip",
      },
      {
        key: "barrage",
        name: "Barrage",
        description: "Explanation-mode entry.",
        matchType: "exact",
        appliesTo: ["abilities"],
        displayMode: "explanation",
      },
    ];

    it("underlines a glossary keyword found in the description with a tooltip", () => {
      const container = renderKeywords("The model uses Shadow Step to advance", glossary);
      const button = container.querySelector(".keyword-button.has-info");
      expect(button).not.toBeNull();
      expect(button.textContent).toBe("Shadow Step");
      const tooltip = container.querySelector('[data-testid="glossary-tooltip"]');
      expect(tooltip.getAttribute("data-content")).toBe("This unit can move through walls.");
    });

    it("does not touch the description when no glossary is provided", () => {
      const container = renderKeywords("The model uses Shadow Step to advance");
      expect(container.querySelector(".keyword-button.has-info")).toBeNull();
      expect(container.textContent).toContain("Shadow Step");
    });

    it("ignores glossary entries in explanation display mode", () => {
      const container = renderKeywords("Incoming Barrage hits hard", glossary);
      expect(container.querySelector(".keyword-button.has-info")).toBeNull();
    });

    it("does not match a glossary keyword inside a larger word", () => {
      const container = renderKeywords("A Shadow Stepper appears", glossary);
      expect(container.querySelector(".keyword-button.has-info")).toBeNull();
    });

    it("skips the built-in 40K dictionary in glossary-only mode", () => {
      const result = replaceKeywords("This weapon has [LANCE] and Stealth", glossary, true);
      const { container } = render(<div>{result}</div>);
      expect(getTooltipKeywords(container, "keyword-tooltip")).toEqual([]);
      expect(getTooltipKeywords(container, "rule-tooltip")).toEqual([]);
      // Bracket tags are left as literal text, not parsed into keyword tags.
      expect(container.textContent).toContain("[LANCE]");
    });

    it("still matches glossary keywords in glossary-only mode", () => {
      const result = replaceKeywords("The model uses Shadow Step here", glossary, true);
      const { container } = render(<div>{result}</div>);
      const button = container.querySelector(".keyword-button.has-info");
      expect(button).not.toBeNull();
      expect(button.textContent).toBe("Shadow Step");
    });

    it("still parses the built-in dictionary when glossary-only mode is off", () => {
      const container = renderKeywords("This unit has Stealth", glossary);
      expect(getTooltipKeywords(container, "rule-tooltip")).toContain("stealth");
    });
  });

  describe("per-keyword glossary styling", () => {
    const styled = (style) => [
      {
        key: "shadow-step",
        name: "Shadow Step",
        description: "Move through walls.",
        matchType: "exact",
        appliesTo: ["abilities"],
        displayMode: "tooltip",
        ...(style ? { style } : {}),
      },
    ];

    it("renders uppercase + brackets + bold by default", () => {
      const container = renderKeywords("Uses Shadow Step now", styled());
      const button = container.querySelector(".keyword-button");
      expect(button.className).not.toContain("kw-no-caps");
      expect(button.className).not.toContain("kw-no-bold");
      expect(container.textContent).toContain("[");
      expect(container.textContent).toContain("]");
    });

    it("drops brackets when style.brackets is none", () => {
      const container = renderKeywords("Uses Shadow Step now", styled({ brackets: "none" }));
      expect(container.querySelector(".keyword-button")).not.toBeNull();
      expect(container.textContent).not.toContain("[");
      expect(container.textContent).not.toContain("]");
    });

    it("adds kw-no-caps when style.casing is normal", () => {
      const container = renderKeywords("Uses Shadow Step now", styled({ casing: "normal" }));
      expect(container.querySelector(".keyword-button").className).toContain("kw-no-caps");
    });

    it("adds kw-no-bold when style.weight is normal", () => {
      const container = renderKeywords("Uses Shadow Step now", styled({ weight: "normal" }));
      expect(container.querySelector(".keyword-button").className).toContain("kw-no-bold");
    });
  });
});
