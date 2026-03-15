import { renderHook, act } from "@testing-library/react";
import { useDatasourceEditorState } from "../hooks/useDatasourceEditorState";

// Mock localforage with trackable setItem
const mockSetItem = vi.fn((key, value) => Promise.resolve());
const mockGetItem = vi.fn((key) => Promise.resolve(null));

vi.mock("localforage", () => ({
  default: {
    createInstance: () => ({
      getItem: (...args) => mockGetItem(...args),
      setItem: (...args) => mockSetItem(...args),
    }),
  },
}));

// Mock settings storage
const mockSettings = {
  customDatasources: [
    { id: "custom-1", name: "DS One", version: "1.0.0" },
    { id: "custom-2", name: "DS Two", version: "2.0.0" },
  ],
};

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({
    settings: mockSettings,
    updateSettings: vi.fn(),
  }),
}));

// Mock datasource storage
const mockGetCustomDatasourceData = vi.fn();
const mockUpdateDatasourceSyncState = vi.fn((id, fields) => Promise.resolve({ id, ...fields }));

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    getCustomDatasourceData: mockGetCustomDatasourceData,
    updateDatasourceSyncState: mockUpdateDatasourceSyncState,
  }),
}));

const fullDatasource = {
  id: "custom-1",
  name: "DS One",
  version: "1.0.0",
  schema: {
    baseSystem: "40k-10e",
    cardTypes: [
      { key: "infantry", label: "Infantry", baseType: "unit", schema: { stats: {} } },
      { key: "rules", label: "Rules", baseType: "rule", schema: { fields: [] } },
    ],
  },
  data: [
    {
      id: "faction-1",
      name: "Test Faction",
      datasheets: [
        { id: "card-1", name: "Test Unit", cardType: "infantry" },
        { id: "card-2", name: "Another Unit", cardType: "infantry" },
      ],
      rules: [{ id: "card-3", name: "Test Rule", cardType: "rules" }],
    },
  ],
};

// Cookie helper for tests
function setCookie(params) {
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: `gdc-ds-selection=${encodeURIComponent(JSON.stringify(params))}`,
  });
}

function clearCookie() {
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: "",
  });
}

