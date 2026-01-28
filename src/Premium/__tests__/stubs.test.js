import { useSubscription, SUBSCRIPTION_LIMITS, TEMPLATE_PRESETS } from "../index";

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
