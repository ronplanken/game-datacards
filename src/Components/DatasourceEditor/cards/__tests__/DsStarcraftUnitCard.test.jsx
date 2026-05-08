import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DsStarcraftUnitCard } from "../DsStarcraftUnitCard";
import { createStarcraftTcgPreset } from "../../../../Helpers/customSchema.helpers";
import sampleDatasource from "./fixtures/starcraft-tmg.json";

const cardTypeDef = createStarcraftTcgPreset().cardTypes[0];

const zergFaction = sampleDatasource.data.find((f) => f.id === "zerg");
const roach = zergFaction.datasheets.find((u) => u.id === "roach-001");

describe("DsStarcraftUnitCard", () => {
  it("wraps output in .data-starcraft scope class", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    expect(container.querySelector(".data-starcraft")).toBeTruthy();
  });

  it("renders the unit name in the header", () => {
    render(<DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />);
    expect(screen.getByText("Roach")).toBeTruthy();
  });

  it("renders stat pills for speed, evade, armour, hit points, and size", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const header = container.querySelector(".sc-header-stats");
    expect(header).toBeTruthy();
    const labels = within(header)
      .getAllByText(/speed|evade|armour|hit points|size/i)
      .map((el) => el.textContent);
    expect(labels).toEqual(expect.arrayContaining(["Speed", "Evade", "Armour", "Hit Points", "Size"]));
    expect(within(header).getAllByText("4").length).toBeGreaterThan(0);
    expect(within(header).getByText("3+")).toBeTruthy();
  });

  it("renders tiered Models / Supply values", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const supply = container.querySelector(".sc-header-supply");
    expect(supply).toBeTruthy();
    expect(within(supply).getAllByText("1").length).toBeGreaterThan(0);
    expect(within(supply).getByText("2-3")).toBeTruthy();
    expect(within(supply).getByText("Models / Supply")).toBeTruthy();
  });

  it("uses metadata.pointsLabel for the supply caption when set", () => {
    const customCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        metadata: { ...cardTypeDef.schema.metadata, pointsLabel: "Squad Cost" },
      },
    };
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={customCardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    expect(container.querySelector(".sc-supply-caption").textContent).toBe("Squad Cost");
  });

  it("renders Special Abilities section with PASSIVE pill and BM cost chip", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const special = container.querySelector('[data-testid="sc-section-anyPhase"]');
    expect(special).toBeTruthy();
    expect(within(special).getAllByText("PASSIVE").length).toBeGreaterThan(0);
    expect(within(special).getByText(/2 BM/)).toBeTruthy();
  });

  it("renders Assault Phase weapon table with Starcraft columns", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const assault = container.querySelector('[data-testid="sc-section-assault"]');
    expect(assault).toBeTruthy();
    expect(within(assault).getByText("RNG")).toBeTruthy();
    expect(within(assault).getByText("RoA")).toBeTruthy();
    expect(within(assault).getByText("Surge type")).toBeTruthy();
    expect(within(assault).getByText("Acid Saliva")).toBeTruthy();
  });

  it("renders Combat Phase weapon table", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const combat = container.querySelector('[data-testid="sc-section-combat"]');
    expect(combat).toBeTruthy();
    expect(within(combat).getByText("Claws")).toBeTruthy();
  });

  it("renders faction tag pill and keyword tags in the footer", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const pill = container.querySelector(".sc-faction-pill");
    expect(pill).toBeTruthy();
    expect(pill.textContent).toBe("Zerg");
    const tags = container.querySelector(".sc-tags");
    expect(tags).toBeTruthy();
    expect(tags.textContent).toContain("Core, Tank, Armoured, Biological, Ground, Zerg");
  });

  it("applies faction colours via CSS variables", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const root = container.querySelector(".data-starcraft");
    expect(root.style.getPropertyValue("--sc-header-colour")).toBe(zergFaction.colours.header);
    expect(root.style.getPropertyValue("--sc-header-dark")).toBe(zergFaction.colours.banner);
  });

  it("adds viewer class when isMobile is true", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} isMobile />,
    );
    expect(container.querySelector(".data-starcraft.viewer")).toBeTruthy();
  });

  it("hides individual abilities when showAbility is false", () => {
    const cardWithHidden = {
      ...roach,
      abilities: roach.abilities.map((a) => (a.name === "Burrow" ? { ...a, showAbility: false } : a)),
    };
    const { container } = render(
      <DsStarcraftUnitCard card={cardWithHidden} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const special = container.querySelector('[data-testid="sc-section-anyPhase"]');
    expect(special).toBeTruthy();
    expect(within(special).queryByText(/^Burrow$/i)).toBeNull();
    // sibling abilities still render
    expect(within(special).getAllByText(/Tunneling/i).length).toBeGreaterThan(0);
  });

  it("hides an entire ability category when card.showAbilities[key] is false", () => {
    const cardWithHidden = { ...roach, showAbilities: { anyPhase: false } };
    const { container } = render(
      <DsStarcraftUnitCard card={cardWithHidden} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    expect(container.querySelector('[data-testid="sc-section-anyPhase"]')).toBeNull();
    // weapon-bearing categories still render their tables even when their
    // ability list is hidden
    expect(container.querySelector('[data-testid="sc-section-assault"]')).toBeTruthy();
  });

  it("hides the entire phase block when card.showPhases[key] is false", () => {
    const cardWithHidden = { ...roach, showPhases: { assault: false } };
    const { container } = render(
      <DsStarcraftUnitCard card={cardWithHidden} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    expect(container.querySelector('[data-testid="sc-section-assault"]')).toBeNull();
    // Other phases still render
    expect(container.querySelector('[data-testid="sc-section-anyPhase"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="sc-section-combat"]')).toBeTruthy();
  });

  it("hides the Models / Supply block when showPoints is false (Models/Supply rides on Points)", () => {
    const cardHidden = { ...roach, showPoints: false };
    const { container } = render(
      <DsStarcraftUnitCard card={cardHidden} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    expect(container.querySelector(".sc-header-supply")).toBeNull();
  });

  it("hides keyword tags and faction pill when showKeywords is false", () => {
    const cardHidden = { ...roach, showKeywords: false };
    const { container } = render(
      <DsStarcraftUnitCard card={cardHidden} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    expect(container.querySelector(".sc-faction-pill")).toBeNull();
    expect(container.querySelector(".sc-tags")).toBeNull();
  });

  it("applies the viewer scope class on mobile", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} isMobile />,
    );
    expect(container.querySelector(".data-starcraft.viewer")).toBeTruthy();
  });

  it("renders weapons as stacked cards on mobile (no table)", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} isMobile />,
    );
    expect(container.querySelector(".sc-weapon-table")).toBeNull();
    const cards = container.querySelectorAll(".sc-weapon-card");
    expect(cards.length).toBeGreaterThan(0);
    // Stat tiles label the columns inline so the stat block is scannable on
    // a phone without a header row.
    expect(cards[0].querySelector(".sc-weapon-card-stat-label")).toBeTruthy();
  });

  it("renders a back button on mobile only when onBack is provided", () => {
    const onBack = vi.fn();
    const { container, rerender } = render(
      <DsStarcraftUnitCard
        card={roach}
        cardTypeDef={cardTypeDef}
        cardStyle={{}}
        faction={zergFaction}
        isMobile
        onBack={onBack}
      />,
    );
    expect(container.querySelector(".sc-back-button")).toBeTruthy();

    rerender(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} isMobile />,
    );
    expect(container.querySelector(".sc-back-button")).toBeNull();
  });

  it("renders the inline mobile faction pill + tags strip on mobile", () => {
    const { container } = render(
      <DsStarcraftUnitCard card={roach} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} isMobile />,
    );
    const mobileTags = container.querySelector(".sc-mobile-tags");
    expect(mobileTags).toBeTruthy();
    expect(mobileTags.querySelector(".sc-mobile-faction-pill")).toBeTruthy();
  });

  it("accepts native abilities format (object keyed by category)", () => {
    const cardWithNative = {
      ...roach,
      abilities: {
        anyPhase: roach.abilities.filter((a) => a.category === "anyPhase"),
        assault: roach.abilities.filter((a) => a.category === "assault"),
        movement: roach.abilities.filter((a) => a.category === "movement"),
      },
    };
    const { container } = render(
      <DsStarcraftUnitCard card={cardWithNative} cardTypeDef={cardTypeDef} cardStyle={{}} faction={zergFaction} />,
    );
    const special = container.querySelector('[data-testid="sc-section-anyPhase"]');
    expect(special).toBeTruthy();
    expect(within(special).getAllByText("PASSIVE").length).toBeGreaterThan(0);
  });
});
