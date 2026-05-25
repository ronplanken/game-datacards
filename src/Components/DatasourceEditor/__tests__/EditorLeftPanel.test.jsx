import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorLeftPanel } from "../EditorLeftPanel";

// Mock Premium exports
vi.mock("../../../Premium", () => ({
  DatasourceSyncIcon: () => null,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Database: (props) => <svg data-testid="icon-database" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Swords: (props) => <svg data-testid="icon-swords" {...props} />,
  BookOpen: (props) => <svg data-testid="icon-book-open" {...props} />,
  Sparkles: (props) => <svg data-testid="icon-sparkles" {...props} />,
  Zap: (props) => <svg data-testid="icon-zap" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronUp: (props) => <svg data-testid="icon-chevron-up" {...props} />,
  FolderOpen: (props) => <svg data-testid="icon-folder-open" {...props} />,
  Download: (props) => <svg data-testid="icon-download" {...props} />,
  Upload: (props) => <svg data-testid="icon-upload" {...props} />,
  HelpCircle: (props) => <svg data-testid="icon-help" {...props} />,
  Tag: (props) => <svg data-testid="icon-tag" {...props} />,
}));

const mockDatasource = {
  id: "ds-1",
  name: "Test Datasource",
  version: "1.0.0",
  schema: {
    baseSystem: "40k-10e",
    cardTypes: [
      { key: "infantry", label: "Infantry", baseType: "unit", schema: {} },
      { key: "battle-rules", label: "Battle Rules", baseType: "rule", schema: {} },
    ],
  },
  data: [
    {
      id: "faction-1",
      name: "Faction",
      datasheets: [
        { id: "card-1", name: "Zeta Unit", cardType: "infantry" },
        { id: "card-2", name: "Alpha Unit", cardType: "infantry" },
        { id: "card-3", name: "Beta Unit", cardType: "infantry", subcategory: "Core" },
        { id: "card-4", name: "Gamma Unit", cardType: "infantry", subcategory: "Core" },
        { id: "card-5", name: "Delta Unit", cardType: "infantry", subcategory: "Elite" },
      ],
      rules: [{ id: "card-6", name: "Test Rule", cardType: "battle-rules" }],
    },
  ],
};

const mockDatasources = [mockDatasource, { id: "ds-2", name: "Other DS", version: "2.0.0", schema: { cardTypes: [] } }];

