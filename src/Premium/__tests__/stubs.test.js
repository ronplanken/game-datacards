import { useSubscription, SUBSCRIPTION_LIMITS } from "../index";

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
