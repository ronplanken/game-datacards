import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCardEditorState } from "../useCardEditorState";

describe("useCardEditorState", () => {
  const baseCard = {
    uuid: "card-1",
    name: "Test Unit",
    stats: [{ m: 6, t: 4, sv: "3+" }],
    keywords: ["Infantry"],
  };

  it("should initialize with the provided card", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useCardEditorState(baseCard, onSave));

    expect(result.current.localCard).toEqual(baseCard);
  });

  it("should update a top-level field and call onSave", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useCardEditorState(baseCard, onSave));

    act(() => {
      result.current.updateField("name", "New Name");
    });

    expect(result.current.localCard.name).toBe("New Name");
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: "New Name", stats: baseCard.stats }));
  });

  it("should update a nested field via dot-path", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useCardEditorState(baseCard, onSave));

    act(() => {
      result.current.updateField("stats.0.m", 8);
    });

    expect(result.current.localCard.stats[0].m).toBe(8);
    // Other fields preserved
    expect(result.current.localCard.stats[0].t).toBe(4);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("should update multiple fields atomically", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useCardEditorState(baseCard, onSave));

    act(() => {
      result.current.updateFields({
        name: "Updated",
        "stats.0.m": 10,
      });
    });

    expect(result.current.localCard.name).toBe("Updated");
    expect(result.current.localCard.stats[0].m).toBe(10);
    // Only one save call for batch update
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("should replace the entire card and call onSave", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useCardEditorState(baseCard, onSave));

    const newCard = { ...baseCard, name: "Replaced", keywords: ["Tank"] };

    act(() => {
      result.current.replaceCard(newCard);
    });

    expect(result.current.localCard.name).toBe("Replaced");
    expect(result.current.localCard.keywords).toEqual(["Tank"]);
    expect(onSave).toHaveBeenCalledWith(newCard);
  });

  it("should produce immutable updates (not mutate original)", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useCardEditorState(baseCard, onSave));

    act(() => {
      result.current.updateField("name", "Changed");
    });

    // Original card should be unmodified
    expect(baseCard.name).toBe("Test Unit");
  });

  it("should handle deeply nested path creation", () => {
    const onSave = vi.fn();
    const card = { name: "Test" };
    const { result } = renderHook(() => useCardEditorState(card, onSave));

    act(() => {
      result.current.updateField("abilities.invul.value", "4+");
    });

    expect(result.current.localCard.abilities.invul.value).toBe("4+");
  });
});
