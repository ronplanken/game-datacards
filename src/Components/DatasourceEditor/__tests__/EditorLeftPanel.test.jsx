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
};

const mockDatasources = [mockDatasource, { id: "ds-2", name: "Other DS", version: "2.0.0", schema: { cardTypes: [] } }];

describe("EditorLeftPanel", () => {
  describe("empty state", () => {
    it("renders empty state when no datasources and no active datasource", () => {
      render(<EditorLeftPanel datasources={[]} />);
      expect(screen.getByText("No custom datasources yet")).toBeInTheDocument();
    });

    it("renders New Datasource CTA button in empty state", () => {
      const onNewDatasource = vi.fn();
      render(<EditorLeftPanel datasources={[]} onNewDatasource={onNewDatasource} />);
      const btn = screen.getByText("New Datasource");
      expect(btn).toBeInTheDocument();
    });

    it("calls onNewDatasource when CTA button clicked", async () => {
      const user = userEvent.setup();
      const onNewDatasource = vi.fn();
      render(<EditorLeftPanel datasources={[]} onNewDatasource={onNewDatasource} />);
      await user.click(screen.getByText("New Datasource"));
      expect(onNewDatasource).toHaveBeenCalledTimes(1);
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
      expect(screen.getByText("Add Card Type")).toBeInTheDocument();
    });

    it("renders Export button when datasource is active", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      expect(screen.getByTitle("Export schema")).toBeInTheDocument();
    });

    it("renders Import button when datasource is active", () => {
      render(<EditorLeftPanel datasources={mockDatasources} activeDatasource={mockDatasource} />);
      expect(screen.getByTitle("Import schema")).toBeInTheDocument();
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
      await user.click(screen.getByText("Add Card Type"));
      expect(onAddCardType).toHaveBeenCalledTimes(1);
    });

    it("calls onExportDatasource when Export button clicked", async () => {
      const user = userEvent.setup();
      const onExportDatasource = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onExportDatasource={onExportDatasource}
        />,
      );
      await user.click(screen.getByTitle("Export schema"));
      expect(onExportDatasource).toHaveBeenCalledWith(mockDatasource);
    });

    it("calls onImportSchema when Import button clicked", async () => {
      const user = userEvent.setup();
      const onImportSchema = vi.fn();
      render(
        <EditorLeftPanel
          datasources={mockDatasources}
          activeDatasource={mockDatasource}
          onImportSchema={onImportSchema}
        />,
      );
      await user.click(screen.getByTitle("Import schema"));
      expect(onImportSchema).toHaveBeenCalledTimes(1);
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
  });
});
