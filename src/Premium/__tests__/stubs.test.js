import {
  useSubscription,
  SUBSCRIPTION_LIMITS,
  TEMPLATE_PRESETS,
  useTemplateSharing,
  TEMPLATE_GAME_SYSTEMS,
  TEMPLATE_SORT_OPTIONS,
  ListSyncButton,
} from "../index";

// ============================================
// useSubscription stub
// ============================================
describe("useSubscription stub", () => {
  it("should return usage object with templates property", () => {
    const { usage } = useSubscription();
    expect(usage).toHaveProperty("templates");
    expect(usage.templates).toBe(0);
  });

  it("should return usage object with categories and datasources", () => {
    const { usage } = useSubscription();
    expect(usage).toHaveProperty("categories");
    expect(usage).toHaveProperty("datasources");
    expect(usage.categories).toBe(0);
    expect(usage.datasources).toBe(0);
  });

  it("should return getLimits with templates property", () => {
    const { getLimits } = useSubscription();
    const limits = getLimits();
    expect(limits).toHaveProperty("templates");
    expect(limits.templates).toBe(0);
  });

  it("should return getLimits with all required properties", () => {
    const { getLimits } = useSubscription();
    const limits = getLimits();
    expect(limits).toHaveProperty("categories");
    expect(limits).toHaveProperty("datasources");
    expect(limits).toHaveProperty("templates");
    expect(limits).toHaveProperty("canUploadDatasources");
    expect(limits).toHaveProperty("canAccessShares");
  });

  it("should return free tier from getTier", () => {
    const { getTier } = useSubscription();
    expect(getTier()).toBe("free");
  });
});

// ============================================
// SUBSCRIPTION_LIMITS constant
// ============================================
describe("SUBSCRIPTION_LIMITS", () => {
  const tiers = ["free", "premium", "creator", "lifetime", "admin"];

  it.each(tiers)("should have templates limit for %s tier", (tier) => {
    expect(SUBSCRIPTION_LIMITS[tier]).toHaveProperty("templates");
    expect(typeof SUBSCRIPTION_LIMITS[tier].templates).toBe("number");
  });

  it("should have 0 templates for free tier", () => {
    expect(SUBSCRIPTION_LIMITS.free.templates).toBe(0);
  });

  it("should have 1 template for premium tier", () => {
    expect(SUBSCRIPTION_LIMITS.premium.templates).toBe(1);
  });

  it("should have 5 templates for creator tier", () => {
    expect(SUBSCRIPTION_LIMITS.creator.templates).toBe(5);
  });

  it("should have 99 templates for lifetime tier", () => {
    expect(SUBSCRIPTION_LIMITS.lifetime.templates).toBe(99);
  });

  it("should have 99 templates for admin tier", () => {
    expect(SUBSCRIPTION_LIMITS.admin.templates).toBe(99);
  });

  it.each(tiers)("should have all required properties for %s tier", (tier) => {
    const limits = SUBSCRIPTION_LIMITS[tier];
    expect(limits).toHaveProperty("categories");
    expect(limits).toHaveProperty("datasources");
    expect(limits).toHaveProperty("templates");
    expect(limits).toHaveProperty("canUploadDatasources");
    expect(limits).toHaveProperty("canAccessShares");
  });
});

// ============================================
// TEMPLATE_PRESETS constant
// ============================================
describe("TEMPLATE_PRESETS", () => {
  const presetKeys = ["40k-datacard", "40k-stratagem", "aos-warscroll", "custom"];

  it.each(presetKeys)("should have required properties for %s preset", (preset) => {
    expect(TEMPLATE_PRESETS[preset]).toHaveProperty("name");
    expect(TEMPLATE_PRESETS[preset]).toHaveProperty("width");
    expect(TEMPLATE_PRESETS[preset]).toHaveProperty("height");
    expect(TEMPLATE_PRESETS[preset]).toHaveProperty("targetFormat");
  });

  it("should have correct dimensions for 40k-datacard", () => {
    expect(TEMPLATE_PRESETS["40k-datacard"].width).toBe(500);
    expect(TEMPLATE_PRESETS["40k-datacard"].height).toBe(700);
  });

  it("should have correct dimensions for 40k-stratagem", () => {
    expect(TEMPLATE_PRESETS["40k-stratagem"].width).toBe(500);
    expect(TEMPLATE_PRESETS["40k-stratagem"].height).toBe(350);
  });

  it("should have 40k-10e target format for Warhammer 40k presets", () => {
    expect(TEMPLATE_PRESETS["40k-datacard"].targetFormat).toBe("40k-10e");
    expect(TEMPLATE_PRESETS["40k-stratagem"].targetFormat).toBe("40k-10e");
  });

  it("should have aos target format for AoS preset", () => {
    expect(TEMPLATE_PRESETS["aos-warscroll"].targetFormat).toBe("aos");
  });
});

