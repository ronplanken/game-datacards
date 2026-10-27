import { describe, it, expect } from "vitest";
import {
  defaultOperatorForType,
  evaluateVisibilityRule,
  hasVisibilityRules,
  isEmptyValue,
  isOnValue,
  isVisibleByRules,
  operatorTakesValue,
  operatorsForType,
} from "../visibilityRules";

const card = {
  name: "Jagdpanzer IV",
  combatRole: "tank destroyer",
  showRoleInName: true,
  hideArt: false,
  points: 120,
  pointsText: "120",
  keywords: ["Vehicle", "Tank"],
  empty: "",
  stats: [{ m: '6"' }],
};

const getValue = (path) => path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), card);

const rule = (path, op, value) => ({ path, op, value });

describe("operatorsForType", () => {
  it("offers on and off for booleans", () => {
    expect(operatorsForType("boolean").map((op) => op.value)).toEqual(["on", "off"]);
  });

  it("offers numeric comparisons for numbers", () => {
    const values = operatorsForType("number").map((op) => op.value);
    expect(values).toContain("greaterThan");
    expect(values).toContain("lessThan");
    expect(values).not.toContain("on");
  });

  it("treats richtext and unknown types as strings", () => {
    expect(operatorsForType("richtext")).toEqual(operatorsForType("string"));
    expect(operatorsForType("whatever")).toEqual(operatorsForType("string"));
  });

  it("picks the first operator as default", () => {
    expect(defaultOperatorForType("boolean")).toBe("on");
    expect(defaultOperatorForType("string")).toBe("equals");
  });

  it("reports which operators take a value", () => {
    expect(operatorTakesValue("equals")).toBe(true);
    expect(operatorTakesValue("on")).toBe(false);
    expect(operatorTakesValue("unknown")).toBe(false);
  });
});

describe("isEmptyValue and isOnValue", () => {
  it("detects empty values", () => {
    expect(isEmptyValue(undefined)).toBe(true);
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue("  ")).toBe(true);
    expect(isEmptyValue([])).toBe(true);
    expect(isEmptyValue({})).toBe(true);
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue(false)).toBe(false);
    expect(isEmptyValue("x")).toBe(false);
  });

  it("detects on values", () => {
    expect(isOnValue(true)).toBe(true);
    expect(isOnValue("true")).toBe(true);
    expect(isOnValue("yes")).toBe(true);
    expect(isOnValue(1)).toBe(true);
    expect(isOnValue(false)).toBe(false);
    expect(isOnValue("false")).toBe(false);
    expect(isOnValue("0")).toBe(false);
    expect(isOnValue("")).toBe(false);
    expect(isOnValue(0)).toBe(false);
    expect(isOnValue(undefined)).toBe(false);
  });
});

describe("evaluateVisibilityRule", () => {
  it("evaluates boolean rules", () => {
    expect(evaluateVisibilityRule(rule("showRoleInName", "on"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("showRoleInName", "off"), getValue)).toBe(false);
    expect(evaluateVisibilityRule(rule("hideArt", "on"), getValue)).toBe(false);
    expect(evaluateVisibilityRule(rule("missing", "off"), getValue)).toBe(true);
  });

  it("compares text case-insensitively", () => {
    expect(evaluateVisibilityRule(rule("combatRole", "equals", "Tank Destroyer"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("combatRole", "notEquals", "tank destroyer"), getValue)).toBe(false);
    expect(evaluateVisibilityRule(rule("combatRole", "contains", "DESTROY"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("combatRole", "notContains", "scout"), getValue)).toBe(true);
  });

  it("matches array entries", () => {
    expect(evaluateVisibilityRule(rule("keywords", "contains", "tank"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("keywords", "contains", "Ta"), getValue)).toBe(false);
    expect(evaluateVisibilityRule(rule("keywords", "equals", "Vehicle"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("keywords", "notEmpty"), getValue)).toBe(true);
  });

  it("compares numbers", () => {
    expect(evaluateVisibilityRule(rule("points", "greaterThan", "100"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("points", "lessThan", 100), getValue)).toBe(false);
    expect(evaluateVisibilityRule(rule("pointsText", "equals", 120), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("combatRole", "greaterThan", "1"), getValue)).toBe(false);
  });

  it("checks emptiness", () => {
    expect(evaluateVisibilityRule(rule("empty", "empty"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("missing", "empty"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("name", "notEmpty"), getValue)).toBe(true);
  });

  it("passes rules without a path or with an unknown operator", () => {
    expect(evaluateVisibilityRule(rule("", "on"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(rule("name", "bogus"), getValue)).toBe(true);
    expect(evaluateVisibilityRule(null, getValue)).toBe(true);
  });
});

describe("isVisibleByRules", () => {
  it("is visible without rules", () => {
    expect(isVisibleByRules(undefined, getValue)).toBe(true);
    expect(isVisibleByRules({ match: "all", rules: [] }, getValue)).toBe(true);
    expect(isVisibleByRules({ rules: [rule("", "on")] }, getValue)).toBe(true);
    expect(hasVisibilityRules({ rules: [rule("", "on")] })).toBe(false);
    expect(hasVisibilityRules({ rules: [rule("name", "notEmpty")] })).toBe(true);
  });

  it("requires every rule by default", () => {
    const visibleWhen = { rules: [rule("showRoleInName", "on"), rule("combatRole", "notEmpty")] };
    expect(isVisibleByRules(visibleWhen, getValue)).toBe(true);
    visibleWhen.rules.push(rule("hideArt", "on"));
    expect(isVisibleByRules(visibleWhen, getValue)).toBe(false);
  });

  it("accepts any rule when match is any", () => {
    const visibleWhen = { match: "any", rules: [rule("hideArt", "on"), rule("combatRole", "notEmpty")] };
    expect(isVisibleByRules(visibleWhen, getValue)).toBe(true);
    visibleWhen.rules = [rule("hideArt", "on"), rule("empty", "notEmpty")];
    expect(isVisibleByRules(visibleWhen, getValue)).toBe(false);
  });

  it("stays visible when no value getter is given", () => {
    expect(isVisibleByRules({ rules: [rule("hideArt", "on")] }, null)).toBe(true);
  });
});
