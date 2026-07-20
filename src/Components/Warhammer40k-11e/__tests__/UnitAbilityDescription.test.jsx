import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { normalize11eMarkup, MarkupText } from "../UnitCard/UnitAbilityDescription";

describe("normalize11eMarkup", () => {
  it("converts <k> keyword tags to a styled span", () => {
    expect(normalize11eMarkup("<k>Adeptus Astartes</k> model only.")).toContain(
      '<span class="gdc-keyword">Adeptus Astartes</span>',
    );
  });

  it("normalises carriage returns to line feeds", () => {
    expect(normalize11eMarkup("line one\rline two")).toBe("line one\nline two");
  });

  it("puts ■ box bullets on their own line", () => {
    expect(normalize11eMarkup("intro ■ item one ■ item two")).toBe("intro\n■ item one\n■ item two");
  });

  it("returns an empty string for nullish or non-string input", () => {
    expect(normalize11eMarkup(null)).toBe("");
    expect(normalize11eMarkup(undefined)).toBe("");
    expect(normalize11eMarkup({ en: "x" })).toBe("");
  });
});

describe("MarkupText", () => {
  it("renders <k> keywords as gdc-keyword spans", () => {
    const { container } = render(<MarkupText content="<k>Psyker</k> only." />);
    const keyword = container.querySelector(".gdc-keyword");
    expect(keyword).toBeInTheDocument();
    expect(keyword.textContent).toBe("Psyker");
  });

  it("renders markdown bold", () => {
    const { container } = render(<MarkupText content="**Bold text**" />);
    expect(container.querySelector("strong")).toBeInTheDocument();
  });

  it("renders unordered lists", () => {
    const { container } = render(<MarkupText content={"<ul><li>first</li><li>second</li></ul>"} />);
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});
