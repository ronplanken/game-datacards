import React from "react";
import { act, render } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CardStorageProviderComponent, useCardStorage } from "../useCardStorage";
import { getErrorContextCard, setErrorContextCard } from "../../Helpers/errorReport.helpers";

vi.mock("../../Components/Toast/message", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

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

describe("useCardStorage error context", () => {
  beforeEach(() => {
    localStorage.clear();
    setErrorContextCard(null);
  });

  it("records the card selected with setActiveCard", () => {
    const api = renderStorage();
    act(() => api.setActiveCard({ id: "c1", name: "Marshal" }));
    expect(getErrorContextCard()).toEqual({ id: "c1", name: "Marshal" });
  });

  it("records the edited card from updateActiveCard", () => {
    const api = renderStorage();
    act(() => api.setActiveCard({ id: "c1", name: "Marshal" }));
    act(() => api.updateActiveCard({ id: "c1", name: "Marshal Helbrecht" }));
    expect(getErrorContextCard()).toEqual({ id: "c1", name: "Marshal Helbrecht" });
  });

  it("records the card before a child renders it", () => {
    const seen = [];
    const api = {};
    const Probe = () => {
      Object.assign(api, useCardStorage());
      seen.push(getErrorContextCard()?.id ?? null);
      return null;
    };
    render(
      <CardStorageProviderComponent>
        <Probe />
      </CardStorageProviderComponent>,
    );
    act(() => api.setActiveCard({ id: "c2", name: "Castellan" }));
    expect(seen[seen.length - 1]).toBe("c2");
  });
});
