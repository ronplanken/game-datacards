import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

import { UnitKeywords } from "../UnitCard/UnitKeywords";

describe("11e UnitKeywords", () => {
  it("renders all-models and per-model keyword lines", () => {
    const { container } = render(
      <UnitKeywords
        keywords={[{ en: "Infantry" }, { en: "Tacticus" }, { en: "Character" }]}
        modelKeywords={[{ name: { en: "Ancient" }, keywords: [{ en: "Character" }] }]}
      />,
    );
    expect(container.querySelector(".value").textContent).toBe("All models: Infantry, Tacticus Ancient: Character");
  });

  it("renders one keyword line for data without model keywords", () => {
    const { container } = render(<UnitKeywords keywords={[{ en: "Infantry" }, { en: "Character" }]} />);
    expect(container.querySelector(".value").textContent).toBe("Infantry, Character ");
  });
});
