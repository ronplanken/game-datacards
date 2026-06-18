import { describe, it, expect } from "vitest";
import { localize, getCardName, SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "../localization.helpers";

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

describe("language constants", () => {
  it("includes the eight 11th edition languages", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["en", "de", "es", "fr", "it", "ja", "ko", "zh"]);
  });

  it("has a label for every supported language", () => {
    SUPPORTED_LANGUAGES.forEach((code) => expect(LANGUAGE_LABELS[code]).toBeTruthy());
  });
});