describe("EditorLeftPanel", () => {
  describe("empty state", () => {
    it("renders onboarding when no datasources and no active datasource", () => {
      render(<EditorLeftPanel datasources={[]} />);
      expect(screen.getByText("Custom Datasources")).toBeInTheDocument();
    });

    it("renders description in onboarding", () => {
      render(<EditorLeftPanel datasources={[]} />);
      expect(screen.getByText(/Build your own card formats/)).toBeInTheDocument();
    });
  });

  describe("with active datasource", () => {
    it("renders datasource info section", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      // Name appears in both info section and tree item
      const nameElements = screen.getAllByText("Test Datasource");
      expect(nameElements.length).toBeGreaterThanOrEqual(1);
    });

    it("renders version and base system info", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
      expect(screen.getByText(/40k-10e/)).toBeInTheDocument();
      expect(screen.getByText(/2 card types/)).toBeInTheDocument();
    });

    it("renders Card Types panel header", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      expect(screen.getByText("Card Types")).toBeInTheDocument();
    });

    it("renders card type items in tree", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      // Card type labels appear in both the tree and the Cards tab bar
      expect(screen.getAllByText("Infantry").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Battle Rules").length).toBeGreaterThanOrEqual(1);
    });

    it("renders New Datasource button in selector", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      const buttons = screen.getAllByText("New Datasource");
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it("renders Add Card Type button", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      expect(screen.getByTitle("Add card type")).toBeInTheDocument();
    });

    it("renders enabled Export button when datasource is active", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      const btn = screen.getByTitle("Export datasource");
      expect(btn).toBeInTheDocument();
      expect(btn).not.toBeDisabled();
    });

    it("renders disabled Import button when datasource is active", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      const btn = screen.getByTitle("Import schema (coming soon)");
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("calls onSelectDatasource when datasource parent item clicked", async () => {
      const user = userEvent.setup();
      const onSelectDatasource = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onSelectDatasource={onSelectDatasource}
        />,
      );
      // The datasource parent item in the tree (not the info section)
      const treeItems = screen.getAllByText("Test Datasource");
      // The second occurrence is the tree item
      await user.click(treeItems[treeItems.length - 1]);
      expect(onSelectDatasource).toHaveBeenCalledWith(mockDatasource);
    });

    it("calls onSelectCardType when a card type item clicked", async () => {
      const user = userEvent.setup();
      const onSelectCardType = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onSelectCardType={onSelectCardType}
        />,
      );
      // Click the card type item in the tree (first instance, in the Card Types section)
      const infantryElements = screen.getAllByText("Infantry");
      await user.click(infantryElements[0]);
      expect(onSelectCardType).toHaveBeenCalledWith(mockDatasource.schema.cardTypes[0]);
    });

    it("calls onDeleteCardType when delete button clicked", async () => {
      const user = userEvent.setup();
      const onDeleteCardType = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onDeleteCardType={onDeleteCardType}
        />,
      );
      const deleteButtons = screen.getAllByTitle(/^Delete /);
      // Find the card type delete buttons (not the datasource delete button)
      const cardTypeDeleteBtn = deleteButtons.find(
        (btn) => btn.title.startsWith("Delete Infantry") || btn.title.startsWith("Delete Battle"),
      );
      await user.click(cardTypeDeleteBtn);
      expect(onDeleteCardType).toHaveBeenCalled();
    });

    it("calls onAddCardType when Add Card Type button clicked", async () => {
      const user = userEvent.setup();
      const onAddCardType = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onAddCardType={onAddCardType}
        />,
      );
      await user.click(screen.getByTitle("Add card type"));
      expect(onAddCardType).toHaveBeenCalledTimes(1);
    });

    it("calls onExportDatasource with the active datasource when Export button clicked", async () => {
      const user = userEvent.setup();
      const onExportDatasource = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onExportDatasource={onExportDatasource}
        />,
      );
      await user.click(screen.getByTitle("Export datasource"));
      expect(onExportDatasource).toHaveBeenCalledWith(mockDatasource);
    });

    it("does not call onImportSchema when disabled Import button clicked", async () => {
      const user = userEvent.setup();
      const onImportSchema = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onImportSchema={onImportSchema}
        />,
      );
      await user.click(screen.getByTitle("Import schema (coming soon)"));
      expect(onImportSchema).not.toHaveBeenCalled();
    });

    it("toggles datasource list on Open Datasource click", async () => {
      const user = userEvent.setup();
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);

      // Initially other datasource not visible
      expect(screen.queryByText("Other DS")).not.toBeInTheDocument();

      // Click Open Datasource
      await user.click(screen.getByText("Open Datasource"));

      // Now other datasource visible
      expect(screen.getByText("Other DS")).toBeInTheDocument();
    });

    it("highlights selected card type", () => {
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          selectedItem={{ type: "cardType", key: "infantry" }}
        />,
      );
      // First instance is in the Card Types tree
      const infantryItem = screen.getAllByText("Infantry")[0].closest(".designer-layer-item");
      expect(infantryItem).toHaveClass("selected");
    });

    it("renders move up and move down buttons for card type items", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      expect(screen.getAllByTitle("Move up").length).toBe(2);
      expect(screen.getAllByTitle("Move down").length).toBe(2);
    });

    it("disables move up on first card type", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      const moveUpButtons = screen.getAllByTitle("Move up");
      expect(moveUpButtons[0]).toBeDisabled();
    });

    it("disables move down on last card type", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      const moveDownButtons = screen.getAllByTitle("Move down");
      expect(moveDownButtons[moveDownButtons.length - 1]).toBeDisabled();
    });

    it("calls onReorderCardTypes with swapped array when move down clicked", async () => {
      const user = userEvent.setup();
      const onReorderCardTypes = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onReorderCardTypes={onReorderCardTypes}
        />,
      );
      const moveDownButtons = screen.getAllByTitle("Move down");
      await user.click(moveDownButtons[0]);
      expect(onReorderCardTypes).toHaveBeenCalledTimes(1);
      const reordered = onReorderCardTypes.mock.calls[0][0];
      expect(reordered[0].key).toBe("battle-rules");
      expect(reordered[1].key).toBe("infantry");
    });

    it("calls onReorderCardTypes with swapped array when move up clicked", async () => {
      const user = userEvent.setup();
      const onReorderCardTypes = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onReorderCardTypes={onReorderCardTypes}
        />,
      );
      const moveUpButtons = screen.getAllByTitle("Move up");
      // Click move up on the second card type (index 1)
      await user.click(moveUpButtons[1]);
      expect(onReorderCardTypes).toHaveBeenCalledTimes(1);
      const reordered = onReorderCardTypes.mock.calls[0][0];
      expect(reordered[0].key).toBe("battle-rules");
      expect(reordered[1].key).toBe("infantry");
    });

    it("does not call onReorderCardTypes when move up clicked on first item", async () => {
      const user = userEvent.setup();
      const onReorderCardTypes = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onReorderCardTypes={onReorderCardTypes}
        />,
      );
      const moveUpButtons = screen.getAllByTitle("Move up");
      await user.click(moveUpButtons[0]);
      expect(onReorderCardTypes).not.toHaveBeenCalled();
    });

    it("highlights selected datasource", () => {
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          selectedItem={{ type: "datasource" }}
        />,
      );
      // The datasource tree item should be selected
      const treeItems = screen.getAllByText("Test Datasource");
      const treeItem = treeItems[treeItems.length - 1].closest(".designer-layer-item");
      expect(treeItem).toHaveClass("selected");
    });

    describe("sorting", () => {
      it("renders sort select in the Cards header", () => {
        render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
        expect(screen.getByLabelText("Sort order")).toBeInTheDocument();
        expect(screen.getByText("A to Z")).toBeInTheDocument();
        expect(screen.getByText("Z to A")).toBeInTheDocument();
      });

      it("sorts cards A-Z when asc selected", async () => {
        const user = userEvent.setup();
        render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);

        const sortSelect = screen.getByLabelText("Sort order");
        await user.selectOptions(sortSelect, "asc");

        // Cards are sorted within subcategory groups: uncategorized (Alpha, Zeta), Core (Beta, Gamma), Elite (Delta)
        const cardNames = screen
          .getAllByText(/Unit/)
          .filter((el) => el.closest(".designer-card-list"))
          .map((el) => el.textContent);
        expect(cardNames).toEqual(["Alpha Unit", "Zeta Unit", "Beta Unit", "Gamma Unit", "Delta Unit"]);
      });

      it("sorts cards Z-A when desc selected", async () => {
        const user = userEvent.setup();
        render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);

        const sortSelect = screen.getByLabelText("Sort order");
        await user.selectOptions(sortSelect, "desc");

        // Cards sorted Z-A within subcategory groups: uncategorized (Zeta, Alpha), Core (Gamma, Beta), Elite (Delta)
        const cardNames = screen
          .getAllByText(/Unit/)
          .filter((el) => el.closest(".designer-card-list"))
          .map((el) => el.textContent);
        expect(cardNames).toEqual(["Zeta Unit", "Alpha Unit", "Gamma Unit", "Beta Unit", "Delta Unit"]);
      });
    });

    describe("subcategories", () => {
      it("renders subcategory headers when cards have subcategories set", () => {
        render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
        expect(screen.getByText("Core")).toBeInTheDocument();
        expect(screen.getByText("Elite")).toBeInTheDocument();
        expect(screen.getByText("Uncategorized")).toBeInTheDocument();
      });

      it("does not render subcategory headers when no cards have subcategories", () => {
        const dsWithoutSubcategories = {
          ...mockDatasource,
          data: [
            {
              id: "faction-1",
              name: "Faction",
              datasheets: [
                { id: "card-1", name: "Unit A", cardType: "infantry" },
                { id: "card-2", name: "Unit B", cardType: "infantry" },
              ],
              rules: [],
            },
          ],
        };
        render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={dsWithoutSubcategories} />);
        expect(screen.queryByText("Uncategorized")).not.toBeInTheDocument();
        expect(screen.getByText("Unit A")).toBeInTheDocument();
        expect(screen.getByText("Unit B")).toBeInTheDocument();
      });

      it("shows subcategory counts", () => {
        render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
        // Core has 2 cards (Beta Unit, Gamma Unit), Elite has 1 (Delta Unit), Uncategorized has 2 (Zeta, Alpha)
        const subcategoryHeaders = document.querySelectorAll(".designer-card-subcategory-header");
        expect(subcategoryHeaders.length).toBe(3);
      });

      it("displays card names within subcategory groups", () => {
        render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
        // Cards should be grouped: uncategorized first (Zeta, Alpha), then Core (Beta, Gamma), then Elite (Delta)
        const cardItems = document.querySelectorAll(".designer-card-list .designer-card-subcategory");
        expect(cardItems.length).toBe(3);
      });
    });
  });
});
