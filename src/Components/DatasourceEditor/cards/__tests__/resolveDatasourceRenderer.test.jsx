import { describe, it, expect } from "vitest";
import { resolveDatasourceRenderer } from "../resolveDatasourceRenderer";
import { Ds40kStratagemCard } from "../Ds40kStratagemCard";
import { Ds40kEnhancementCard } from "../Ds40kEnhancementCard";
import { Ds40kRuleCard } from "../Ds40kRuleCard";
import { Ds40kUnitCard } from "../Ds40kUnitCard";
import { DsAosWarscrollCard } from "../DsAosWarscrollCard";

describe("resolveDatasourceRenderer", () => {
  describe("40k-10e base system", () => {
    it("returns Ds40kUnitCard for unit baseType", () => {
      expect(resolveDatasourceRenderer("40k-10e", "unit")).toBe(Ds40kUnitCard);
    });

    it("returns Ds40kStratagemCard for stratagem baseType", () => {
      expect(resolveDatasourceRenderer("40k-10e", "stratagem")).toBe(Ds40kStratagemCard);
    });

    it("returns Ds40kEnhancementCard for enhancement baseType", () => {
      expect(resolveDatasourceRenderer("40k-10e", "enhancement")).toBe(Ds40kEnhancementCard);
    });

    it("returns Ds40kRuleCard for rule baseType", () => {
      expect(resolveDatasourceRenderer("40k-10e", "rule")).toBe(Ds40kRuleCard);
    });

    it("returns null for unknown baseType", () => {
      expect(resolveDatasourceRenderer("40k-10e", "detachment")).toBeNull();
    });
  });

  describe("aos base system", () => {
    it("returns DsAosWarscrollCard for unit baseType", () => {
      expect(resolveDatasourceRenderer("aos", "unit")).toBe(DsAosWarscrollCard);
    });

    it("returns null for stratagem baseType", () => {
      expect(resolveDatasourceRenderer("aos", "stratagem")).toBeNull();
    });
  });

  describe("unknown base system", () => {
    it("returns null for blank system", () => {
      expect(resolveDatasourceRenderer("blank", "unit")).toBeNull();
    });

    it("returns null for undefined system", () => {
      expect(resolveDatasourceRenderer(undefined, "unit")).toBeNull();
    });

    it("returns null for null system", () => {
      expect(resolveDatasourceRenderer(null, "unit")).toBeNull();
    });
  });
});
