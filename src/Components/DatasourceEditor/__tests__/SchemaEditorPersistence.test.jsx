import { render, screen, fireEvent } from "@testing-library/react";
import { SchemaDefinitionEditor } from "../SchemaDefinitionEditor";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Settings: (props) => <svg data-testid="icon-settings" {...props} />,
  Database: (props) => <svg data-testid="icon-database" {...props} />,
  Info: (props) => <svg data-testid="icon-info" {...props} />,
  BarChart3: (props) => <svg data-testid="icon-barchart" {...props} />,
  Swords: (props) => <svg data-testid="icon-swords" {...props} />,
  Sparkles: (props) => <svg data-testid="icon-sparkles" {...props} />,
  Tag: (props) => <svg data-testid="icon-tag" {...props} />,
  Tags: (props) => <svg data-testid="icon-tags" {...props} />,
  List: (props) => <svg data-testid="icon-list" {...props} />,
  BookOpen: (props) => <svg data-testid="icon-book-open" {...props} />,
  Layers: (props) => <svg data-testid="icon-layers" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
  ChevronUp: (props) => <svg data-testid="icon-chevron-up" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
}));

const mockDatasource = {
  id: "custom-test-1",
  name: "Test DS",
  version: "1.0.0",
  author: "Tester",
  schema: {
    baseSystem: "40k-10e",
    cardTypes: [
      {
        key: "infantry",
        label: "Infantry",
        baseType: "unit",
        schema: {
          stats: {
            label: "Stats",
            allowMultipleProfiles: false,
            fields: [
              { key: "m", label: "M", type: "string", displayOrder: 1 },
              { key: "t", label: "T", type: "string", displayOrder: 2 },
            ],
          },
          weaponTypes: {
            label: "Weapon Types",
            types: [
              {
                key: "ranged",
                label: "Ranged Weapons",
                hasKeywords: true,
                hasProfiles: false,
                columns: [{ key: "range", label: "Range", type: "string", required: true }],
              },
            ],
          },
          abilities: {
            label: "Abilities",
            categories: [{ key: "core", label: "Core", format: "name-only" }],
          },
          metadata: {
            hasKeywords: true,
            hasFactionKeywords: true,
            hasPoints: true,
            pointsFormat: "per-model",
          },
        },
      },
      {
        key: "battle-rules",
        label: "Battle Rules",
        baseType: "rule",
        schema: {
          fields: [{ key: "name", label: "Name", type: "string", required: true }],
          rules: {
            label: "Rules",
            allowMultiple: true,
            fields: [{ key: "title", label: "Title", type: "string", required: true }],
          },
        },
      },
    ],
  },
};

describe("SchemaEditorPersistence", () => {
  describe("datasource metadata edits trigger onUpdateDatasource", () => {
    it("editing datasource name calls onUpdateDatasource with updated name", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "datasource" }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      const nameInput = screen.getByLabelText("Name");
      fireEvent.change(nameInput, { target: { value: "New DS Name" } });

      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: "New DS Name" }));
    });

    it("editing version calls onUpdateDatasource with updated version", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "datasource" }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      const versionInput = screen.getByLabelText("Version");
      fireEvent.change(versionInput, { target: { value: "2.0.0" } });

      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ version: "2.0.0" }));
    });

    it("editing author calls onUpdateDatasource with updated author", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "datasource" }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      const authorInput = screen.getByLabelText("Author");
      fireEvent.change(authorInput, { target: { value: "New Author" } });

      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ author: "New Author" }));
    });
  });

  describe("unit card type schema edits trigger onUpdateDatasource", () => {
    const unitCardType = mockDatasource.schema.cardTypes[0];
    const unitSelectedItem = { type: "cardType", key: "infantry", data: unitCardType };

    it("toggling allowMultipleProfiles calls onUpdateDatasource with updated schema", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={unitSelectedItem}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      const checkbox = screen.getByLabelText("Allow multiple profiles");
      fireEvent.click(checkbox);

      expect(onUpdate).toHaveBeenCalledTimes(1);
      const updatedDS = onUpdate.mock.calls[0][0];
      const updatedInfantry = updatedDS.schema.cardTypes.find((ct) => ct.key === "infantry");
      expect(updatedInfantry.schema.stats.allowMultipleProfiles).toBe(true);
    });

    it("adding a stat field calls onUpdateDatasource with new field appended", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={unitSelectedItem}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      const addStatBtn = screen.getByLabelText("Add stat");
      fireEvent.click(addStatBtn);

      expect(onUpdate).toHaveBeenCalledTimes(1);
      const updatedDS = onUpdate.mock.calls[0][0];
      const updatedInfantry = updatedDS.schema.cardTypes.find((ct) => ct.key === "infantry");
      expect(updatedInfantry.schema.stats.fields).toHaveLength(3);
    });

    it("toggling keywords calls onUpdateDatasource", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={unitSelectedItem}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      const checkbox = screen.getByLabelText("Include keywords");
      fireEvent.click(checkbox);

      expect(onUpdate).toHaveBeenCalledTimes(1);
      const updatedDS = onUpdate.mock.calls[0][0];
      const updatedInfantry = updatedDS.schema.cardTypes.find((ct) => ct.key === "infantry");
      expect(updatedInfantry.schema.metadata.hasKeywords).toBe(false);
    });

    it("schema edits preserve other card types unchanged", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={unitSelectedItem}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      const checkbox = screen.getByLabelText("Allow multiple profiles");
      fireEvent.click(checkbox);

      const updatedDS = onUpdate.mock.calls[0][0];
      const ruleCardType = updatedDS.schema.cardTypes.find((ct) => ct.key === "battle-rules");
      expect(ruleCardType).toEqual(mockDatasource.schema.cardTypes[1]);
    });
  });

  describe("rule card type schema edits trigger onUpdateDatasource", () => {
    const ruleCardType = mockDatasource.schema.cardTypes[1];
    const ruleSelectedItem = { type: "cardType", key: "battle-rules", data: ruleCardType };

    it("adding a field calls onUpdateDatasource with new field", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={ruleSelectedItem}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      // There should be an "Add Field" button in the Fields section
      const addButtons = screen.getAllByText("Add Field");
      fireEvent.click(addButtons[0]);

      expect(onUpdate).toHaveBeenCalledTimes(1);
      const updatedDS = onUpdate.mock.calls[0][0];
      const updatedRule = updatedDS.schema.cardTypes.find((ct) => ct.key === "battle-rules");
      expect(updatedRule.schema.fields).toHaveLength(2);
    });

    it("toggling allowMultiple on rules collection calls onUpdateDatasource", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={ruleSelectedItem}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      const checkbox = screen.getByLabelText("Allow multiple rules");
      fireEvent.click(checkbox);

      expect(onUpdate).toHaveBeenCalledTimes(1);
      const updatedDS = onUpdate.mock.calls[0][0];
      const updatedRule = updatedDS.schema.cardTypes.find((ct) => ct.key === "battle-rules");
      expect(updatedRule.schema.rules.allowMultiple).toBe(false);
    });
  });

  describe("onUpdateDatasource not called without interaction", () => {
    it("rendering editors does not trigger onUpdateDatasource", () => {
      const onUpdate = vi.fn();
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "datasource" }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={onUpdate}
        />,
      );

      expect(onUpdate).not.toHaveBeenCalled();
    });
  });
});
