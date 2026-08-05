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

  // `remarkBreaks` emits a <br> for every newline and leaves the newline in the
  // text. Honouring both — which `white-space: pre-wrap` on the surrounding
  // `.item` would do — put a blank line between every bullet of a wargear
  // instruction, so the paragraph has to collapse the leftover newline itself.
  it("breaks each line exactly once, so bullet lines stay together", () => {
    const { container } = render(
      <MarkupText content={"Replace with one of the following:\n◦ 1 power fist\n◦ 1 plasma pistol"} />,
    );

    const paragraph = container.querySelector("span");
    expect(paragraph.style.whiteSpace).toBe("normal");
    expect(container.querySelectorAll("br")).toHaveLength(2);
  });

  it("still separates real paragraphs", () => {
    const { container } = render(<MarkupText content={"First paragraph.\n\nSecond paragraph."} />);
    expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
  });
});
