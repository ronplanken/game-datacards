import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SchemaTreeView } from "../SchemaTreeView";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
  BarChart3: (props) => <svg data-testid="icon-bar-chart" {...props} />,
  Crosshair: (props) => <svg data-testid="icon-crosshair" {...props} />,
  Shield: (props) => <svg data-testid="icon-shield" {...props} />,
  Settings: (props) => <svg data-testid="icon-settings" {...props} />,
  List: (props) => <svg data-testid="icon-list" {...props} />,
  FileText: (props) => <svg data-testid="icon-file-text" {...props} />,
  Swords: (props) => <svg data-testid="icon-swords" {...props} />,
  BookOpen: (props) => <svg data-testid="icon-book-open" {...props} />,
  Sparkles: (props) => <svg data-testid="icon-sparkles" {...props} />,
  Zap: (props) => <svg data-testid="icon-zap" {...props} />,
  Database: (props) => <svg data-testid="icon-database" {...props} />,
}));

const mockUnitCardType = {
  key: "infantry",
  label: "Infantry",
  baseType: "unit",
  schema: {
    stats: {
      label: "Stat Profiles",
      allowMultipleProfiles: true,
      fields: [
        { key: "m", label: "M", type: "string", displayOrder: 1 },
        { key: "t", label: "T", type: "string", displayOrder: 2 },
        { key: "sv", label: "SV", type: "string", displayOrder: 3 },
      ],
    },
    weaponTypes: {
      label: "Weapon Types",
      types: [
        {
          key: "ranged",
          label: "Ranged Weapons",
          hasKeywords: true,
          hasProfiles: true,
          columns: [
            { key: "range", label: "Range", type: "string", required: true },
            { key: "a", label: "A", type: "string", required: true },
          ],
        },
        {
          key: "melee",
          label: "Melee Weapons",
          hasKeywords: false,
          hasProfiles: false,
          columns: [{ key: "range", label: "Range", type: "string", required: true }],
        },
      ],
    },
    abilities: {
      label: "Abilities",
      categories: [
        { key: "core", label: "Core", format: "name-only" },
        { key: "faction", label: "Faction", format: "name-description" },
      ],
      hasInvulnerableSave: true,
      hasDamagedAbility: true,
    },
    metadata: {
      hasKeywords: true,
      hasFactionKeywords: true,
      hasPoints: true,
      pointsFormat: "per-model",
    },
  },
};

const mockRuleCardType = {
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
      fields: [
        { key: "title", label: "Title", type: "string", required: true },
        { key: "format", label: "Format", type: "enum", options: ["name-description", "name-only"] },
      ],
    },
  },
};

const mockEnhancementCardType = {
  key: "warlord-trait",
  label: "Warlord Trait",
  baseType: "enhancement",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "cost", label: "Cost", type: "string", required: true },
    ],
    keywords: {
      label: "Keywords",
      allowMultiple: true,
      fields: [{ key: "keyword", label: "Keyword", type: "string", required: true }],
    },
  },
};

const mockStratagemCardType = {
  key: "battle-tactic",
  label: "Battle Tactic",
  baseType: "stratagem",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "phase", label: "Phase", type: "enum", required: true },
      { key: "active", label: "Active", type: "boolean", required: false },
    ],
  },
};

const mockDatasource = {
  id: "ds-1",
  name: "Test Datasource",
  version: "1.0.0",
  schema: {
    baseSystem: "40k-10e",
    cardTypes: [mockUnitCardType, mockRuleCardType],
  },
};

