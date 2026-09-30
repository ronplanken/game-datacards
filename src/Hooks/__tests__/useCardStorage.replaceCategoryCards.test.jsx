import React from "react";
import { act, render } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CardStorageProviderComponent, useCardStorage } from "../useCardStorage";

vi.mock("../../Components/Toast/message", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

const seed = (category) =>
  localStorage.setItem("storage", JSON.stringify({ version: "1.0.0", categories: [category] }));

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

const storedCategory = () => JSON.parse(localStorage.getItem("storage")).categories[0];

describe("replaceCategoryCards", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("replaces cards by uuid and keeps the others, including later edits", () => {
    seed({
      uuid: "cat-1",
      name: "List",
      cards: [
        { uuid: "a", name: "Belial", t: 5 },
        { uuid: "b", name: "Azrael", note: "edited later" },
      ],
    });
    const api = renderStorage();
    act(() => api.replaceCategoryCards("cat-1", [{ uuid: "a", name: "Belial", t: 6 }]));

    const cards = storedCategory().cards;
    expect(cards[0]).toEqual({ uuid: "a", name: "Belial", t: 6 });
    expect(cards[1]).toEqual({ uuid: "b", name: "Azrael", note: "edited later" });
  });

  it("ignores cards that are no longer in the category", () => {
    seed({ uuid: "cat-1", name: "List", cards: [{ uuid: "a", name: "Belial" }] });
    const api = renderStorage();
    act(() => api.replaceCategoryCards("cat-1", [{ uuid: "gone", name: "Removed" }]));
    expect(storedCategory().cards).toEqual([{ uuid: "a", name: "Belial" }]);
  });

  it("marks a synced category as pending", () => {
    seed({ uuid: "cat-1", name: "List", syncEnabled: true, localVersion: 3, cards: [{ uuid: "a", t: 5 }] });
    const api = renderStorage();
    act(() => api.replaceCategoryCards("cat-1", [{ uuid: "a", t: 6 }]));
    expect(storedCategory()).toMatchObject({ syncStatus: "pending", localVersion: 4 });
  });

  it("refreshes the active card when it was replaced", () => {
    seed({ uuid: "cat-1", name: "List", cards: [{ uuid: "a", t: 5 }] });
    const api = renderStorage();
    act(() => api.setActiveCard({ uuid: "a", t: 5 }));
    act(() => api.replaceCategoryCards("cat-1", [{ uuid: "a", t: 6 }]));
    expect(api.activeCard).toEqual({ uuid: "a", t: 6 });
    expect(api.cardUpdated).toBe(false);
  });
});
