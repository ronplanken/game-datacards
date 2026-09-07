import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ store: {}, settings: {}, normal: vi.fn(), patrol: vi.fn(), setItem: vi.fn() }));
vi.mock("localforage", () => ({
  default: {
    createInstance: () => ({
      getItem: vi.fn(async (key) => state.store[key]),
      setItem: (key, value) => {
        state.store[key] = value;
        state.setItem(key, value);
        return Promise.resolve(value);
      },
    }),
  },
}));
vi.mock("../useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: state.settings, updateSettings: vi.fn() }),
}));
vi.mock("../../Components/Toast/message", () => ({ message: { error: vi.fn(), success: vi.fn() } }));
vi.mock("../../Helpers/external.helpers", () => ({
  getBasicData: () => ({ data: [] }),
  get40k11eData: (...args) => state.normal(...args),
  get40k11eCombatPatrolData: (...args) => state.patrol(...args),
}));
import { DataSourceStorageProviderComponent, useDataSourceStorage } from "../useDataSourceStorage";
const wrapper = ({ children }) => <DataSourceStorageProviderComponent>{children}</DataSourceStorageProviderComponent>;
const dataset = { schemaVersion: 2, language: "en", data: [{ id: "p1", name: "Patrol" }] };

describe("11e cache migration", () => {
  beforeEach(() => {
    state.store = {};
    state.settings = {
      selectedDataSource: "40k-11e",
      language: "en",
      selectedFactionIndex: { "40k-11e": 0, "40k-11e-cp": 12 },
    };
    state.normal.mockReset().mockResolvedValue(dataset);
    state.patrol.mockReset().mockResolvedValue(dataset);
    state.setItem.mockReset();
  });
  it("refreshes pre-companion caches even when the language matches", async () => {
    state.store["40k-11e"] = { ...dataset, schemaVersion: undefined };
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    await waitFor(() => expect(result.current.dataSource.schemaVersion).toBe(2));
    expect(state.normal).toHaveBeenCalledWith("en");
    expect(state.setItem).toHaveBeenCalledWith("40k-11e", dataset);
  });
  it("uses a distinct patrol cache and falls back when a saved patrol index was retired", async () => {
    state.settings.selectedDataSource = "40k-11e-cp";
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    await waitFor(() => expect(result.current.selectedFaction?.id).toBe("p1"));
    expect(state.patrol).toHaveBeenCalledWith("en");
    expect(state.normal).not.toHaveBeenCalled();
    expect(state.setItem).toHaveBeenCalledWith("40k-11e-cp", dataset);
  });
  it("reuses a compatible cache without a network request", async () => {
    state.settings.selectedDataSource = "40k-11e-cp";
    state.store["40k-11e-cp"] = dataset;
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    await waitFor(() => expect(result.current.selectedFaction?.id).toBe("p1"));
    expect(state.patrol).not.toHaveBeenCalled();
  });
  it("keeps the last complete cache when an explicit refresh fails", async () => {
    state.store["40k-11e"] = dataset;
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    await waitFor(() => expect(result.current.dataSource).toBe(dataset));
    state.normal.mockRejectedValue(new Error("incomplete datasource"));
    await act(async () => {
      await result.current.checkForUpdate();
    });
    expect(state.store["40k-11e"]).toBe(dataset);
    expect(result.current.dataSource).toBe(dataset);
    expect(state.setItem).not.toHaveBeenCalled();
  });
});
