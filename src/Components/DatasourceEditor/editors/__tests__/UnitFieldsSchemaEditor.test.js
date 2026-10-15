import { describe, it, expect } from "vitest";
import { changeUnitFieldType, createUnitField, unitFieldKeyError } from "../UnitFieldsSchemaEditor";

describe("createUnitField", () => {
  it("creates a toggle field with a free key", () => {
    const field = createUnitField([{ key: "field_1" }, { key: "field_2" }]);
    expect(field).toMatchObject({ key: "field_3", label: "Field 3", type: "boolean", default: false });
    expect(field._id).toBeDefined();
  });

  it("skips keys that are already used", () => {
    expect(createUnitField([{ key: "field_2" }]).key).toBe("field_3");
  });
});

describe("unitFieldKeyError", () => {
  it("accepts a valid unique key", () => {
    expect(unitFieldKeyError({ key: "showRoleInName" }, [{ key: "showRoleInName" }])).toBeNull();
  });

  it("reports empty, malformed, reserved and duplicate keys", () => {
    expect(unitFieldKeyError({ key: "" })).toBe("Key is required.");
    expect(unitFieldKeyError({ key: "1st" })).toMatch(/starting with a letter/);
    expect(unitFieldKeyError({ key: "combatRole" })).toMatch(/built-in/);
    expect(unitFieldKeyError({ key: "a" }, [{ key: "a" }, { key: "a" }])).toMatch(/used twice/);
  });
});

describe("changeUnitFieldType", () => {
  it("resets the default and options for the new type", () => {
    const base = { key: "a", label: "A", type: "boolean", default: true, onValue: "Yes" };
    expect(changeUnitFieldType(base, "string")).toEqual({ key: "a", label: "A", type: "string", default: "" });
    expect(changeUnitFieldType(base, "enum")).toEqual({
      key: "a",
      label: "A",
      type: "enum",
      options: ["Option 1", "Option 2"],
      default: "Option 1",
    });
    expect(changeUnitFieldType({ ...base, type: "string" }, "boolean").default).toBe(false);
  });
});
