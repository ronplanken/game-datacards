export const VISIBILITY_OPERATORS = [
  { value: "on", label: "is on", types: ["boolean"], takesValue: false },
  { value: "off", label: "is off", types: ["boolean"], takesValue: false },
  { value: "equals", label: "is", types: ["string", "enum", "number"], takesValue: true },
  { value: "notEquals", label: "is not", types: ["string", "enum", "number"], takesValue: true },
  { value: "contains", label: "contains", types: ["string", "array"], takesValue: true },
  { value: "notContains", label: "does not contain", types: ["string", "array"], takesValue: true },
  { value: "greaterThan", label: "is greater than", types: ["number"], takesValue: true },
  { value: "lessThan", label: "is less than", types: ["number"], takesValue: true },
  { value: "notEmpty", label: "is not empty", types: ["string", "enum", "number", "array"], takesValue: false },
  { value: "empty", label: "is empty", types: ["string", "enum", "number", "array"], takesValue: false },
];

const OPERATORS_BY_VALUE = new Map(VISIBILITY_OPERATORS.map((operator) => [operator.value, operator]));

export const VISIBILITY_MATCH_ALL = "all";
export const VISIBILITY_MATCH_ANY = "any";

export const operatorsForType = (type) => {
  const key = type === "richtext" ? "string" : type;
  const matching = VISIBILITY_OPERATORS.filter((operator) => operator.types.includes(key));
  return matching.length > 0 ? matching : VISIBILITY_OPERATORS.filter((operator) => operator.types.includes("string"));
};

export const operatorTakesValue = (op) => Boolean(OPERATORS_BY_VALUE.get(op)?.takesValue);

export const defaultOperatorForType = (type) => operatorsForType(type)[0].value;

const toText = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && typeof value.name === "string") return value.name;
  return "";
};

const normalizeText = (value) => toText(value).trim().toLowerCase();

export const isEmptyValue = (value) => {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return Number.isNaN(value);
  if (typeof value === "boolean") return false;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

export const isOnValue = (value) => {
  if (value === true) return true;
  if (value === false || value == null) return false;
  if (typeof value === "number") return value !== 0 && !Number.isNaN(value);
  if (typeof value === "string") {
    const text = value.trim().toLowerCase();
    return text !== "" && text !== "false" && text !== "0";
  }
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const toNumberOrNull = (value) => {
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const valueEquals = (value, expected) => {
  if (Array.isArray(value)) return value.some((entry) => valueEquals(entry, expected));
  const left = toNumberOrNull(value);
  const right = toNumberOrNull(expected);
  if (left != null && right != null) return left === right;
  return normalizeText(value) === normalizeText(expected);
};

const valueContains = (value, expected) => {
  const needle = normalizeText(expected);
  if (needle === "") return true;
  if (Array.isArray(value)) return value.some((entry) => normalizeText(entry) === needle);
  return normalizeText(value).includes(needle);
};

const compareNumbers = (value, expected, compare) => {
  const left = toNumberOrNull(value);
  const right = toNumberOrNull(expected);
  if (left == null || right == null) return false;
  return compare(left, right);
};

export const evaluateVisibilityRule = (rule, getValue) => {
  if (!rule || typeof rule.path !== "string" || rule.path.trim() === "") return true;
  if (!OPERATORS_BY_VALUE.has(rule.op)) return true;

  const value = getValue(rule.path.trim());

  switch (rule.op) {
    case "on":
      return isOnValue(value);
    case "off":
      return !isOnValue(value);
    case "equals":
      return valueEquals(value, rule.value);
    case "notEquals":
      return !valueEquals(value, rule.value);
    case "contains":
      return valueContains(value, rule.value);
    case "notContains":
      return !valueContains(value, rule.value);
    case "greaterThan":
      return compareNumbers(value, rule.value, (left, right) => left > right);
    case "lessThan":
      return compareNumbers(value, rule.value, (left, right) => left < right);
    case "empty":
      return isEmptyValue(value);
    case "notEmpty":
      return !isEmptyValue(value);
    default:
      return true;
  }
};

export const activeVisibilityRules = (visibleWhen) => {
  const rules = Array.isArray(visibleWhen?.rules) ? visibleWhen.rules : [];
  return rules.filter((rule) => rule && typeof rule.path === "string" && rule.path.trim() !== "");
};

export const hasVisibilityRules = (visibleWhen) => activeVisibilityRules(visibleWhen).length > 0;

export const isVisibleByRules = (visibleWhen, getValue) => {
  const rules = activeVisibilityRules(visibleWhen);
  if (rules.length === 0 || typeof getValue !== "function") return true;
  const results = rules.map((rule) => evaluateVisibilityRule(rule, getValue));
  return visibleWhen.match === VISIBILITY_MATCH_ANY ? results.some(Boolean) : results.every(Boolean);
};
