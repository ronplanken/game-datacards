import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useDataSourceStorage, DataSourceStorageProviderComponent } from "../../../Hooks/useDataSourceStorage";
import { SettingsStorageProviderComponent } from "../../../Hooks/useSettingsStorage";
import {
  create40kPreset,
  createBlankPreset,
  createAoSPreset,
  validateSchema,
  createFieldDefinition,
  createCollectionDefinition,
} from "../../../Helpers/customSchema.helpers";
import {
  exportDatasourceSchema,
  validateCustomDatasource,
  prepareDatasourceForImport,
} from "../../../Helpers/customDatasource.helpers";

// Mock localforage with a real-ish in-memory store
const mockStore = {};
vi.mock("localforage", () => ({
  default: {
    createInstance: () => ({
      getItem: vi.fn(async (key) => mockStore[key] || null),
      setItem: vi.fn(async (key, value) => {
        mockStore[key] = value;
      }),
      removeItem: vi.fn(async (key) => {
        delete mockStore[key];
      }),
      clear: vi.fn(async () => {
        Object.keys(mockStore).forEach((key) => delete mockStore[key]);
      }),
    }),
  },
}));

let uuidCounter = 0;
vi.mock("uuid", () => ({
  v4: () => `e2e-uuid-${++uuidCounter}`,
}));

vi.mock("../../../Helpers/external.helpers", () => ({
  get40KData: vi.fn(async () => ({ data: [] })),
  get40k10eData: vi.fn(async () => ({ data: [] })),
  get40k10eCombatPatrolData: vi.fn(async () => ({ data: [] })),
  getAoSData: vi.fn(async () => ({ data: [] })),
  getBasicData: vi.fn(() => ({ data: [{ id: "basic-1", name: "Basic" }] })),
  getNecromundaBasicData: vi.fn(() => ({ data: [{ id: "necro-1", name: "Necromunda" }] })),
}));

