import { render, screen } from "@testing-library/react";
import { EditorCenterPanel } from "../EditorCenterPanel";

// Mock DatasourceCardPreview to avoid deep import chain
vi.mock("../DatasourceCardPreview", () => ({
  DatasourceCardPreview: ({ card }) => <div data-testid="card-preview">{card?.name || "Card Preview"}</div>,
}));

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
          columns: [{ key: "range", label: "Range", type: "string", required: true }],
        },
      ],
    },
    abilities: {
      label: "Abilities",
      categories: [{ key: "core", label: "Core", format: "name-only" }],
      hasInvulnerableSave: false,
      hasDamagedAbility: false,
    },
    metadata: { hasKeywords: true, hasFactionKeywords: false, hasPoints: false },
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
      fields: [{ key: "title", label: "Title", type: "string", required: true }],
    },
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

describe("EditorCenterPanel", () => {
  describe("empty state", () => {
    it("renders empty state when no selection", () => {
      render(<EditorCenterPanel selectedItem={null} activeDatasource={null} />);
      expect(screen.getByText("Select a card type to view its structure")).toBeInTheDocument();
    });

    it("renders empty state when selectedItem is null but datasource exists", () => {
      render(<EditorCenterPanel selectedItem={null} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Select a card type to view its structure")).toBeInTheDocument();
    });

    it("renders empty state when datasource is null but selectedItem exists", () => {
      render(<EditorCenterPanel selectedItem={{ type: "datasource" }} activeDatasource={null} />);
      expect(screen.getByText("Select a card type to view its structure")).toBeInTheDocument();
    });
  });

  describe("datasource overview", () => {
    it("renders datasource overview when datasource parent is selected", () => {
      render(<EditorCenterPanel selectedItem={{ type: "datasource" }} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Test Datasource")).toBeInTheDocument();
      expect(screen.getByText("Infantry")).toBeInTheDocument();
      expect(screen.getByText("Battle Rules")).toBeInTheDocument();
    });

    it("does not show the empty state when datasource is selected", () => {
      render(<EditorCenterPanel selectedItem={{ type: "datasource" }} activeDatasource={mockDatasource} />);
      expect(screen.queryByText("Select a card type to view its structure")).not.toBeInTheDocument();
    });
  });

  describe("card type schema tree", () => {
    it("renders unit schema tree when unit card type is selected", () => {
      const selectedItem = { type: "cardType", key: "infantry", data: mockUnitCardType };
      render(<EditorCenterPanel selectedItem={selectedItem} activeDatasource={mockDatasource} />);

      expect(screen.getByText("Infantry")).toBeInTheDocument();
      expect(screen.getByText("Stat Profiles")).toBeInTheDocument();
      expect(screen.getByText("Weapon Types")).toBeInTheDocument();
      expect(screen.getByText("Abilities")).toBeInTheDocument();
    });

    it("renders generic schema tree when rule card type is selected", () => {
      const selectedItem = { type: "cardType", key: "battle-rules", data: mockRuleCardType };
      render(<EditorCenterPanel selectedItem={selectedItem} activeDatasource={mockDatasource} />);

      expect(screen.getByText("Battle Rules")).toBeInTheDocument();
      expect(screen.getByText("Fields")).toBeInTheDocument();
      expect(screen.getByText("Rules")).toBeInTheDocument();
    });

    it("does not show empty state when card type is selected", () => {
      const selectedItem = { type: "cardType", key: "infantry", data: mockUnitCardType };
      render(<EditorCenterPanel selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(screen.queryByText("Select a card type to view its structure")).not.toBeInTheDocument();
    });

    it("renders the schema tree container", () => {
      const selectedItem = { type: "cardType", key: "infantry", data: mockUnitCardType };
      const { container } = render(<EditorCenterPanel selectedItem={selectedItem} activeDatasource={mockDatasource} />);
      expect(container.querySelector(".schema-tree-container")).toBeInTheDocument();
    });
  });
});
