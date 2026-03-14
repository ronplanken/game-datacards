import { describe, it, expect } from "vitest";
import { resolveMobileConfig, buildCustomConfig, BUILTIN_CONFIGS, SELECTOR_SYSTEMS } from "../mobileDatasourceConfig";

describe("mobileDatasourceConfig", () => {
  describe("BUILTIN_CONFIGS", () => {
    it("has entries for all expected built-in systems", () => {
      expect(BUILTIN_CONFIGS).toHaveProperty("40k-10e");
      expect(BUILTIN_CONFIGS).toHaveProperty("40k");
      expect(BUILTIN_CONFIGS).toHaveProperty("basic");
      expect(BUILTIN_CONFIGS).toHaveProperty("necromunda");
      expect(BUILTIN_CONFIGS).toHaveProperty("aos");
    });

    it("each config has required shape", () => {
      Object.entries(BUILTIN_CONFIGS).forEach(([id, config]) => {
        expect(config).toHaveProperty("label");
        expect(config).toHaveProperty("cssClass");
        expect(config).toHaveProperty("selectorCssClass");
        expect(config).toHaveProperty("renderCard");
        expect(config).toHaveProperty("FactionComponent");
        expect(config).toHaveProperty("FactionUnitsComponent");
        expect(config).toHaveProperty("extraRouteViews");
        expect(typeof config.renderCard).toBe("function");
        expect(Array.isArray(config.extraRouteViews)).toBe(true);
        expect(typeof config.useScrollRevealHeader).toBe("boolean");
      });
    });

    it("AoS has scroll reveal enabled and extra route views", () => {
      const aos = BUILTIN_CONFIGS["aos"];
      expect(aos.useScrollRevealHeader).toBe(true);
      expect(aos.scrollRevealTargetSelector).toBe(".warscroll-unit-name");
      expect(aos.extraRouteViews.length).toBeGreaterThan(0);
      expect(aos.GameSystemSettingsScreen).toBe("aos");
    });

    it("40k-10e has settings section but no scroll reveal", () => {
      const config = BUILTIN_CONFIGS["40k-10e"];
      expect(config.useScrollRevealHeader).toBe(false);
      expect(config.SettingsSection).not.toBeNull();
      expect(config.GameSystemSettingsScreen).toBeNull();
    });
  });

  describe("resolveMobileConfig", () => {
    it("returns correct config for built-in IDs", () => {
      expect(resolveMobileConfig("40k-10e", null)).toBe(BUILTIN_CONFIGS["40k-10e"]);
      expect(resolveMobileConfig("aos", null)).toBe(BUILTIN_CONFIGS["aos"]);
      expect(resolveMobileConfig("basic", null)).toBe(BUILTIN_CONFIGS["basic"]);
      expect(resolveMobileConfig("necromunda", null)).toBe(BUILTIN_CONFIGS["necromunda"]);
      expect(resolveMobileConfig("40k", null)).toBe(BUILTIN_CONFIGS["40k"]);
    });

    it("returns custom config for custom- prefix", () => {
      const ds = { name: "My Custom DS" };
      const config = resolveMobileConfig("custom-abc-123", ds);
      expect(config.label).toBe("My Custom DS");
      expect(config.cssClass).toBe("data-custom");
    });

    it("returns custom config for subscribed- prefix", () => {
      const ds = { name: "Subscribed DS" };
      const config = resolveMobileConfig("subscribed-xyz", ds);
      expect(config.label).toBe("Subscribed DS");
      expect(config.cssClass).toBe("data-custom");
    });

    it("returns custom config for local-ds- prefix", () => {
      const ds = { name: "Local DS" };
      const config = resolveMobileConfig("local-ds-uuid-123", ds);
      expect(config.label).toBe("Local DS");
    });

    it("returns fallback config for unknown IDs", () => {
      const config = resolveMobileConfig("unknown-system", null);
      expect(config.label).toBe("Custom Datasource");
      expect(config.cssClass).toBe("data-custom");
    });
  });

  describe("buildCustomConfig", () => {
    it("returns valid config shape", () => {
      const ds = { name: "Test DS" };
      const config = buildCustomConfig(ds);
      expect(config.label).toBe("Test DS");
      expect(config.cssClass).toBe("data-custom");
      expect(config.selectorCssClass).toBe("gss-option-custom");
      expect(typeof config.renderCard).toBe("function");
      expect(config.extraRouteViews).toEqual([]);
      expect(config.SettingsSection).toBeNull();
      expect(config.GameSystemSettingsScreen).toBeNull();
      expect(config.useScrollRevealHeader).toBe(false);
    });

    it("handles null datasource gracefully", () => {
      const config = buildCustomConfig(null);
      expect(config.label).toBe("Custom Datasource");
    });

    it("enables scroll reveal for AoS-based datasources", () => {
      const ds = { name: "AoS DS", schema: { baseSystem: "aos" } };
      const config = buildCustomConfig(ds);
      expect(config.useScrollRevealHeader).toBe(true);
      expect(config.scrollRevealTargetSelector).toBe(".warscroll-unit-name");
    });

    it("disables scroll reveal for non-AoS datasources", () => {
      const ds = { name: "40k DS", schema: { baseSystem: "40k-10e" } };
      const config = buildCustomConfig(ds);
      expect(config.useScrollRevealHeader).toBe(false);
      expect(config.scrollRevealTargetSelector).toBeNull();
    });
  });

  describe("SELECTOR_SYSTEMS", () => {
    it("has expected entries", () => {
      expect(SELECTOR_SYSTEMS).toHaveLength(2);
      const ids = SELECTOR_SYSTEMS.map((s) => s.id);
      expect(ids).toContain("40k-10e");
      expect(ids).toContain("aos");
    });

    it("each entry has name, meta, and cssClass", () => {
      SELECTOR_SYSTEMS.forEach((system) => {
        expect(system).toHaveProperty("id");
        expect(system).toHaveProperty("name");
        expect(system).toHaveProperty("cssClass");
      });
    });
  });
});
