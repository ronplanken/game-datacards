import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useDataSourceStorage, DataSourceStorageProviderComponent } from "../useDataSourceStorage";
import { SettingsStorageProviderComponent } from "../useSettingsStorage";

// Mock localforage
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

// Mock uuid to return predictable values
let uuidCounter = 0;
vi.mock("uuid", () => ({
  v4: () => `test-uuid-${++uuidCounter}`,
}));

// Mock external helpers to avoid network calls
vi.mock("../../Helpers/external.helpers", () => ({
  get40KData: vi.fn(async () => ({ data: [] })),
  get40k10eData: vi.fn(async () => ({ data: [] })),
  get40k10eCombatPatrolData: vi.fn(async () => ({ data: [] })),
  getAoSData: vi.fn(async () => ({ data: [] })),
  getBasicData: vi.fn(() => ({ data: [{ id: "basic-1", name: "Basic" }] })),
  getNecromundaBasicData: vi.fn(() => ({ data: [{ id: "necro-1", name: "Necromunda" }] })),
}));

// Mock Toast message
vi.mock("../../Components/Toast/message", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

const wrapper = ({ children }) => (
  <SettingsStorageProviderComponent>
    <DataSourceStorageProviderComponent>{children}</DataSourceStorageProviderComponent>
  </SettingsStorageProviderComponent>
);

describe("createCustomDatasource", () => {
  beforeEach(() => {
    uuidCounter = 0;
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
    localStorage.clear();
  });

  it("returns the createCustomDatasource function", () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });
    expect(result.current.createCustomDatasource).toBeDefined();
    expect(typeof result.current.createCustomDatasource).toBe("function");
  });

  it("creates a datasource with correct structure", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    const metadata = { name: "My Game", version: "1.0.0", author: "Test Author" };
    const schema = {
      version: "1.0.0",
      baseSystem: "40k-10e",
      cardTypes: [{ key: "infantry", label: "Infantry", baseType: "unit", schema: {} }],
    };

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource(metadata, schema);
    });

    expect(response.success).toBe(true);
    expect(response.id).toMatch(/^custom-test-uuid-/);

    // Verify stored data
    const stored = mockStore[response.id];
    expect(stored).toBeDefined();
    expect(stored.name).toBe("My Game");
    expect(stored.version).toBe("1.0.0");
    expect(stored.author).toBe("Test Author");
    expect(stored.sourceType).toBe("local");
    expect(stored.schema).toEqual({
      version: "1.0.0",
      baseSystem: "40k-10e",
      cardTypes: [{ key: "infantry", label: "Infantry", baseType: "unit", schema: {} }],
    });
  });

  it("creates a default faction with datasource name and default colours", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource(
        { name: "My Game", version: "1.0.0" },
        { version: "1.0.0", baseSystem: "blank", cardTypes: [] },
      );
    });

    const stored = mockStore[response.id];
    expect(stored.data).toHaveLength(1);
    expect(stored.data[0].name).toBe("My Game");
    expect(stored.data[0].id).toBe(`${response.id}-default`);
    expect(stored.data[0].colours).toEqual({
      header: "#1a1a2e",
      banner: "#16213e",
    });
  });

  it("registers datasource in settings.customDatasources", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource(
        { name: "Test DS", version: "2.0.0", author: "Author" },
        { version: "1.0.0", baseSystem: "aos", cardTypes: [] },
      );
    });

    const settings = JSON.parse(localStorage.getItem("settings"));
    const registry = settings.customDatasources;
    expect(registry).toHaveLength(1);
    expect(registry[0].id).toBe(response.id);
    expect(registry[0].name).toBe("Test DS");
    expect(registry[0].version).toBe("2.0.0");
    expect(registry[0].author).toBe("Author");
    expect(registry[0].cardCount).toBe(0);
    expect(registry[0].sourceType).toBe("local");
  });

  it("switches active datasource to the new one", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource(
        { name: "Active DS" },
        { version: "1.0.0", baseSystem: "blank", cardTypes: [] },
      );
    });

    const settings = JSON.parse(localStorage.getItem("settings"));
    expect(settings.selectedDataSource).toBe(response.id);
  });

  it("returns error when name is missing", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource({}, { version: "1.0.0", baseSystem: "blank" });
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe("Datasource name is required");
  });

  it("returns error when name is empty string", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource({ name: "  " }, { version: "1.0.0", baseSystem: "blank" });
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe("Datasource name is required");
  });

  it("returns error when schema is missing", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource({ name: "Test" }, null);
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe("Schema is required");
  });

  it("defaults version to 1.0.0 when not provided", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource(
        { name: "No Version" },
        { baseSystem: "blank", cardTypes: [] },
      );
    });

    const stored = mockStore[response.id];
    expect(stored.version).toBe("1.0.0");
  });

  it("defaults author to null when not provided", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource(
        { name: "No Author" },
        { baseSystem: "blank", cardTypes: [] },
      );
    });

    const stored = mockStore[response.id];
    expect(stored.author).toBeNull();
  });

  it("sets lastUpdated to current ISO timestamp", async () => {
    const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

    const before = new Date().toISOString();

    let response;
    await act(async () => {
      response = await result.current.createCustomDatasource(
        { name: "Timestamped" },
        { baseSystem: "blank", cardTypes: [] },
      );
    });

    const after = new Date().toISOString();
    const stored = mockStore[response.id];
    expect(stored.lastUpdated >= before).toBe(true);
    expect(stored.lastUpdated <= after).toBe(true);
  });
});
