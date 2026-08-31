import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import less from "less";

// The 10e/11e weapon row renders its keyword list as a `.keyword` span of
// inline-block buttons inside the (narrow) name column.
//
// By default that list wraps, so a long list stays inside the name column. The
// card's "Wrap Keywords" styling toggle turns wrapping off by adding
// `keywords-nowrap` to the weapons panel, which keeps each list on one unbroken
// line running on under the characteristic columns.
//
// Both weapon types must behave identically: melee once carried its keyword
// rule commented out, so melee and ranged laid out differently on one card.
const STYLE_FILE = resolve(process.cwd(), "src/styles/40k-10e.less");

const CARD = ".unit .data_container .data .weapons";
const VIEWER = ".viewer .unit .data_container .data .weapons";
const CELL = ".weapon .line .value";

let css = "";

beforeAll(async () => {
  const source = readFileSync(STYLE_FILE, "utf8");
  const output = await less.render(source, { filename: STYLE_FILE, paths: [dirname(STYLE_FILE)] });
  css = output.css;
});

// Returns the declaration block of the rule whose selector list contains
// exactly `selector`. Matching on a whole selector matters: the printed card
// selector is a suffix of the mobile viewer one, so a substring search would
// silently answer for the wrong rule.
const ruleBody = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|[\\n,])\\s*${escaped}\\s*[,{][^}]*}`, "m").exec(css);
  if (!match) return null;
  return match[0].slice(match[0].indexOf("{") + 1, -1);
};

describe("40k 10e/11e weapon keyword layout", () => {
  // The bug this replaced: an unconditional `white-space: nowrap` on ranged and
  // a commented-out one on melee. Nothing may reintroduce it outside the
  // `keywords-nowrap` opt-out.
  it.each([
    ["ranged", "printed card", `.data-40k-10e ${CARD} .ranged ${CELL} .keyword`],
    ["melee", "printed card", `.data-40k-10e ${CARD} .melee ${CELL} .keyword`],
    ["ranged", "mobile viewer", `.data-40k-10e ${VIEWER} .ranged ${CELL} .keyword`],
    ["melee", "mobile viewer", `.data-40k-10e ${VIEWER} .melee ${CELL} .keyword`],
  ])("lets %s weapon keywords wrap by default on the %s", (_type, _surface, selector) => {
    // The rule may be absent entirely — what matters is that nothing forces
    // the list onto one line.
    expect(ruleBody(selector) ?? "").not.toContain("white-space: nowrap");
  });

  it.each([
    ["printed card", `.data-40k-10e ${CARD}`],
    ["mobile viewer", `.data-40k-10e ${VIEWER}`],
    ["11th edition printed card", `.data-40k-11e ${CARD}`],
    ["11th edition mobile viewer", `.data-40k-11e ${VIEWER}`],
  ])("keeps keywords on one line when the toggle is off, on the %s", (_surface, prefix) => {
    const body = ruleBody(`${prefix}.keywords-nowrap .weapon .line .keyword`);

    expect(body, `${prefix}.keywords-nowrap should be present in the compiled stylesheet`).not.toBeNull();
    expect(body).toContain("white-space: nowrap");
  });

  // A grid track's automatic minimum is its content's min-content width, so a
  // nowrap keyword list widens the name column and drags the characteristic
  // columns out of line with their header row unless the cell can shrink.
  it.each([
    ["ranged", "printed card", `.data-40k-10e ${CARD} .ranged ${CELL}`],
    ["melee", "printed card", `.data-40k-10e ${CARD} .melee ${CELL}`],
    ["ranged", "mobile viewer", `.data-40k-10e ${VIEWER} .ranged ${CELL}`],
    ["melee", "mobile viewer", `.data-40k-10e ${VIEWER} .melee ${CELL}`],
  ])("lets the %s name column shrink on the %s", (_type, _surface, selector) => {
    expect(ruleBody(selector)).toContain("min-width: 0");
  });
});
