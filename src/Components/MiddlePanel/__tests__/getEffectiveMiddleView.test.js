import { describe, it, expect } from "vitest";
import { getEffectiveMiddleView } from "../getEffectiveMiddleView";

describe("getEffectiveMiddleView", () => {
  it("returns 'card' by default", () => {
    expect(getEffectiveMiddleView("card", null, false)).toBe("card");
    expect(getEffectiveMiddleView("card", { id: "x" }, true)).toBe("card");
  });

  it("returns 'glossary' only when requested, available, and no card is active", () => {
    expect(getEffectiveMiddleView("glossary", null, true)).toBe("glossary");
  });

  it("falls back to 'card' when the datasource has no glossary", () => {
    expect(getEffectiveMiddleView("glossary", null, false)).toBe("card");
  });

  it("falls back to 'card' when a card is active", () => {
    expect(getEffectiveMiddleView("glossary", { id: "x" }, true)).toBe("card");
  });
});