vi.mock("../../../Components/Toast/message", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

const wrapper = ({ children }) => (
  <SettingsStorageProviderComponent>
    <DataSourceStorageProviderComponent>{children}</DataSourceStorageProviderComponent>
  </SettingsStorageProviderComponent>
);

describe("Datasource Editor E2E", () => {
  beforeEach(() => {
    uuidCounter = 0;
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
    localStorage.clear();
  });

  describe("full lifecycle: create, add card types, edit schema, export, re-import", () => {
    it("creates a datasource with 40k preset and verifies storage", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      const schema = create40kPreset();
      let response;
      await act(async () => {
        response = await result.current.createCustomDatasource(
          { name: "My 40K Game", version: "1.0.0", author: "Test" },
          schema,
        );
      });

      expect(response.success).toBe(true);
      const stored = mockStore[response.id];
      expect(stored.name).toBe("My 40K Game");
      expect(stored.schema.baseSystem).toBe("40k-10e");
      expect(stored.schema.cardTypes).toHaveLength(4);

      // Verify all 4 base types present
      const baseTypes = stored.schema.cardTypes.map((ct) => ct.baseType);
      expect(baseTypes).toContain("unit");
      expect(baseTypes).toContain("rule");
      expect(baseTypes).toContain("enhancement");
      expect(baseTypes).toContain("stratagem");
    });

    it("creates a blank datasource, adds card types, edits schema, exports, and re-imports", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      // Step 1: Create blank datasource
      const blankSchema = createBlankPreset();
      let createResponse;
      await act(async () => {
        createResponse = await result.current.createCustomDatasource(
          { name: "Custom RPG", version: "1.0.0", author: "Designer" },
          blankSchema,
        );
      });

      expect(createResponse.success).toBe(true);
      const dsId = createResponse.id;
      let stored = mockStore[dsId];
      expect(stored.schema.cardTypes).toHaveLength(0);

      // Step 2: Add a unit card type by directly modifying stored data (simulating editor)
      const unitCardType = {
        key: "hero",
        label: "Hero",
        baseType: "unit",
        schema: {
          stats: {
            label: "Stats",
            allowMultipleProfiles: false,
            fields: [
              createFieldDefinition({ key: "str", label: "STR", type: "string", displayOrder: 1 }),
              createFieldDefinition({ key: "dex", label: "DEX", type: "string", displayOrder: 2 }),
              createFieldDefinition({ key: "con", label: "CON", type: "string", displayOrder: 3 }),
            ],
          },
          weaponTypes: {
            label: "Weapon Types",
            allowMultiple: true,
            types: [
              {
                key: "melee",
                label: "Melee Weapons",
                hasKeywords: false,
                hasProfiles: false,
                columns: [
                  createFieldDefinition({ key: "damage", label: "Damage", type: "string", required: true }),
                  createFieldDefinition({ key: "speed", label: "Speed", type: "string", required: true }),
                ],
              },
            ],
          },
          abilities: {
            label: "Abilities",
            categories: [{ key: "special", label: "Special Abilities", format: "name-description" }],
          },
          metadata: {
            hasKeywords: true,
            hasFactionKeywords: false,
            hasPoints: true,
            pointsFormat: "per-unit",
          },
        },
      };

      stored.schema.cardTypes.push(unitCardType);
      mockStore[dsId] = { ...stored };
      stored = mockStore[dsId];
      expect(stored.schema.cardTypes).toHaveLength(1);

      // Step 3: Add a stratagem card type
      const stratagemCardType = {
        key: "tactic",
        label: "Battle Tactic",
        baseType: "stratagem",
        schema: {
          fields: [
            createFieldDefinition({ key: "name", label: "Name", type: "string", required: true }),
            createFieldDefinition({ key: "cost", label: "Cost", type: "string", required: true }),
            createFieldDefinition({
              key: "phase",
              label: "Phase",
              type: "enum",
              required: true,
              options: ["attack", "defense", "movement"],
            }),
            createFieldDefinition({ key: "effect", label: "Effect", type: "richtext", required: true }),
          ],
        },
      };

      stored.schema.cardTypes.push(stratagemCardType);
      mockStore[dsId] = { ...stored };
      stored = mockStore[dsId];
      expect(stored.schema.cardTypes).toHaveLength(2);

      // Step 4: Validate the schema after modifications
      const validation = validateSchema(stored.schema);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 5: Edit schema fields - add a new stat field to the unit card type
      const heroType = stored.schema.cardTypes.find((ct) => ct.key === "hero");
      heroType.schema.stats.fields.push(
        createFieldDefinition({ key: "wis", label: "WIS", type: "string", displayOrder: 4 }),
      );

      // Edit: toggle allowMultipleProfiles
      heroType.schema.stats.allowMultipleProfiles = true;

      // Edit: add a new weapon type
      heroType.schema.weaponTypes.types.push({
        key: "ranged",
        label: "Ranged Weapons",
        hasKeywords: true,
        hasProfiles: false,
        columns: [
          createFieldDefinition({ key: "range", label: "Range", type: "string", required: true }),
          createFieldDefinition({ key: "damage", label: "Damage", type: "string", required: true }),
        ],
      });

      mockStore[dsId] = { ...stored };

      // Re-validate after edits
      const postEditValidation = validateSchema(mockStore[dsId].schema);
      expect(postEditValidation.valid).toBe(true);

      // Verify edits persisted
      const updatedHero = mockStore[dsId].schema.cardTypes.find((ct) => ct.key === "hero");
      expect(updatedHero.schema.stats.fields).toHaveLength(4);
      expect(updatedHero.schema.stats.allowMultipleProfiles).toBe(true);
      expect(updatedHero.schema.weaponTypes.types).toHaveLength(2);

      // Step 6: Export the datasource schema
      const exported = exportDatasourceSchema(mockStore[dsId]);
      expect(exported).not.toBeNull();
      expect(exported.name).toBe("Custom RPG");
      expect(exported.version).toBe("1.0.0");
      expect(exported.author).toBe("Designer");
      expect(exported.schema).toBeDefined();
      expect(exported.schema.cardTypes).toHaveLength(2);
      expect(exported.factions).toBeDefined();
      expect(exported.factions).toHaveLength(1);

      // Verify export does not contain internal storage fields
      expect(exported.id).toBeUndefined();
      expect(exported.sourceType).toBeUndefined();
      expect(exported.sourceUrl).toBeUndefined();

      // Step 7: Re-import the exported schema as a new datasource
      // First, reconstruct a valid datasource from the export
      const reimportData = {
        name: exported.name,
        version: exported.version,
        author: exported.author,
        schema: exported.schema,
        data: exported.factions.map((f) => ({
          ...f,
          colours: f.colours || { header: "#000000", banner: "#111111" },
        })),
      };

      // Validate the reimport data
      const reimportValidation = validateCustomDatasource(reimportData);
      expect(reimportValidation.isValid).toBe(true);

      // Import via hook
      let importResponse;
      await act(async () => {
        importResponse = await result.current.importCustomDatasource(reimportData, "local");
      });

      expect(importResponse.success).toBe(true);
      expect(importResponse.id).toBeDefined();

      // Verify the reimported datasource has the same schema structure
      const reimported = mockStore[importResponse.id];
      expect(reimported.name).toBe("Custom RPG");
      expect(reimported.schema.cardTypes).toHaveLength(2);

      const reimportedHero = reimported.schema.cardTypes.find((ct) => ct.key === "hero");
      expect(reimportedHero.schema.stats.fields).toHaveLength(4);
      expect(reimportedHero.schema.stats.allowMultipleProfiles).toBe(true);
      expect(reimportedHero.schema.weaponTypes.types).toHaveLength(2);

      const reimportedStratagem = reimported.schema.cardTypes.find((ct) => ct.key === "tactic");
      expect(reimportedStratagem.schema.fields).toHaveLength(4);
      expect(reimportedStratagem.schema.fields.find((f) => f.key === "phase").type).toBe("enum");
    });

    it("creates AoS preset datasource, deletes card types, and validates result", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      const schema = createAoSPreset();
      let response;
      await act(async () => {
        response = await result.current.createCustomDatasource({ name: "AoS Custom", version: "1.0.0" }, schema);
      });

      expect(response.success).toBe(true);
      const dsId = response.id;
      let stored = mockStore[dsId];
      expect(stored.schema.cardTypes).toHaveLength(4);

      // Delete a card type (simulate the left panel delete action)
      stored.schema.cardTypes = stored.schema.cardTypes.filter((ct) => ct.key !== "spell");
      mockStore[dsId] = { ...stored };

      stored = mockStore[dsId];
      expect(stored.schema.cardTypes).toHaveLength(3);
      expect(stored.schema.cardTypes.find((ct) => ct.key === "spell")).toBeUndefined();

      // Schema should still be valid after deletion
      const validation = validateSchema(stored.schema);
      expect(validation.valid).toBe(true);
    });

    it("reorders card types and validates order is preserved through export/import", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      const schema = create40kPreset();
      let response;
      await act(async () => {
        response = await result.current.createCustomDatasource({ name: "Reorder Test", version: "1.0.0" }, schema);
      });

      const dsId = response.id;
      let stored = mockStore[dsId];

      // Original order: unit, rule, enhancement, stratagem
      expect(stored.schema.cardTypes.map((ct) => ct.baseType)).toEqual(["unit", "rule", "enhancement", "stratagem"]);

      // Reorder: move stratagem to position 1
      const reordered = [...stored.schema.cardTypes];
      const stratagem = reordered.splice(3, 1)[0];
      reordered.splice(1, 0, stratagem);
      stored.schema.cardTypes = reordered;
      mockStore[dsId] = { ...stored };

      expect(mockStore[dsId].schema.cardTypes.map((ct) => ct.baseType)).toEqual([
        "unit",
        "stratagem",
        "rule",
        "enhancement",
      ]);

      // Export and verify order preserved
      const exported = exportDatasourceSchema(mockStore[dsId]);
      expect(exported.schema.cardTypes.map((ct) => ct.baseType)).toEqual(["unit", "stratagem", "rule", "enhancement"]);
    });

    it("edits rule card type fields and validates collection changes", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      const schema = create40kPreset();
      let response;
      await act(async () => {
        response = await result.current.createCustomDatasource({ name: "Rule Edit Test", version: "1.0.0" }, schema);
      });

      const dsId = response.id;
      const stored = mockStore[dsId];

      // Find the rule card type and edit it
      const ruleType = stored.schema.cardTypes.find((ct) => ct.baseType === "rule");
      expect(ruleType).toBeDefined();

      // Add a new field to the rule type
      ruleType.schema.fields.push(
        createFieldDefinition({ key: "source", label: "Source Book", type: "string", required: false }),
      );

      // Add a new field to the rules collection
      ruleType.schema.rules.fields.push(
        createFieldDefinition({
          key: "severity",
          label: "Severity",
          type: "enum",
          options: ["low", "medium", "high"],
        }),
      );

      // Toggle allowMultiple on the rules collection
      ruleType.schema.rules.allowMultiple = false;

      mockStore[dsId] = { ...stored };

      // Validate
      const validation = validateSchema(mockStore[dsId].schema);
      expect(validation.valid).toBe(true);

      // Verify changes
      const updated = mockStore[dsId].schema.cardTypes.find((ct) => ct.baseType === "rule");
      expect(updated.schema.fields).toHaveLength(4);
      expect(updated.schema.fields[3].key).toBe("source");
      expect(updated.schema.rules.fields).toHaveLength(4);
      expect(updated.schema.rules.fields[3].key).toBe("severity");
      expect(updated.schema.rules.fields[3].type).toBe("enum");
      expect(updated.schema.rules.allowMultiple).toBe(false);
    });

    it("edits enhancement keywords collection and validates", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      const schema = create40kPreset();
      let response;
      await act(async () => {
        response = await result.current.createCustomDatasource(
          { name: "Enhancement Edit Test", version: "1.0.0" },
          schema,
        );
      });

      const dsId = response.id;
      const stored = mockStore[dsId];
      const enhancementType = stored.schema.cardTypes.find((ct) => ct.baseType === "enhancement");

      // Add a field to keywords collection
      enhancementType.schema.keywords.fields.push(
        createFieldDefinition({ key: "category", label: "Category", type: "string", required: false }),
      );

      // Add a new top-level field
      enhancementType.schema.fields.push(
        createFieldDefinition({
          key: "restrictions",
          label: "Restrictions",
          type: "richtext",
          required: false,
        }),
      );

      mockStore[dsId] = { ...stored };

      const validation = validateSchema(mockStore[dsId].schema);
      expect(validation.valid).toBe(true);

      const updated = mockStore[dsId].schema.cardTypes.find((ct) => ct.baseType === "enhancement");
      expect(updated.schema.fields).toHaveLength(4);
      expect(updated.schema.keywords.fields).toHaveLength(2);
    });

    it("handles invalid schema during re-import gracefully", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      // Try importing invalid data
      const invalidData = {
        name: "Bad Import",
        version: "1.0.0",
        data: [], // Empty data array fails validation
      };

      let importResponse;
      await act(async () => {
        importResponse = await result.current.importCustomDatasource(invalidData, "local");
      });

      expect(importResponse.success).toBe(false);
      expect(importResponse.error).toBeDefined();
    });

    it("export excludes storage-only fields and preserves faction colours", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      const schema = createBlankPreset();
      let response;
      await act(async () => {
        response = await result.current.createCustomDatasource(
          { name: "Export Test", version: "2.0.0", author: "Author" },
          schema,
        );
      });

      const stored = mockStore[response.id];

      // Verify storage-only fields exist
      expect(stored.sourceType).toBe("local");
      expect(stored.id).toMatch(/^custom-/);

      // Export
      const exported = exportDatasourceSchema(stored);

      // Verify export is clean
      expect(exported.name).toBe("Export Test");
      expect(exported.version).toBe("2.0.0");
      expect(exported.author).toBe("Author");
      expect(exported.schema).toBeDefined();
      expect(exported.lastUpdated).toBeDefined();
      expect(exported.factions).toHaveLength(1);
      expect(exported.factions[0].colours).toEqual({ header: "#1a1a2e", banner: "#16213e" });

      // No storage-only fields
      expect(exported.id).toBeUndefined();
      expect(exported.sourceType).toBeUndefined();
      expect(exported.sourceUrl).toBeUndefined();
      expect(exported.data).toBeUndefined();
    });

    it("round-trips complex schema through export and re-import without data loss", async () => {
      const { result } = renderHook(() => useDataSourceStorage(), { wrapper });

      // Create a complex datasource with all card types
      const schema = create40kPreset();
      let response;
      await act(async () => {
        response = await result.current.createCustomDatasource(
          { name: "Round Trip", version: "3.0.0", author: "Tester" },
          schema,
        );
      });

      const original = mockStore[response.id];

      // Modify schema: add custom fields, change settings
      const unitType = original.schema.cardTypes.find((ct) => ct.baseType === "unit");
      unitType.schema.stats.fields.push(
        createFieldDefinition({ key: "fnp", label: "FNP", type: "string", displayOrder: 8 }),
      );
      unitType.schema.abilities.categories.push({
        key: "psychic",
        label: "Psychic Powers",
        format: "name-description",
      });
      mockStore[response.id] = { ...original };

      // Export
      const exported = exportDatasourceSchema(mockStore[response.id]);

      // Build reimport data
      const reimportData = {
        name: exported.name,
        version: exported.version,
        author: exported.author,
        schema: exported.schema,
        data: exported.factions.map((f) => ({
          ...f,
          colours: f.colours,
        })),
      };

      // Validate before import
      const preImportValidation = validateCustomDatasource(reimportData);
      expect(preImportValidation.isValid).toBe(true);

      // Import
      let importResponse;
      await act(async () => {
        importResponse = await result.current.importCustomDatasource(reimportData, "local");
      });

      expect(importResponse.success).toBe(true);
      const reimported = mockStore[importResponse.id];

      // Deep comparison of schema structure
      expect(reimported.schema.baseSystem).toBe(original.schema.baseSystem);
      expect(reimported.schema.cardTypes).toHaveLength(original.schema.cardTypes.length);

      // Verify the custom stat field survived round-trip
      const reimportedUnit = reimported.schema.cardTypes.find((ct) => ct.baseType === "unit");
      expect(reimportedUnit.schema.stats.fields).toHaveLength(8);
      expect(reimportedUnit.schema.stats.fields[7].key).toBe("fnp");

      // Verify the custom ability category survived
      expect(reimportedUnit.schema.abilities.categories).toHaveLength(5);
      expect(reimportedUnit.schema.abilities.categories[4].key).toBe("psychic");

      // Verify all other card types intact
      const reimportedRule = reimported.schema.cardTypes.find((ct) => ct.baseType === "rule");
      expect(reimportedRule.schema.fields).toHaveLength(3);
      expect(reimportedRule.schema.rules.fields).toHaveLength(3);

      const reimportedEnhancement = reimported.schema.cardTypes.find((ct) => ct.baseType === "enhancement");
      expect(reimportedEnhancement.schema.fields).toHaveLength(3);
      expect(reimportedEnhancement.schema.keywords.fields).toHaveLength(1);

      const reimportedStratagem = reimported.schema.cardTypes.find((ct) => ct.baseType === "stratagem");
      expect(reimportedStratagem.schema.fields).toHaveLength(5);
    });
  });
});
