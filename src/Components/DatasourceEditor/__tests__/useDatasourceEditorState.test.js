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

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    getCustomDatasourceData: mockGetCustomDatasourceData,
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
};

describe("useDatasourceEditorState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCustomDatasourceData.mockResolvedValue(fullDatasource);
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

  it("selectDatasource sets selectedItem to datasource type", () => {
    const { result } = renderHook(() => useDatasourceEditorState());

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

      expect(mockSetItem).toHaveBeenCalledWith("custom-1", updated);
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

      expect(mockSetItem).toHaveBeenCalledWith("custom-1", updatedDatasource);
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

      expect(mockSetItem).toHaveBeenCalledWith(
        "custom-1",
        expect.objectContaining({ name: "New Name", version: "2.0.0", author: "New Author" }),
      );
    });

    it("updateDatasource handles localForage errors gracefully", async () => {
      const { result } = renderHook(() => useDatasourceEditorState());

      await act(async () => {
        await result.current.openDatasource({ id: "custom-1" });
      });

      mockSetItem.mockRejectedValueOnce(new Error("Storage quota exceeded"));

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

      mockSetItem.mockClear();

      await act(async () => {
        await result.current.updateDatasource({ ...fullDatasource, name: "Update 1" });
      });
      await act(async () => {
        await result.current.updateDatasource({ ...fullDatasource, name: "Update 2" });
      });

      expect(mockSetItem).toHaveBeenCalledTimes(2);
      expect(mockSetItem).toHaveBeenLastCalledWith("custom-1", expect.objectContaining({ name: "Update 2" }));
    });
  });
});
