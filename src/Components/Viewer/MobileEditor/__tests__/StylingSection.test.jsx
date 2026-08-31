import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StylingSection } from "../sections/StylingSection";
import { resolveEditorSections } from "../editorSchemaResolvers";

// The mobile counterpart of the desktop editor's Styling panel. It carries the
// "Wrap Keywords" toggle, which controls whether long weapon keyword lists wrap
// inside the weapon name column or run on as one line under the characteristics.

const unitCard = (source, overrides = {}) => ({
  name: "Intercessors",
  source,
  stats: [{ m: 6, t: 4, sv: "3+", w: 2, ld: "6+", oc: 2, active: true }],
  rangedWeapons: [{ profiles: [{ name: "Bolt Rifle", range: "24", attacks: "2" }] }],
  meleeWeapons: [{ profiles: [{ name: "Close Combat", range: "Melee", attacks: "3" }] }],
  keywords: ["Infantry"],
  factions: ["Adeptus Astartes"],
  ...overrides,
});

describe("mobile Styling section", () => {
  describe("wiring into the editor", () => {
    it.each(["40k-10e", "40k-11e"])("offers a styling section for %s unit cards", (source) => {
      const sections = resolveEditorSections(unitCard(source), source, null);

      const styling = sections.find((s) => s.type === "styling");
      expect(styling).toBeDefined();
      expect(styling.label).toBe("Styling");
    });

    // Keywords live on weapon profiles, so with no weapons the section would
    // offer a toggle that changes nothing on the card.
    it.each(["40k-10e", "40k-11e"])("omits the section for %s cards with no weapons", (source) => {
      const sections = resolveEditorSections(unitCard(source, { rangedWeapons: [], meleeWeapons: [] }), source, null);

      expect(sections.map((s) => s.type)).not.toContain("styling");
    });
  });

  describe("the Wrap Keywords toggle", () => {
    const renderToggle = (card) => {
      const updateField = vi.fn();
      render(<StylingSection card={card} label="Styling" icon={null} updateField={updateField} />);
      return { updateField, toggle: screen.getByText("Wrap Keywords").parentElement.querySelector("button") };
    };

    // Cards saved before the toggle existed carry no flag and must still wrap.
    it("reads as on when the card carries no flag", () => {
      const { toggle } = renderToggle({ name: "Intercessors" });

      expect(toggle.className).toContain("active");
    });

    it("reads as off when the card opted out", () => {
      const { toggle } = renderToggle({ name: "Intercessors", wrapKeywords: false });

      expect(toggle.className).not.toContain("active");
    });

    it("writes the flag as a plain boolean the renderer understands", () => {
      const { updateField, toggle } = renderToggle({ name: "Intercessors" });

      fireEvent.click(toggle);

      expect(updateField).toHaveBeenCalledWith("wrapKeywords", false);
    });

    it("turns wrapping back on", () => {
      const { updateField, toggle } = renderToggle({ name: "Intercessors", wrapKeywords: false });

      fireEvent.click(toggle);

      expect(updateField).toHaveBeenCalledWith("wrapKeywords", true);
    });
  });
});
