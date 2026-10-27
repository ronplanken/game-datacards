import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import less from "less";

const STYLE_FILE = resolve(process.cwd(), "src/styles/40k-10e.less");

const CARD_HEADER = ".data-40k-10e .unit .header .header_container";
const CARD_HEADER_11E = ".data-40k-11e .unit .header .header_container";

let css = "";

beforeAll(async () => {
  const source = readFileSync(STYLE_FILE, "utf8");
  const output = await less.render(source, { filename: STYLE_FILE, paths: [dirname(STYLE_FILE)] });
  css = output.css;
});

const mediaPreludesFor = (selector) => {
  const preludes = [];
  const opening = /@media([^{]+)\{/g;
  let match;
  while ((match = opening.exec(css))) {
    const start = match.index + match[0].length;
    let depth = 1;
    let index = start;
    while (index < css.length && depth > 0) {
      if (css[index] === "{") depth += 1;
      else if (css[index] === "}") depth -= 1;
      index += 1;
    }
    if (css.slice(start, index - 1).includes(selector)) preludes.push(match[1].trim());
  }
  return preludes;
};

const appliesToPrint = (prelude) => prelude.split(",").some((query) => !/\bscreen\b/.test(query));

describe("40k 10e/11e card header labels", () => {
  it.each([
    ["Combat Patrol", `${CARD_HEADER} .combatpatrol::before`, "Combat Patrol Datasheet"],
    ["Combat Patrol", `${CARD_HEADER_11E} .combatpatrol::before`, "Combat Patrol Datasheet"],
    ["Legends", `${CARD_HEADER} .legends::before`, "Warhammer Legends"],
    ["Legends", `${CARD_HEADER_11E} .legends::before`, "Warhammer Legends"],
  ])("renders the %s label on the printed card", (_label, selector, text) => {
    const preludes = mediaPreludesFor(selector);

    expect(preludes.length).toBeGreaterThan(0);
    expect(preludes.some(appliesToPrint)).toBe(true);
    expect(css).toContain(text);
  });

  it("keeps the small-screen label variants off the printed page", () => {
    const preludes = mediaPreludesFor(`${CARD_HEADER} .legends`).filter((prelude) =>
      prelude.includes("max-width: 600px"),
    );

    expect(preludes.length).toBeGreaterThan(0);
    expect(preludes.every(appliesToPrint)).toBe(false);
  });
});
