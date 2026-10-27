import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { UnitLoadout } from "../UnitLoadout";
import { MemoryRouter } from "react-router-dom";

// Mock hooks
vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: { data: [] },
  }),
}));

vi.mock("../../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    cardStorage: { categories: [] },
    setActiveCard: vi.fn(),
    setActiveCategory: vi.fn(),
    cardUpdated: false,
    saveActiveCard: vi.fn(),
  }),
}));

const renderLoadout = (unit) =>
  render(
    <MemoryRouter>
      <UnitLoadout unit={unit} />
    </MemoryRouter>,
  );

describe("UnitLoadout", () => {
  it("renders plain text unchanged when no legacy pattern", () => {
    const unit = { loadout: "Bolt rifle and grenades" };
    renderLoadout(unit);

    expect(screen.getByText("Bolt rifle and grenades")).toBeInTheDocument();
  });

  it("renders markdown bold text", () => {
    const unit = { loadout: "**Important** loadout" };
    renderLoadout(unit);

    expect(screen.getByText("Important")).toBeInTheDocument();
    expect(screen.getByText("Important").tagName).toBe("STRONG");
  });

  it("renders markdown unordered list", () => {
    const unit = { loadout: "**List:**\n- Bolt rifle\n- Grenades\n- Combat knife" };
    const { container } = renderLoadout(unit);

    const listItems = container.querySelectorAll("li");
    expect(listItems).toHaveLength(3);
    expect(listItems[0].textContent).toBe("Bolt rifle");
    expect(listItems[1].textContent).toBe("Grenades");
    expect(listItems[2].textContent).toBe("Combat knife");
  });

  it("renders markdown ordered list", () => {
    const unit = { loadout: "**Steps:**\n1. First item\n2. Second item\n3. Third item" };
    const { container } = renderLoadout(unit);

    const listItems = container.querySelectorAll("li");
    expect(listItems).toHaveLength(3);
    expect(listItems[0].textContent).toBe("First item");
  });

  it("renders markdown horizontal rule", () => {
    const unit = { loadout: "**Section one**\n\n---\n\n**Section two**" };
    const { container } = renderLoadout(unit);

    const hr = container.querySelector("hr");
    expect(hr).toBeInTheDocument();
  });

  it("migrates legacy period-delimited loadout with bold prefix", () => {
    const unit = { loadout: "Every model is equipped with: bolt rifle. Leader has: plasma pistol." };
    renderLoadout(unit);

    expect(screen.getByText("Every model is equipped with:")).toBeInTheDocument();
    expect(screen.getByText("Every model is equipped with:").tagName).toBe("STRONG");
    expect(screen.getByText(/bolt rifle/)).toBeInTheDocument();
    expect(screen.getByText("Leader has:")).toBeInTheDocument();
    expect(screen.getByText("Leader has:").tagName).toBe("STRONG");
  });

  it("renders no loadout for empty string", () => {
    const unit = { loadout: "" };
    const { container } = renderLoadout(unit);

    const loadoutDivs = container.querySelectorAll(".loadout");
    expect(loadoutDivs).toHaveLength(0);
  });

  it("renders no loadout for undefined", () => {
    const unit = { loadout: undefined };
    const { container } = renderLoadout(unit);

    const loadoutDivs = container.querySelectorAll(".loadout");
    expect(loadoutDivs).toHaveLength(0);
  });

  describe("unit composition", () => {
    const compositionTexts = (container) =>
      [...container.querySelectorAll(".composition")].map((node) => node.textContent);

    const rerenderLoadout = (rerender, unit) =>
      rerender(
        <MemoryRouter>
          <UnitLoadout unit={unit} />
        </MemoryRouter>,
      );

    it("renders each entry once, including repeated OR separators", () => {
      const composition = ["1 Team Leader", "OR", "2 Marksmen", "OR", "3 Riflemen"];
      const { container } = renderLoadout({ composition });

      expect(compositionTexts(container)).toEqual(composition);
    });

    it("does not leave stale lines behind when an entry is removed and the card re-renders", () => {
      // Regression: entries were keyed by their text, so repeated "OR" lines
      // shared a key and React left extra lines on the card after an edit.
      const composition = ["1 Team Leader", "OR", "2 Marksmen", "OR", "3 Riflemen", "OR", "4 Grenadiers"];
      const { container, rerender } = renderLoadout({ composition });

      const afterDelete = composition.slice(1);
      rerenderLoadout(rerender, { composition: afterDelete });
      rerenderLoadout(rerender, { composition: [...afterDelete], name: "Edited elsewhere" });

      expect(compositionTexts(container)).toEqual(afterDelete);
    });

    it("keeps blank entries in step with the data when they are added and removed", () => {
      const { container, rerender } = renderLoadout({ composition: ["1 Team Leader", "OR", "2 Marksmen"] });

      const steps = [
        ["1 Team Leader", "OR", "2 Marksmen", ""],
        ["1 Team Leader", "OR", "2 Marksmen", "", ""],
        ["", "OR", "2 Marksmen", "", ""],
        ["OR", "2 Marksmen", ""],
        ["OR", "2 Marksmen", "OR"],
      ];
      steps.forEach((composition, index) => {
        rerenderLoadout(rerender, { composition, name: `edit ${index}` });
        expect(compositionTexts(container)).toEqual(composition);
      });
    });
  });
});
