import { describe, it, expect } from "vitest";
import {
  describeFormat,
  formatForCard,
  getCompatibleFormats,
  isBuiltInFormat,
  isFormatCompatible,
  listFormats,
} from "../templateFormats";

const customDatasources = [
  {
    id: "custom-10e",
    name: "Fake 10e",
    schema: {
      baseSystem: "40k-10e",
      cardTypes: [
        { key: "unit", label: "Unit", baseType: "unit" },
        { key: "strat", label: "Stratagem", baseType: "stratagem" },
      ],
    },
  },
  {
    id: "custom-11e",
    name: "Fake 11e",
    schema: {
      baseSystem: "40k-11e",
      cardTypes: [{ key: "datasheet", label: "Datasheet", baseType: "unit" }],
    },
  },
  {
    id: "custom-aos",
    name: "Fake AoS",
    schema: {
      baseSystem: "aos",
      cardTypes: [{ key: "warscroll", label: "Warscroll", baseType: "unit" }],
    },
  },
  {
    id: "custom-blank",
    name: "Fake Blank",
    schema: {
      baseSystem: "blank",
      cardTypes: [{ key: "card", label: "Card", baseType: "unit" }],
    },
  },
];

describe("templateFormats", () => {
  describe("describeFormat", () => {
    it("describes the built-in formats", () => {
      expect(describeFormat("40k-10e")).toEqual({
        key: "40k-10e",
        label: "40K 10th Edition",
        gameSystem: "40k",
        datasourceId: null,
        cardTypeKey: null,
        family: "40k-unit",
        builtIn: true,
      });
      expect(describeFormat("40k-11e").family).toBe("40k-unit");
      expect(describeFormat("aos")).toMatchObject({ gameSystem: "aos", family: "aos-warscroll", builtIn: true });
    });

    it("returns null without a format", () => {
      expect(describeFormat(null)).toBeNull();
      expect(describeFormat("")).toBeNull();
    });

    it("describes a custom datasource card type", () => {
      expect(describeFormat("custom-10e:unit", customDatasources)).toEqual({
        key: "custom-10e:unit",
        label: "Fake 10e - Unit",
        gameSystem: "40k",
        datasourceId: "custom-10e",
        cardTypeKey: "unit",
        family: "40k-unit",
        builtIn: false,
      });
      expect(describeFormat("custom-10e:strat", customDatasources)).toMatchObject({
        family: "40k-10e:stratagem",
        label: "Fake 10e - Stratagem",
      });
      expect(describeFormat("custom-blank:card", customDatasources)).toMatchObject({
        gameSystem: "custom",
        family: "blank:unit",
      });
    });

    it("falls back to the key when the datasource is unknown", () => {
      expect(describeFormat("custom-missing:unit")).toEqual({
        key: "custom-missing:unit",
        label: "custom-missing:unit",
        gameSystem: "custom",
        datasourceId: "custom-missing",
        cardTypeKey: "unit",
        family: "custom-missing:unit",
        builtIn: false,
      });
    });

    it("falls back to the key for an unparsable format", () => {
      expect(describeFormat("necromunda")).toMatchObject({
        key: "necromunda",
        family: "necromunda",
        gameSystem: "custom",
        builtIn: false,
      });
    });
  });

  describe("isFormatCompatible", () => {
    it("treats the two 40K editions as compatible", () => {
      expect(isFormatCompatible("40k-10e", "40k-11e")).toBe(true);
      expect(isFormatCompatible("40k-11e", "40k-10e")).toBe(true);
      expect(isFormatCompatible("40k-10e", "40k-10e")).toBe(true);
    });

    it("keeps Age of Sigmar separate from 40K", () => {
      expect(isFormatCompatible("aos", "40k-10e")).toBe(false);
      expect(isFormatCompatible("40k-11e", "aos")).toBe(false);
      expect(isFormatCompatible("aos", "aos")).toBe(true);
    });

    it("accepts a custom 40K unit datasource on both editions", () => {
      expect(isFormatCompatible("custom-10e:unit", "40k-10e", customDatasources)).toBe(true);
      expect(isFormatCompatible("custom-10e:unit", "40k-11e", customDatasources)).toBe(true);
      expect(isFormatCompatible("40k-11e", "custom-11e:datasheet", customDatasources)).toBe(true);
      expect(isFormatCompatible("custom-10e:unit", "custom-11e:datasheet", customDatasources)).toBe(true);
    });

    it("keeps other custom card types to themselves", () => {
      expect(isFormatCompatible("custom-10e:strat", "40k-10e", customDatasources)).toBe(false);
      expect(isFormatCompatible("custom-aos:warscroll", "aos", customDatasources)).toBe(false);
      expect(isFormatCompatible("custom-aos:warscroll", "custom-aos:warscroll", customDatasources)).toBe(true);
    });

    it("needs both formats", () => {
      expect(isFormatCompatible(null, "40k-10e")).toBe(false);
      expect(isFormatCompatible("40k-10e", null)).toBe(false);
    });
  });

  describe("getCompatibleFormats", () => {
    it("lists the compatible built-in and custom formats", () => {
      expect(getCompatibleFormats("40k-10e", customDatasources)).toEqual([
        "40k-10e",
        "40k-11e",
        "custom-10e:unit",
        "custom-11e:datasheet",
      ]);
      expect(getCompatibleFormats("aos", customDatasources)).toEqual(["aos"]);
      expect(getCompatibleFormats("custom-10e:strat", customDatasources)).toEqual(["custom-10e:strat"]);
      expect(getCompatibleFormats(null)).toEqual([]);
    });
  });

  describe("listFormats", () => {
    it("lists built-in formats and every custom card type", () => {
      expect(listFormats()).toEqual(["40k-10e", "40k-11e", "aos"]);
      expect(listFormats(customDatasources)).toContain("custom-aos:warscroll");
    });
  });

  describe("formatForCard", () => {
    it("derives the format of a built-in card", () => {
      expect(formatForCard({ source: "40k-10e", cardType: "DataCard" })).toBe("40k-10e");
      expect(formatForCard({ source: "40k-11e" })).toBe("40k-11e");
      expect(formatForCard({ source: "aos", cardType: "spell" })).toBe("aos");
    });

    it("derives the format of a custom card", () => {
      expect(formatForCard({ source: "custom-10e", cardType: "unit" })).toBe("custom-10e:unit");
      expect(formatForCard({ source: "custom-10e" })).toBe("custom-10e");
    });

    it("returns null without a source", () => {
      expect(formatForCard(null)).toBeNull();
      expect(formatForCard({})).toBeNull();
    });
  });

  describe("isBuiltInFormat", () => {
    it("knows the built-in keys", () => {
      expect(isBuiltInFormat("40k-10e")).toBe(true);
      expect(isBuiltInFormat("custom-10e:unit")).toBe(false);
      expect(isBuiltInFormat(null)).toBe(false);
    });
  });
});
