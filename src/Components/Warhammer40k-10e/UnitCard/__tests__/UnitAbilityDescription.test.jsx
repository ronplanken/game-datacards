import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { replaceKeywords } from "../UnitAbilityDescription";

// Mock tooltip components to render keyword text visibly
vi.mock("../KeywordTooltip", () => ({
  KeywordTooltip: ({ keyword }) => <span data-testid="keyword-tooltip">{keyword}</span>,
}));

vi.mock("../RuleTooltip", () => ({
  RuleTooltip: ({ keyword }) => <span data-testid="rule-tooltip">{keyword}</span>,
}));

vi.mock("../../../MarkdownSpanWrapDisplay", () => ({
  MarkdownSpanWrapDisplay: ({ content }) => <span>{content}</span>,
}));

function renderKeywords(input) {
  const result = replaceKeywords(input);
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
});
