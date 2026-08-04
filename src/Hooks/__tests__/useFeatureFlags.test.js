import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFeatureFlags } from "../useFeatureFlags";

describe("useFeatureFlags", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults all flags to true when env vars are unset", () => {
    const { result } = renderHook(() => useFeatureFlags());

    expect(result.current.designerEnabled).toBe(true);
    expect(result.current.communityBrowserEnabled).toBe(true);
    expect(result.current.authEnabled).toBe(true);
    expect(result.current.syncEnabled).toBe(true);
    expect(result.current.twoFactorEnabled).toBe(true);
    expect(result.current.paidTierEnabled).toBe(true);
  });

  it('returns false when a flag is set to "false"', () => {
    vi.stubEnv("VITE_FEATURE_DESIGNER_ENABLED", "false");
    vi.stubEnv("VITE_FEATURE_COMMUNITY_BROWSER_ENABLED", "false");
    vi.stubEnv("VITE_FEATURE_PAID_TIER_ENABLED", "false");

    const { result } = renderHook(() => useFeatureFlags());

    expect(result.current.designerEnabled).toBe(false);
    expect(result.current.communityBrowserEnabled).toBe(false);
    expect(result.current.paidTierEnabled).toBe(false);
  });

  it("flags work independently", () => {
    vi.stubEnv("VITE_FEATURE_DESIGNER_ENABLED", "false");

    const { result } = renderHook(() => useFeatureFlags());

    expect(result.current.designerEnabled).toBe(false);
    expect(result.current.communityBrowserEnabled).toBe(true);
    expect(result.current.authEnabled).toBe(true);
    expect(result.current.syncEnabled).toBe(true);
    expect(result.current.twoFactorEnabled).toBe(true);
    expect(result.current.paidTierEnabled).toBe(true);
  });

  it('returns true when a flag is set to "true"', () => {
    vi.stubEnv("VITE_FEATURE_AUTH_ENABLED", "true");
    vi.stubEnv("VITE_FEATURE_SYNC_ENABLED", "true");
    vi.stubEnv("VITE_FEATURE_2FA_ENABLED", "true");

    const { result } = renderHook(() => useFeatureFlags());

    expect(result.current.authEnabled).toBe(true);
    expect(result.current.syncEnabled).toBe(true);
    expect(result.current.twoFactorEnabled).toBe(true);
  });
});
