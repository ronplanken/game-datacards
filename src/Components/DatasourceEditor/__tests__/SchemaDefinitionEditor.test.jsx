import { render, screen } from "@testing-library/react";
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
  id: "ds-1",
  name: "Test Datasource",
  version: "1.0.0",
  author: "Test Author",
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
            allowMultipleProfiles: true,
            fields: [
              { key: "m", label: "M", type: "string", displayOrder: 1 },
              { key: "t", label: "T", type: "string", displayOrder: 2 },
            ],
          },
          weaponTypes: {
            label: "Weapon Types",
            types: [{ key: "ranged", label: "Ranged Weapons", columns: [] }],
          },
          abilities: {
            label: "Abilities",
            categories: [{ key: "core", label: "Core", format: "name-only" }],
            hasInvulnerableSave: true,
            hasDamagedAbility: false,
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
          fields: [
            { key: "name", label: "Name", type: "string", required: true },
            { key: "description", label: "Description", type: "richtext", required: false },
          ],
          rules: {
            label: "Rules",
            allowMultiple: true,
            fields: [{ key: "title", label: "Title", type: "string", required: true }],
          },
        },
      },
      {
        key: "warlord-trait",
        label: "Warlord Trait",
        baseType: "enhancement",
        schema: {
          fields: [{ key: "name", label: "Name", type: "string", required: true }],
          keywords: {
            label: "Keywords",
            allowMultiple: true,
            fields: [{ key: "keyword", label: "Keyword", type: "string", required: true }],
          },
        },
      },
      {
        key: "battle-tactic",
        label: "Battle Tactic",
        baseType: "stratagem",
        schema: {
          fields: [
            { key: "name", label: "Name", type: "string", required: true },
            { key: "cost", label: "Cost", type: "string", required: true },
          ],
        },
      },
    ],
  },
};

describe("SchemaDefinitionEditor", () => {
  describe("empty state", () => {
    it("renders empty state when no item is selected", () => {
      render(<SchemaDefinitionEditor />);
      expect(screen.getByText("Select a datasource or card type")).toBeInTheDocument();
    });

    it("renders empty state with null selectedItem", () => {
      render(<SchemaDefinitionEditor selectedItem={null} />);
      expect(screen.getByText("Details and settings will appear here")).toBeInTheDocument();
    });
  });

  describe("datasource selected", () => {
    it("renders DatasourceMetadataEditor when datasource is selected", () => {
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "datasource" }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(screen.getByText("Datasource Info")).toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toHaveValue("Test Datasource");
      expect(screen.getByLabelText("Version")).toHaveValue("1.0.0");
      expect(screen.getByLabelText("Author")).toHaveValue("Test Author");
    });

    it("renders nothing for datasource when activeDatasource is null", () => {
      const { container } = render(
        <SchemaDefinitionEditor selectedItem={{ type: "datasource" }} activeDatasource={null} />,
      );
      expect(container.querySelector(".props-body")).toBeNull();
    });
  });

  describe("unit card type selected", () => {
    it("renders all unit sub-editors for unit baseType", () => {
      const unitCardType = mockDatasource.schema.cardTypes[0];
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "infantry", data: unitCardType }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(screen.getByText("Stats")).toBeInTheDocument();
      expect(screen.getByText("Weapon Types")).toBeInTheDocument();
      expect(screen.getByText("Abilities")).toBeInTheDocument();
      expect(screen.getByText("Metadata")).toBeInTheDocument();
    });

    it("shows stat fields as editable inputs", () => {
      const unitCardType = mockDatasource.schema.cardTypes[0];
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "infantry", data: unitCardType }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      // Stat fields M and T should be rendered as editable inputs
      expect(screen.getByDisplayValue("M")).toBeInTheDocument();
      expect(screen.getByDisplayValue("T")).toBeInTheDocument();
    });

    it("shows multi-profile checkbox", () => {
      const unitCardType = mockDatasource.schema.cardTypes[0];
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "infantry", data: unitCardType }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(screen.getByText("Allow multiple profiles")).toBeInTheDocument();
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("rule card type selected", () => {
    it("renders FieldsSchemaEditor for rule baseType", () => {
      const ruleCardType = mockDatasource.schema.cardTypes[1];
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "battle-rules", data: ruleCardType }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(screen.getAllByText("Fields").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Rules Collection")).toBeInTheDocument();
    });

    it("does not render unit-specific sections for rule type", () => {
      const ruleCardType = mockDatasource.schema.cardTypes[1];
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "battle-rules", data: ruleCardType }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(screen.queryByText("Stats")).not.toBeInTheDocument();
      expect(screen.queryByText("Weapon Types")).not.toBeInTheDocument();
    });
  });

  describe("enhancement card type selected", () => {
    it("renders FieldsSchemaEditor with keywords collection for enhancement baseType", () => {
      const enhancementCardType = mockDatasource.schema.cardTypes[2];
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "warlord-trait", data: enhancementCardType }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(screen.getAllByText("Fields").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Keywords Collection")).toBeInTheDocument();
    });
  });

  describe("stratagem card type selected", () => {
    it("renders FieldsSchemaEditor without extra collections for stratagem baseType", () => {
      const stratagemCardType = mockDatasource.schema.cardTypes[3];
      render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "battle-tactic", data: stratagemCardType }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(screen.getAllByText("Fields").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Rules Collection")).not.toBeInTheDocument();
      expect(screen.queryByText("Keywords Collection")).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("returns null for card type with no data", () => {
      const { container } = render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "unknown" }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(container.querySelector(".props-body")).toBeNull();
      expect(screen.queryByText("Select a datasource or card type")).not.toBeInTheDocument();
    });

    it("returns null for unknown baseType", () => {
      const { container } = render(
        <SchemaDefinitionEditor
          selectedItem={{ type: "cardType", key: "x", data: { key: "x", label: "X", baseType: "unknown", schema: {} } }}
          activeDatasource={mockDatasource}
          onUpdateDatasource={vi.fn()}
        />,
      );
      expect(container.querySelector(".props-body")).toBeNull();
    });
  });
});
