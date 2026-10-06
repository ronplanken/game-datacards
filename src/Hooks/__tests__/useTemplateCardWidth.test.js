import { describe, it, expect } from "vitest";
import { templateCardWidth } from "../useTemplateCardWidth";

const templates = [
  { uuid: "t1", canvas: { width: 1080, height: 720 } },
  { uuid: "t2", canvas: { width: "640", height: 900 } },
  { uuid: "t3", canvas: {} },
];

describe("templateCardWidth", () => {
  it("returns the width of the card's template", () => {
    expect(templateCardWidth(templates, { templateId: "t1" })).toBe(1080);
    expect(templateCardWidth(templates, { templateId: "t2" })).toBe(640);
  });

  it("returns null for cards without a template or an unknown one", () => {
    expect(templateCardWidth(templates, { cardType: "DataCard" })).toBeNull();
    expect(templateCardWidth(templates, { templateId: "missing" })).toBeNull();
    expect(templateCardWidth(templates, { templateId: "t3" })).toBeNull();
    expect(templateCardWidth(undefined, { templateId: "t1" })).toBeNull();
    expect(templateCardWidth(templates, null)).toBeNull();
  });
});