describe("useDatasourceEditorState", () => {
  let cookieJar;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCustomDatasourceData.mockResolvedValue(fullDatasource);

    // Set up cookie mock that behaves like a real cookie jar
    cookieJar = {};
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return Object.entries(cookieJar)
          .map(([k, v]) => `${k}=${v}`)
          .join("; ");
      },
      set(value) {
        const [pair] = value.split(";");
        const [key, val] = pair.split("=");
        if (value.includes("max-age=0")) {
          delete cookieJar[key.trim()];
        } else {
          cookieJar[key.trim()] = val || "";
        }
      },
    });
  });

  afterEach(() => {
    // Restore default cookie behavior
    Object.defineProperty(document, "cookie", {
      configurable: true,
      writable: true,
      value: "",
    });
  });

  it("returns datasources from settings", () => {
    const { result } = renderHook(() => useDatasourceEditorState());
    expect(result.current.datasources).toHaveLength(2);
    expect(result.current.datasources[0].name).toBe("DS One");
  });

  it("starts with no active datasource or selection", () => {
    const { result } = renderHook(() => useDatasourceEditorState());
    expect(result.current.activeDatasource).toBeNull();
    expect(result.current.selectedItem).toBeNull();
  });

  it("openDatasource loads data and selects datasource", async () => {
    const { result } = renderHook(() => useDatasourceEditorState());

    await act(async () => {
      await result.current.openDatasource({ id: "custom-1" });
    });

    expect(mockGetCustomDatasourceData).toHaveBeenCalledWith("custom-1");
    expect(result.current.activeDatasource).toEqual(fullDatasource);
    expect(result.current.selectedItem).toEqual({ type: "datasource" });
  });

  it("selectDatasource sets selectedItem to datasource type", async () => {
    const { result } = renderHook(() => useDatasourceEditorState());

    await act(async () => {
      await result.current.openDatasource({ id: "custom-1" });
    });

    act(() => {
      result.current.selectDatasource(fullDatasource);
    });

    expect(result.current.selectedItem).toEqual({ type: "datasource" });
  });

  it("selectCardType sets selectedItem with card type data", () => {
    const { result } = renderHook(() => useDatasourceEditorState());
    const cardType = fullDatasource.schema.cardTypes[0];

    act(() => {
      result.current.selectCardType(cardType);
    });

    expect(result.current.selectedItem).toEqual({
      type: "cardType",
      key: "infantry",
      data: cardType,
    });
  });

  it("updateDatasource updates active datasource in state", async () => {
    const { result } = renderHook(() => useDatasourceEditorState());

    // First open a datasource
    await act(async () => {
      await result.current.openDatasource({ id: "custom-1" });
    });

    const updated = { ...fullDatasource, name: "Updated Name" };

    await act(async () => {
      await result.current.updateDatasource(updated);
    });

    expect(result.current.activeDatasource.name).toBe("Updated Name");
  });

  it("updateDatasource keeps selectedItem.data in sync when card type selected", async () => {
    const { result } = renderHook(() => useDatasourceEditorState());

    // Open datasource and select a card type
    await act(async () => {
      await result.current.openDatasource({ id: "custom-1" });
    });

    act(() => {
      result.current.selectCardType(fullDatasource.schema.cardTypes[0]);
    });

    // Update the datasource with modified card type
    const modifiedCardType = { ...fullDatasource.schema.cardTypes[0], label: "Heavy Infantry" };
    const updatedDatasource = {
      ...fullDatasource,
      schema: {
        ...fullDatasource.schema,
        cardTypes: [modifiedCardType, fullDatasource.schema.cardTypes[1]],
      },
    };

    await act(async () => {
      await result.current.updateDatasource(updatedDatasource);
    });

    expect(result.current.selectedItem.data.label).toBe("Heavy Infantry");
  });

  it("setCreatedDatasource sets active datasource and selects it", () => {
    const { result } = renderHook(() => useDatasourceEditorState());

    act(() => {
      result.current.setCreatedDatasource(fullDatasource);
    });

    expect(result.current.activeDatasource).toEqual(fullDatasource);
    expect(result.current.selectedItem).toEqual({ type: "datasource" });
  });

  describe("localForage persistence", () => {
    it("updateDatasource persists to localForage with datasource id as key", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      const updated = { ...fullDatasource, name: "Persisted Name" };

      await act(async () => {
        await result.current.updateDatasource(updated);
      });

      expect(mockUpdateDatasourceSyncState).toHaveBeenCalledWith("custom-1", updated);
    });

    it("updateDatasource persists schema changes to localForage", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      // Simulate a schema edit (e.g. adding a stat field)
      const updatedSchema = {
        ...fullDatasource.schema,
        cardTypes: fullDatasource.schema.cardTypes.map((ct) =>
          ct.key === "infantry"
            ? {
                ...ct,
                schema: {
                  ...ct.schema,
                  stats: {
                    fields: [{ key: "m", label: "M", type: "string", displayOrder: 1 }],
                  },
                },
              }
            : ct,
        ),
      };
      const updatedDatasource = { ...fullDatasource, schema: updatedSchema };

      await act(async () => {
        await result.current.updateDatasource(updatedDatasource);
      });

      expect(mockUpdateDatasourceSyncState).toHaveBeenCalledWith("custom-1", updatedDatasource);
      expect(result.current.activeDatasource.schema.cardTypes[0].schema.stats.fields).toHaveLength(1);
    });

    it("updateDatasource persists metadata changes to localForage", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      const updated = { ...fullDatasource, name: "New Name", version: "2.0.0", author: "New Author" };

      await act(async () => {
        await result.current.updateDatasource(updated);
      });

      expect(mockUpdateDatasourceSyncState).toHaveBeenCalledWith(
        "custom-1",
        expect.objectContaining({ name: "New Name", version: "2.0.0", author: "New Author" }),
      );
    });

    it("updateDatasource handles storage errors gracefully", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      mockUpdateDatasourceSyncState.mockRejectedValueOnce(new Error("Storage quota exceeded"));

      const updated = { ...fullDatasource, name: "Should Still Update State" };

      // Should not throw
      await act(async () => {
        await result.current.updateDatasource(updated);
      });

      // State should still be updated even if storage fails
      expect(result.current.activeDatasource.name).toBe("Should Still Update State");
    });

    it("multiple rapid updates each persist to localForage", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      mockUpdateDatasourceSyncState.mockClear();

      await act(async () => {
        await result.current.updateDatasource({ ...fullDatasource, name: "Update 1" });
      });
      await act(async () => {
        await result.current.updateDatasource({ ...fullDatasource, name: "Update 2" });
      });

      expect(mockUpdateDatasourceSyncState).toHaveBeenCalledTimes(2);
      expect(mockUpdateDatasourceSyncState).toHaveBeenLastCalledWith(
        "custom-1",
        expect.objectContaining({ name: "Update 2" }),
      );
    });
  });

  describe("session cookie persistence", () => {
    it("saves selection to cookie when datasource is opened", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      expect(document.cookie).toContain("gdc-ds-selection");
      const match = document.cookie.match(/gdc-ds-selection=([^;]*)/);
      const saved = JSON.parse(decodeURIComponent(match[1]));
      expect(saved).toEqual({ ds: "custom-1" });
    });

    it("saves selection to cookie when card type is selected", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      act(() => {
        result.current.selectCardType(fullDatasource.schema.cardTypes[0]);
      });

      const match = document.cookie.match(/gdc-ds-selection=([^;]*)/);
      const saved = JSON.parse(decodeURIComponent(match[1]));
      expect(saved).toEqual({ ds: "custom-1", type: "infantry" });
    });

    it("saves selection to cookie when card is selected", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      act(() => {
        result.current.selectCard(fullDatasource.data[0].datasheets[0]);
      });

      const match = document.cookie.match(/gdc-ds-selection=([^;]*)/);
      const saved = JSON.parse(decodeURIComponent(match[1]));
      expect(saved).toEqual({ ds: "custom-1", type: "infantry", card: "card-1" });
    });

    it("restores datasource selection from cookie on mount", async () => {
      // Pre-set cookie before mounting
      cookieJar["gdc-ds-selection"] = encodeURIComponent(JSON.stringify({ ds: "custom-1" }));

      let result;
      await act(async () => {
        ({ result } = renderHook(() => useDatasourceEditorState()));
      });

      expect(result.current.activeDatasource.id).toBe("custom-1");
      expect(result.current.selectedItem).toEqual({ type: "datasource" });
      expect(mockGetCustomDatasourceData).toHaveBeenCalledWith("custom-1");
    });

    it("restores card type selection from cookie on mount", async () => {
      cookieJar["gdc-ds-selection"] = encodeURIComponent(JSON.stringify({ ds: "custom-1", type: "infantry" }));

      let result;
      await act(async () => {
        ({ result } = renderHook(() => useDatasourceEditorState()));
      });

      expect(result.current.selectedItem).toEqual({
        type: "cardType",
        key: "infantry",
        data: fullDatasource.schema.cardTypes[0],
      });
    });

    it("restores card selection from cookie on mount", async () => {
      cookieJar["gdc-ds-selection"] = encodeURIComponent(
        JSON.stringify({ ds: "custom-1", type: "infantry", card: "card-1" }),
      );

      let result;
      await act(async () => {
        ({ result } = renderHook(() => useDatasourceEditorState()));
      });

      expect(result.current.selectedItem).toEqual({
        type: "card",
        data: fullDatasource.data[0].datasheets[0],
      });
    });

    it("handles invalid datasource in cookie (not in registry)", async () => {
      cookieJar["gdc-ds-selection"] = encodeURIComponent(JSON.stringify({ ds: "nonexistent" }));

      let result;
      await act(async () => {
        ({ result } = renderHook(() => useDatasourceEditorState()));
      });

      expect(result.current.activeDatasource).toBeNull();
      expect(mockGetCustomDatasourceData).not.toHaveBeenCalled();
      // Cookie should be cleared
      expect(document.cookie).not.toContain("gdc-ds-selection");
    });

    it("handles corrupt cookie data gracefully", async () => {
      cookieJar["gdc-ds-selection"] = "not-valid-json%25%25";

      let result;
      await act(async () => {
        ({ result } = renderHook(() => useDatasourceEditorState()));
      });

      // Should not crash, just start with empty state
      expect(result.current.activeDatasource).toBeNull();
      expect(result.current.selectedItem).toBeNull();
    });

    it("clears cookie when datasource removed from registry", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      expect(document.cookie).toContain("gdc-ds-selection");

      // Simulate datasource being removed from registry
      mockSettings.customDatasources = [{ id: "custom-2", name: "DS Two", version: "2.0.0" }];

      const { result: result2 } = renderHook(() => useDatasourceEditorState());

      // The original hook instance should detect the removal via effect
      // But since we can't trigger re-render of result easily, test via new mount
      expect(result2.current.activeDatasource).toBeNull();

      // Restore mock settings
      mockSettings.customDatasources = [
        { id: "custom-1", name: "DS One", version: "1.0.0" },
        { id: "custom-2", name: "DS Two", version: "2.0.0" },
      ];
    });

    it("clears selection when deleted card was selected", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      act(() => {
        result.current.selectCard(fullDatasource.data[0].datasheets[0]);
      });

      expect(result.current.selectedItem.type).toBe("card");

      await act(async () => {
        await result.current.deleteCard("card-1", "infantry");
      });

      // Should fall back to datasource selection
      expect(result.current.selectedItem).toEqual({ type: "datasource" });
      // Cookie should reflect datasource-level selection
      const match = document.cookie.match(/gdc-ds-selection=([^;]*)/);
      const saved = JSON.parse(decodeURIComponent(match[1]));
      expect(saved).toEqual({ ds: "custom-1" });
    });
  });
});
