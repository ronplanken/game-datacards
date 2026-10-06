import { renderHook, act } from "@testing-library/react";
import { useSectionState } from "../hooks/useSectionState";

describe("useSectionState", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns true for unknown sections by default", () => {
    const { result } = renderHook(() => useSectionState("unit"));
    expect(result.current.isSectionOpen("Stats")).toBe(true);
    expect(result.current.isSectionOpen("Weapons")).toBe(true);
  });

  it("toggles a section and remembers the state", () => {
    const { result } = renderHook(() => useSectionState("unit"));
    act(() => {
      result.current.toggleSection("Stats", false);
    });
    expect(result.current.isSectionOpen("Stats")).toBe(false);
    expect(result.current.isSectionOpen("Weapons")).toBe(true);
  });

  it("persists state to sessionStorage", () => {
    const { result } = renderHook(() => useSectionState("unit"));
    act(() => {
      result.current.toggleSection("Stats", false);
    });
    const stored = JSON.parse(sessionStorage.getItem("gdc-ds-section-state"));
    expect(stored.unit.Stats).toBe(false);
  });

  it("restores state from sessionStorage on mount", () => {
    sessionStorage.setItem("gdc-ds-section-state", JSON.stringify({ unit: { Stats: false, Weapons: true } }));
    const { result } = renderHook(() => useSectionState("unit"));
    expect(result.current.isSectionOpen("Stats")).toBe(false);
    expect(result.current.isSectionOpen("Weapons")).toBe(true);
  });

  it("scopes state per card type key", () => {
    const { result: unitResult } = renderHook(() => useSectionState("unit"));
    const { result: spellResult } = renderHook(() => useSectionState("spell"));
    act(() => {
      unitResult.current.toggleSection("Stats", false);
    });
    expect(unitResult.current.isSectionOpen("Stats")).toBe(false);
    expect(spellResult.current.isSectionOpen("Stats")).toBe(true);
  });
});