describe("SchemaTreeView", () => {
  describe("returns null for invalid states", () => {
    it("returns null when no selectedItem", () => {
      const { container } = render(<SchemaTreeView selectedItem={null} activeDatasource={mockDatasource} />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when no activeDatasource", () => {
      const { container } = render(<SchemaTreeView selectedItem={{ type: "datasource" }} activeDatasource={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("datasource overview", () => {
    it("renders datasource name in overview", () => {
      render(<SchemaTreeView selectedItem={{ type: "datasource" }} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Test Datasource")).toBeInTheDocument();
    });

    it("renders all card types in overview", () => {
      render(<SchemaTreeView selectedItem={{ type: "datasource" }} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Infantry")).toBeInTheDocument();
      expect(screen.getByText("Battle Rules")).toBeInTheDocument();
    });

    it("shows base type labels for each card type", () => {
      render(<SchemaTreeView selectedItem={{ type: "datasource" }} activeDatasource={mockDatasource} />);
      expect(screen.getByText("unit")).toBeInTheDocument();
      expect(screen.getByText("rule")).toBeInTheDocument();
    });

    it("shows field counts for card types", () => {
      render(<SchemaTreeView selectedItem={{ type: "datasource" }} activeDatasource={mockDatasource} />);
      // Unit: 3 stats + 3 weapon columns + 2 abilities = 8 fields
      expect(screen.getByText("8 fields")).toBeInTheDocument();
      // Rule: 2 top-level fields
      expect(screen.getByText("2 fields")).toBeInTheDocument();
    });

    it("shows empty message when no card types", () => {
      const emptyDs = { ...mockDatasource, schema: { cardTypes: [] } };
      render(<SchemaTreeView selectedItem={{ type: "datasource" }} activeDatasource={emptyDs} />);
      expect(screen.getByText("No card types defined")).toBeInTheDocument();
    });
  });

  describe("unit card type tree", () => {
    const selectedItem = { type: "cardType", key: "infantry", data: mockUnitCardType };

    it("renders card type header with label and baseType", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Infantry")).toBeInTheDocument();
      expect(screen.getByText("unit")).toBeInTheDocument();
    });

    it("renders stats section with fields", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Stat Profiles")).toBeInTheDocument();
      expect(screen.getByText("m")).toBeInTheDocument();
      expect(screen.getByText("t")).toBeInTheDocument();
      expect(screen.getByText("sv")).toBeInTheDocument();
    });

    it("shows multiple profiles flag", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Multiple profiles allowed")).toBeInTheDocument();
    });

    it("renders weapon types section with badge count", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Weapon Types")).toBeInTheDocument();
    });

    it("renders abilities section with categories", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Abilities")).toBeInTheDocument();
      expect(screen.getByText("core")).toBeInTheDocument();
      expect(screen.getByText("faction")).toBeInTheDocument();
    });

    it("shows invulnerable save and damaged ability flags", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Invulnerable save")).toBeInTheDocument();
      expect(screen.getByText("Damaged ability")).toBeInTheDocument();
    });

    it("renders metadata section with flags", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Metadata")).toBeInTheDocument();
      expect(screen.getByText("Keywords")).toBeInTheDocument();
      expect(screen.getByText("Faction keywords")).toBeInTheDocument();
      expect(screen.getByText("Points (per-model)")).toBeInTheDocument();
    });

    it("expands weapon type to show columns", async () => {
      const user = userEvent.setup();
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);

      // Weapon types are collapsed by default, click to expand
      await user.click(screen.getByText("Ranged Weapons"));
      expect(screen.getByText("range")).toBeInTheDocument();
      expect(screen.getByText("Has keywords")).toBeInTheDocument();
      expect(screen.getByText("Has profiles")).toBeInTheDocument();
    });
  });

  describe("rule card type tree", () => {
    const selectedItem = { type: "cardType", key: "battle-rules", data: mockRuleCardType };

    it("renders fields section with field definitions", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Fields")).toBeInTheDocument();
      expect(screen.getByText("name")).toBeInTheDocument();
      expect(screen.getByText("description")).toBeInTheDocument();
    });

    it("renders rules collection section", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Rules")).toBeInTheDocument();
      expect(screen.getByText("Allow multiple")).toBeInTheDocument();
    });

    it("shows required indicators", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      const requiredIndicators = screen.getAllByText("required");
      expect(requiredIndicators.length).toBeGreaterThanOrEqual(1);
    });

    it("shows type badges for fields", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      const stringBadges = screen.getAllByText("string");
      expect(stringBadges.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("richtext")).toBeInTheDocument();
    });
  });

  describe("enhancement card type tree", () => {
    const selectedItem = { type: "cardType", key: "warlord-trait", data: mockEnhancementCardType };

    it("renders fields and keywords sections", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Fields")).toBeInTheDocument();
      // Keywords collection label from schema
      const keywordsElements = screen.getAllByText("Keywords");
      expect(keywordsElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("stratagem card type tree", () => {
    const selectedItem = { type: "cardType", key: "battle-tactic", data: mockStratagemCardType };

    it("renders fields section only (no collections)", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Fields")).toBeInTheDocument();
      expect(screen.getByText("name")).toBeInTheDocument();
      expect(screen.getByText("phase")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("shows all field type badges", () => {
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      const stringBadges = screen.getAllByText("string");
      expect(stringBadges.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("enum")).toBeInTheDocument();
      expect(screen.getByText("boolean")).toBeInTheDocument();
    });
  });

  describe("tree node interactions", () => {
    it("collapses and expands sections on click", async () => {
      const user = userEvent.setup();
      const selectedItem = { type: "cardType", key: "infantry", data: mockUnitCardType };
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);

      // Stats is open by default and shows fields
      expect(screen.getByText("m")).toBeInTheDocument();

      // Click Stats to collapse
      await user.click(screen.getByText("Stat Profiles"));
      expect(screen.queryByText("m")).not.toBeInTheDocument();

      // Click again to expand
      await user.click(screen.getByText("Stat Profiles"));
      expect(screen.getByText("m")).toBeInTheDocument();
    });

    it("expands enum field to show options", async () => {
      const user = userEvent.setup();
      const selectedItem = { type: "cardType", key: "battle-rules", data: mockRuleCardType };
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);

      // First expand the Rules section (defaultOpen=true, so fields are visible)
      // The "format" enum field should be collapsible
      const formatField = screen.getByText("format");
      expect(formatField).toBeInTheDocument();

      // Options should not be visible yet
      expect(screen.queryByText("name-description")).not.toBeInTheDocument();

      // Click the format field to expand its options
      await user.click(formatField);
      expect(screen.getByText("name-description")).toBeInTheDocument();
      expect(screen.getByText("name-only")).toBeInTheDocument();

      // Click again to collapse
      await user.click(formatField);
      expect(screen.queryByText("name-description")).not.toBeInTheDocument();
    });

    it("does not make non-enum fields collapsible", () => {
      const selectedItem = { type: "cardType", key: "battle-rules", data: mockRuleCardType };
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);

      // The "name" field is type string - should not have expand/collapse chevron
      const nameButton = screen.getByText("name").closest("button");
      expect(nameButton).not.toHaveAttribute("aria-expanded");
    });

    it("shows chevron icons on collapsible enum fields", () => {
      const selectedItem = { type: "cardType", key: "battle-rules", data: mockRuleCardType };
      render(<SchemaTreeView selectedItem={selectedItem} activeDatasource={mockDatasource} />);

      // The "format" enum field should have a chevron-right icon (collapsed)
      const formatButton = screen.getByText("format").closest("button");
      expect(formatButton).toHaveAttribute("aria-expanded", "false");
    });
  });
});