// ============================================
// useTemplateSharing stub
// ============================================
describe("useTemplateSharing stub", () => {
  it("should return default browse state", () => {
    const sharing = useTemplateSharing();
    expect(sharing.publicTemplates).toEqual([]);
    expect(sharing.isLoadingPublic).toBe(false);
    expect(sharing.browseFilters).toEqual({ gameSystem: null, search: "", sortBy: "popular" });
    expect(sharing.pagination).toEqual({ offset: 0, hasMore: false });
  });

  it("should return browse functions that resolve to empty/false", async () => {
    const sharing = useTemplateSharing();
    expect(await sharing.browsePublicTemplates()).toEqual([]);
    expect(await sharing.getFeaturedTemplates()).toEqual([]);
    expect(await sharing.getTemplateByShareCode("test")).toBeNull();
  });

  it("should return subscription state", () => {
    const sharing = useTemplateSharing();
    expect(sharing.subscriptions).toEqual([]);
    expect(sharing.availableUpdates).toEqual([]);
    expect(sharing.isLoadingSubscriptions).toBe(false);
    expect(sharing.updateCount).toBe(0);
  });

  it("should return subscription functions that resolve to failure/empty", async () => {
    const sharing = useTemplateSharing();
    expect(await sharing.fetchMySubscriptions()).toEqual([]);
    expect(await sharing.subscribeToTemplate("test")).toEqual({ success: false });
    expect(await sharing.unsubscribeFromTemplate("test")).toEqual({ success: false });
    expect(await sharing.checkForUpdates()).toEqual([]);
  });

  it("should return publishing state", () => {
    const sharing = useTemplateSharing();
    expect(sharing.myTemplates).toEqual([]);
    expect(sharing.isLoadingMine).toBe(false);
  });

  it("should return publishing functions that resolve to failure", async () => {
    const sharing = useTemplateSharing();
    expect(await sharing.fetchMyTemplates()).toEqual([]);
    expect(await sharing.publishTemplate("test")).toEqual({ success: false });
    expect(await sharing.pushTemplateUpdate("test")).toEqual({ success: false });
    expect(await sharing.unpublishTemplate("test")).toEqual({ success: false });
    expect(await sharing.getMyPublishedWorks()).toEqual({ datasources: [], templates: [] });
  });
});

// ============================================
// TEMPLATE_GAME_SYSTEMS constant
// ============================================
describe("TEMPLATE_GAME_SYSTEMS", () => {
  it("should be an array with game system options", () => {
    expect(Array.isArray(TEMPLATE_GAME_SYSTEMS)).toBe(true);
    expect(TEMPLATE_GAME_SYSTEMS.length).toBeGreaterThan(0);
  });

  it("should have value and label for each option", () => {
    TEMPLATE_GAME_SYSTEMS.forEach((option) => {
      expect(option).toHaveProperty("value");
      expect(option).toHaveProperty("label");
      expect(typeof option.value).toBe("string");
      expect(typeof option.label).toBe("string");
    });
  });

  it("should include common game systems", () => {
    const values = TEMPLATE_GAME_SYSTEMS.map((o) => o.value);
    expect(values).toContain("40k-10e");
    expect(values).toContain("aos");
  });
});

// ============================================
// TEMPLATE_SORT_OPTIONS constant
// ============================================
describe("TEMPLATE_SORT_OPTIONS", () => {
  it("should be an array with sort options", () => {
    expect(Array.isArray(TEMPLATE_SORT_OPTIONS)).toBe(true);
    expect(TEMPLATE_SORT_OPTIONS.length).toBeGreaterThan(0);
  });

  it("should have value and label for each option", () => {
    TEMPLATE_SORT_OPTIONS.forEach((option) => {
      expect(option).toHaveProperty("value");
      expect(option).toHaveProperty("label");
      expect(typeof option.value).toBe("string");
      expect(typeof option.label).toBe("string");
    });
  });

  it("should include popular and new sort options", () => {
    const values = TEMPLATE_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("popular");
    expect(values).toContain("new");
  });
});

// ============================================
// ListSyncButton stub
// ============================================
describe("ListSyncButton stub", () => {
  it("should be a function that returns null", () => {
    expect(typeof ListSyncButton).toBe("function");
    expect(ListSyncButton()).toBeNull();
  });
});
