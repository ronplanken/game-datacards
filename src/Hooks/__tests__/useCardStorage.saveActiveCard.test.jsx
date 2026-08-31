import React from "react";
import { act, render } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CardStorageProviderComponent, useCardStorage } from "../useCardStorage";

vi.mock("../../Components/Toast/message", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

const CATEGORY_UUID = "cat-1";
const CARD_UUID = "card-1";

const seedStorage = () => {
  localStorage.setItem(
    "storage",
    JSON.stringify({
      version: "1.0.0",
      categories: [
        {
          uuid: CATEGORY_UUID,
          name: "My Cards",
          cards: [{ uuid: CARD_UUID, name: "Chosen", hasCustomFactionSymbol: false }],
        },
      ],
    }),
  );
};

const renderStorage = () => {
  const api = {};
  const Probe = () => {
    Object.assign(api, useCardStorage());
    return null;
  };
  render(
    <CardStorageProviderComponent>
      <Probe />
    </CardStorageProviderComponent>,
  );
  return api;
};

const storedCard = () =>
  JSON.parse(localStorage.getItem("storage")).categories.find((c) => c.uuid === CATEGORY_UUID).cards[0];

describe("saveActiveCard", () => {
  beforeEach(() => {
    localStorage.clear();
    seedStorage();
  });

  it("persists a card handed to it directly", () => {
    const api = renderStorage();
    act(() => {
      api.setActiveCategory({ uuid: CATEGORY_UUID });
      api.setActiveCard({ uuid: CARD_UUID, name: "Chosen", hasCustomFactionSymbol: false });
    });

    act(() => {
      api.saveActiveCard({ uuid: CARD_UUID, name: "Chosen", hasCustomFactionSymbol: true });
    });

    expect(storedCard().hasCustomFactionSymbol).toBe(true);
  });

  it("persists the latest update, not the card of the render it was created in", () => {
    // Regression: a deferred save used to write back the card as it was before
    // the update, so toggling the custom faction symbol off saved it on again.
    const api = renderStorage();
    act(() => {
      api.setActiveCategory({ uuid: CATEGORY_UUID });
      api.setActiveCard({ uuid: CARD_UUID, name: "Chosen", hasCustomFactionSymbol: true });
    });

    const staleSave = api.saveActiveCard;
    act(() => {
      api.updateActiveCard({ uuid: CARD_UUID, name: "Chosen", hasCustomFactionSymbol: false });
    });
    act(() => {
      staleSave();
    });

    expect(storedCard().hasCustomFactionSymbol).toBe(false);
  });

  it("leaves storage untouched when there is no category or no matching card", () => {
    const api = renderStorage();
    act(() => {
      api.setActiveCard({ uuid: CARD_UUID, name: "Chosen", hasCustomFactionSymbol: true });
    });
    act(() => {
      api.saveActiveCard();
    });
    expect(storedCard().hasCustomFactionSymbol).toBe(false);

    act(() => {
      api.setActiveCategory({ uuid: CATEGORY_UUID });
    });
    act(() => {
      api.saveActiveCard({ uuid: "not-in-this-category", hasCustomFactionSymbol: true });
    });
    expect(storedCard().hasCustomFactionSymbol).toBe(false);
    expect(JSON.parse(localStorage.getItem("storage")).categories[0].cards).toHaveLength(1);
  });
});
