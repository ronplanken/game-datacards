import { describe, it, expect } from "vitest";
import {
  localize,
  getCardName,
  isLocalizedFieldEmpty,
  setLocalizedField,
  setLocalizedFieldSeeded,
  setLocalizedArrayItem,
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
} from "../localization.helpers";

describe("localize", () => {
  it("returns the requested language when present", () => {
    expect(localize({ en: "Hello", de: "Hallo" }, "de")).toBe("Hallo");
  });

  it("falls back to English when the requested language is missing", () => {
    expect(localize({ en: "Hello" }, "de")).toBe("Hello");
  });

  it("falls back to the first available language when English is missing", () => {
    expect(localize({ fr: "Bonjour", it: "Ciao" }, "de")).toBe("Bonjour");
  });

  it("passes plain strings through unchanged", () => {
    expect(localize("Plain text", "de")).toBe("Plain text");
  });

  it("returns an empty string for nullish values", () => {
    expect(localize(null, "en")).toBe("");
    expect(localize(undefined, "en")).toBe("");
  });

  it("defaults to English when no language is given", () => {
    expect(localize({ en: "Hi", de: "Hallo" })).toBe("Hi");
  });
});

describe("getCardName", () => {
  it("resolves a language-keyed card name", () => {
    expect(getCardName({ name: { en: "Unit", de: "Einheit" } }, "de")).toBe("Einheit");
  });

  it("handles an already-resolved string name", () => {
    expect(getCardName({ name: "Resolved" }, "de")).toBe("Resolved");
  });

  it("handles a missing card", () => {
    expect(getCardName(undefined, "en")).toBe("");
  });
});

describe("setLocalizedField", () => {
  it("merges into the active language and preserves the other languages", () => {
    expect(setLocalizedField({ en: "A", de: "B" }, "de", "X")).toEqual({ en: "A", de: "X" });
  });

  it("adds a new language key without dropping the existing ones", () => {
    expect(setLocalizedField({ en: "A" }, "fr", "X")).toEqual({ en: "A", fr: "X" });
  });

  it("keeps plain strings plain (never wraps a string into an object)", () => {
    expect(setLocalizedField("plain", "de", "X")).toBe("X");
  });

  it("returns a plain string for nullish input", () => {
    expect(setLocalizedField(null, "de", "X")).toBe("X");
    expect(setLocalizedField(undefined, "de", "X")).toBe("X");
  });

  it("clears the active language but preserves siblings when value is empty", () => {
    expect(setLocalizedField({ en: "A", de: "B" }, "de", "")).toEqual({ en: "A", de: "" });
  });

  it("does not treat arrays as language-keyed objects", () => {
    expect(setLocalizedField(["a", "b"], "de", "X")).toBe("X");
  });
});

describe("setLocalizedFieldSeeded", () => {
  it("starts an absent field as a language-keyed object", () => {
    expect(setLocalizedFieldSeeded(null, "de", "X")).toEqual({ de: "X" });
    expect(setLocalizedFieldSeeded(undefined, "de", "X")).toEqual({ de: "X" });
  });

  it("merges into an existing language-keyed field like setLocalizedField", () => {
    expect(setLocalizedFieldSeeded({ en: "A" }, "de", "X")).toEqual({ en: "A", de: "X" });
  });

  it("keeps an existing plain string plain", () => {
    expect(setLocalizedFieldSeeded("plain", "de", "X")).toBe("X");
  });
});

describe("isLocalizedFieldEmpty", () => {
  it("treats nullish, blank strings and blank language maps as empty", () => {
    expect(isLocalizedFieldEmpty(null)).toBe(true);
    expect(isLocalizedFieldEmpty(undefined)).toBe(true);
    expect(isLocalizedFieldEmpty("   ")).toBe(true);
    expect(isLocalizedFieldEmpty({})).toBe(true);
    expect(isLocalizedFieldEmpty({ en: "", de: "  " })).toBe(true);
  });

  it("is not empty when any language still holds text", () => {
    expect(isLocalizedFieldEmpty({ en: "A", de: "" })).toBe(false);
    expect(isLocalizedFieldEmpty("text")).toBe(false);
  });
});

describe("setLocalizedArrayItem", () => {
  it("updates an object entry shape-preservingly", () => {
    const arr = [{ en: "one" }, { en: "two", de: "zwei" }];
    const result = setLocalizedArrayItem(arr, 1, "de", "ZWEI");
    expect(result).toEqual([{ en: "one" }, { en: "two", de: "ZWEI" }]);
    expect(result).not.toBe(arr);
  });

  it("keeps a plain string entry plain", () => {
    expect(setLocalizedArrayItem(["a", "b"], 0, "de", "X")).toEqual(["X", "b"]);
  });

  it("returns a fresh array when the input is nullish", () => {
    expect(setLocalizedArrayItem(undefined, 0, "de", "X")).toEqual(["X"]);
  });
});

describe("language constants", () => {
  it("includes the eight 11th edition languages", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["en", "de", "es", "fr", "it", "ja", "ko", "zh"]);
  });

  it("has a label for every supported language", () => {
    SUPPORTED_LANGUAGES.forEach((code) => expect(LANGUAGE_LABELS[code]).toBeTruthy());
  });
});
