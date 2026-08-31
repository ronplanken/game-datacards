import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import less from "less";

// The 10e/11e weapon row renders its keyword list as a `.keyword` span of
// inline-block buttons inside the (narrow) name column. `white-space: nowrap`
// is what keeps that list on one line so it runs on under the characteristic
// columns; without it the list folds inside the name column and the row grows.
// The melee block used to carry the rule commented out, so melee and ranged
// weapons laid their keywords out differently on the same card.
const STYLE_FILE = resolve(process.cwd(), "src/styles/40k-10e.less");

const CARD = ".unit .data_container .data .weapons";
const VIEWER = ".viewer .unit .data_container .data .weapons";
const CELL = ".weapon .line .value";
const KEYWORD = `${CELL} .keyword`;

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
  it.each([
    ["ranged", "printed card", `.data-40k-10e ${CARD} .ranged ${KEYWORD}`],
    ["melee", "printed card", `.data-40k-10e ${CARD} .melee ${KEYWORD}`],
    ["ranged", "mobile viewer", `.data-40k-10e ${VIEWER} .ranged ${KEYWORD}`],
    ["melee", "mobile viewer", `.data-40k-10e ${VIEWER} .melee ${KEYWORD}`],
  ])("keeps %s weapon keywords on one line on the %s", (_type, _surface, selector) => {
    const body = ruleBody(selector);

    expect(body, `${selector} should be present in the compiled stylesheet`).not.toBeNull();
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

  it("applies the same rules to 11th edition", () => {
    expect(ruleBody(`.data-40k-11e ${CARD} .melee ${KEYWORD}`)).toContain("white-space: nowrap");
    expect(ruleBody(`.data-40k-11e ${CARD} .melee ${CELL}`)).toContain("min-width: 0");
  });
});
