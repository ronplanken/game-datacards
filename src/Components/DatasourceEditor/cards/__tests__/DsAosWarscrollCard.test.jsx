import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { DsAosWarscrollCard } from "../DsAosWarscrollCard";

vi.mock("../../../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({
    getImageUrl: vi.fn(),
    isReady: false,
  }),
}));

const cardTypeDef = {
  key: "unit",
  baseType: "unit",
  schema: {
    stats: {
      label: "Stats",
      fields: [
        { key: "move", label: "Move" },
        { key: "save", label: "Save" },
        { key: "control", label: "Control" },
        { key: "health", label: "Health" },
      ],
    },
    weaponTypes: {
      label: "Weapons",
      types: [],
    },
    abilities: {
      label: "Abilities",
      categories: [],
    },
    metadata: {
      hasKeywords: true,
      hasFactionKeywords: true,
    },
  },
};

const faction = {
  id: "faction-1",
  name: "Stormcast Eternals",
  grandAlliance: "order",
};

describe("DsAosWarscrollCard", () => {
  it("wraps output in .data-aos scope class", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".data-aos")).toBeTruthy();
  });

  it("renders with native warscroll CSS class", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".warscroll")).toBeTruthy();
  });

  it("renders unit name", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByText("Liberators")).toBeTruthy();
  });

  it("uses stat wheel when schema has native AoS stat keys", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".stat-wheel-wrapper")).toBeTruthy();
  });

  it("uses stat badges when schema has non-standard stat keys", () => {
    const nonStandardCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        stats: {
          fields: [
            { key: "speed", label: "Speed" },
            { key: "armor", label: "Armor" },
          ],
        },
      },
    };
    const card = { name: "Unit", stats: { speed: "5", armor: "3+" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={nonStandardCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".stat-badges-wrapper")).toBeTruthy();
  });

  it("applies grand alliance class", () => {
    const card = { name: "Liberators", stats: {}, grandAlliance: "death" };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".data-aos.death")).toBeTruthy();
  });

  it("renders faction name in header banner", () => {
    const card = { name: "Liberators", stats: {} };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByText(/STORMCAST ETERNALS/)).toBeTruthy();
  });

  it("has data-testid for testing", () => {
    const card = { name: "Test", stats: {} };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByTestId("ds-aos-warscroll")).toBeTruthy();
  });
});
