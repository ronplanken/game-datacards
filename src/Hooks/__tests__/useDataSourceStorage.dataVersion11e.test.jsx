import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { useDataSourceStorage, DataSourceStorageProviderComponent } from "../useDataSourceStorage";
import { SettingsStorageProviderComponent } from "../useSettingsStorage";
import { get40k11eData } from "../../Helpers/external.helpers";

const mockStore = {};
vi.mock("localforage", () => ({
  default: {
    createInstance: () => ({
      getItem: vi.fn(async (key) => mockStore[key] || null),
      setItem: vi.fn(async (key, value) => {
        mockStore[key] = value;
      }),
      removeItem: vi.fn(async (key) => {
        delete mockStore[key];
      }),
      clear: vi.fn(async () => {
        Object.keys(mockStore).forEach((key) => delete mockStore[key]);
      }),
    }),
  },
}));

vi.mock("../../Helpers/external.helpers", () => ({
  get40KData: vi.fn(async () => ({ data: [] })),
  get40k10eData: vi.fn(async () => ({ data: [] })),
  get40k11eData: vi.fn(async (language, dataVersion) => ({
    language,
    dataVersion: dataVersion?.version ?? null,
    data: [{ id: "fresh" }],
  })),
  get40k10eCombatPatrolData: vi.fn(async () => ({ data: [] })),
  getAoSData: vi.fn(async () => ({ data: [] })),
  getBasicData: vi.fn(() => ({ data: [] })),
  getNecromundaBasicData: vi.fn(() => ({ data: [] })),
}));

vi.mock("../../Components/Toast/message", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

const wrapper = ({ children }) => (
  <SettingsStorageProviderComponent>
    <DataSourceStorageProviderComponent>{children}</DataSourceStorageProviderComponent>
  </SettingsStorageProviderComponent>
);

const v946 = { version: 946, url: "https://example.test/sha946/11th/gdc" };

const setSettings = (extra) =>
  localStorage.setItem("settings", JSON.stringify({ selectedDataSource: "40k-11e", language: "en", ...extra }));

describe("useDataSourceStorage 11th edition data version", () => {
  beforeEach(() => {
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
    localStorage.clear();
    get40k11eData.mockClear();
  });

  it("uses the cache when it matches the latest selection", async () => {
    setSettings({ dataVersion11e: null });
    mockStore["40k-11e"] = { language: "en", data: [{ id: "cached" }] };
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    await waitFor(() => expect(result.current.selectedFaction?.id).toBe("cached"));
    expect(get40k11eData).not.toHaveBeenCalled();
  });

  it("refetches when a data version is pinned and the cache holds the latest data", async () => {
    setSettings({ dataVersion11e: v946 });
    mockStore["40k-11e"] = { language: "en", dataVersion: null, data: [{ id: "cached" }] };
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    await waitFor(() => expect(result.current.selectedFaction?.id).toBe("fresh"));
    expect(get40k11eData).toHaveBeenCalledWith("en", v946);
    expect(mockStore["40k-11e"].dataVersion).toBe(946);
  });

  it("refetches the latest data when the pin is removed", async () => {
    setSettings({ dataVersion11e: null });
    mockStore["40k-11e"] = { language: "en", dataVersion: 946, data: [{ id: "cached" }] };
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    await waitFor(() => expect(result.current.selectedFaction?.id).toBe("fresh"));
    expect(get40k11eData).toHaveBeenCalledWith("en", null);
  });

  it("uses the cache when it holds the pinned version", async () => {
    setSettings({ dataVersion11e: v946 });
    mockStore["40k-11e"] = { language: "en", dataVersion: 946, data: [{ id: "cached" }] };
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    await waitFor(() => expect(result.current.selectedFaction?.id).toBe("cached"));
    expect(get40k11eData).not.toHaveBeenCalled();
  });
});
