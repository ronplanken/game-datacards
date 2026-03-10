import { describe, it, expect } from "vitest";
import {
  VALID_BASE_TYPES,
  VALID_FIELD_TYPES,
  VALID_BASE_SYSTEMS,
  VALID_ABILITY_FORMATS,
  VALID_POINTS_FORMATS,
  SCHEMA_VERSION,
  createFieldDefinition,
  createCollectionDefinition,
} from "../customSchema.helpers";

describe("customSchema.helpers - constants", () => {
  it("defines valid base types", () => {
    expect(VALID_BASE_TYPES).toEqual(["unit", "rule", "enhancement", "stratagem"]);
  });

  it("defines valid field types", () => {
    expect(VALID_FIELD_TYPES).toEqual(["string", "richtext", "enum", "boolean"]);
  });

  it("defines valid base systems", () => {
    expect(VALID_BASE_SYSTEMS).toEqual(["40k-10e", "aos", "blank"]);
  });

  it("defines valid ability formats", () => {
    expect(VALID_ABILITY_FORMATS).toEqual(["name-only", "name-description"]);
  });

  it("defines valid points formats", () => {
    expect(VALID_POINTS_FORMATS).toEqual(["per-model", "per-unit"]);
  });

  it("defines schema version", () => {
    expect(SCHEMA_VERSION).toBe("1.0.0");
  });
});

describe("customSchema.helpers - createFieldDefinition", () => {
  it("creates a basic string field", () => {
    const field = createFieldDefinition({ key: "name", label: "Name" });
    expect(field).toEqual({ key: "name", label: "Name", type: "string" });
  });

  it("creates a field with explicit type", () => {
    const field = createFieldDefinition({ key: "desc", label: "Description", type: "richtext" });
    expect(field).toEqual({ key: "desc", label: "Description", type: "richtext" });
  });

  it("creates a field with displayOrder", () => {
    const field = createFieldDefinition({ key: "m", label: "M", displayOrder: 1 });
    expect(field).toEqual({ key: "m", label: "M", type: "string", displayOrder: 1 });
  });

  it("creates a field with required flag", () => {
    const field = createFieldDefinition({ key: "name", label: "Name", required: true });
    expect(field).toEqual({ key: "name", label: "Name", type: "string", required: true });
  });

  it("creates an enum field with options", () => {
    const options = ["command", "movement", "shooting"];
    const field = createFieldDefinition({ key: "phase", label: "Phase", type: "enum", options });
    expect(field).toEqual({ key: "phase", label: "Phase", type: "enum", options: ["command", "movement", "shooting"] });
  });

  it("does not include options for non-enum types", () => {
    const field = createFieldDefinition({ key: "name", label: "Name", type: "string", options: ["a", "b"] });
    expect(field).toEqual({ key: "name", label: "Name", type: "string" });
    expect(field.options).toBeUndefined();
  });

  it("does not mutate the provided options array", () => {
    const options = ["a", "b", "c"];
    const field = createFieldDefinition({ key: "f", label: "F", type: "enum", options });
    field.options.push("d");
    expect(options).toEqual(["a", "b", "c"]);
  });

  it("omits displayOrder when not provided", () => {
    const field = createFieldDefinition({ key: "k", label: "K" });
    expect(field).not.toHaveProperty("displayOrder");
  });

  it("omits required when not provided", () => {
    const field = createFieldDefinition({ key: "k", label: "K" });
    expect(field).not.toHaveProperty("required");
  });

  it("includes required: false when explicitly set", () => {
    const field = createFieldDefinition({ key: "k", label: "K", required: false });
    expect(field.required).toBe(false);
  });
});

describe("customSchema.helpers - createCollectionDefinition", () => {
  it("creates a collection with defaults", () => {
    const collection = createCollectionDefinition({ label: "Rules" });
    expect(collection).toEqual({ label: "Rules", allowMultiple: true, fields: [] });
  });

  it("creates a collection with custom allowMultiple", () => {
    const collection = createCollectionDefinition({ label: "Keywords", allowMultiple: false });
    expect(collection).toEqual({ label: "Keywords", allowMultiple: false, fields: [] });
  });

  it("creates a collection with fields", () => {
    const fields = [createFieldDefinition({ key: "title", label: "Title", required: true })];
    const collection = createCollectionDefinition({ label: "Rules", fields });
    expect(collection.fields).toHaveLength(1);
    expect(collection.fields[0]).toEqual({ key: "title", label: "Title", type: "string", required: true });
  });

  it("does not mutate the provided fields array", () => {
    const fields = [createFieldDefinition({ key: "a", label: "A" })];
    const collection = createCollectionDefinition({ label: "Test", fields });
    collection.fields.push(createFieldDefinition({ key: "b", label: "B" }));
    expect(fields).toHaveLength(1);
  });
});
