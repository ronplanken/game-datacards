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
  it("renders standard period-delimited loadout correctly", () => {
    const unit = { loadout: "Bolt rifle.Grenades.Combat knife" };
    renderLoadout(unit);

    expect(screen.getByText("Bolt rifle")).toBeInTheDocument();
    expect(screen.getByText("Grenades")).toBeInTheDocument();
    expect(screen.getByText("Combat knife")).toBeInTheDocument();
  });

  it("renders loadout with colon as name and description", () => {
    const unit = { loadout: "Every model: bolt rifle and grenades." };
    renderLoadout(unit);

    expect(screen.getByText("Every model")).toBeInTheDocument();
    // The component splits by "." then by ":", so description is " bolt rifle and grenades" + appended "."
    expect(screen.getByText((_, el) => el?.textContent === " bolt rifle and grenades.")).toBeInTheDocument();
  });

  it("strips backslash-newline markdown line breaks from loadout", () => {
    const unit = { loadout: "Bolt rifle.\\\nGrenades.\\\nCombat knife" };
    renderLoadout(unit);

    expect(screen.getByText("Bolt rifle")).toBeInTheDocument();
    expect(screen.getByText("Grenades")).toBeInTheDocument();
    expect(screen.getByText("Combat knife")).toBeInTheDocument();
    expect(screen.queryByText(/\\/)).not.toBeInTheDocument();
  });

  it("strips plain newlines from loadout", () => {
    const unit = { loadout: "Bolt rifle.\nGrenades.\nCombat knife" };
    renderLoadout(unit);

    expect(screen.getByText("Bolt rifle")).toBeInTheDocument();
    expect(screen.getByText("Grenades")).toBeInTheDocument();
    expect(screen.getByText("Combat knife")).toBeInTheDocument();
  });

  it("renders no loadout entries for empty string", () => {
    const unit = { loadout: "" };
    const { container } = renderLoadout(unit);

    const loadoutDivs = container.querySelectorAll(".loadout");
    expect(loadoutDivs).toHaveLength(0);
  });

  it("renders no loadout entries for undefined loadout", () => {
    const unit = { loadout: undefined };
    const { container } = renderLoadout(unit);

    const loadoutDivs = container.querySelectorAll(".loadout");
    expect(loadoutDivs).toHaveLength(0);
  });
});
