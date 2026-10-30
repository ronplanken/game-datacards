import { render, screen, fireEvent } from "@testing-library/react";
import { CardTypeSettingsEditor } from "../CardTypeSettingsEditor";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Tag: (props) => <svg data-testid="icon-tag" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
}));

// Mock Premium
const mockPremiumFeatures = { hasCardDesigner: false };
vi.mock("../../../../Premium", () => ({
  usePremiumFeatures: () => mockPremiumFeatures,
  TemplateSelector: (props) => (
    <div data-testid="template-selector" data-value={props.value} data-format={props.targetFormat}>
      <button onClick={() => props.onChange("template-uuid-1")}>Select Template</button>
    </div>
  ),
}));

const mockCardType = {
  key: "infantry",
  label: "Infantry",
  baseType: "unit",
  schema: {},
};

const mockDatasource = {
  id: "ds-1",
  name: "Test DS",
  schema: { baseSystem: "40k-10e", cardTypes: [mockCardType] },
};

describe("CardTypeSettingsEditor", () => {
  it("returns null when cardType is null", () => {
    const { container } = render(
      <CardTypeSettingsEditor cardType={null} activeDatasource={mockDatasource} onUpdateCardType={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders section with Card Type title", () => {
    render(
      <CardTypeSettingsEditor cardType={mockCardType} activeDatasource={mockDatasource} onUpdateCardType={vi.fn()} />,
    );
    expect(screen.getByText("Card Type")).toBeInTheDocument();
  });

  it("shows name input with current label value", () => {
    render(
      <CardTypeSettingsEditor cardType={mockCardType} activeDatasource={mockDatasource} onUpdateCardType={vi.fn()} />,
    );
    expect(screen.getByLabelText("Card type name")).toHaveValue("Infantry");
  });

  it("shows base type as read-only metadata row", () => {
    render(
      <CardTypeSettingsEditor cardType={mockCardType} activeDatasource={mockDatasource} onUpdateCardType={vi.fn()} />,
    );
    expect(screen.getByText("Base Type")).toBeInTheDocument();
    expect(screen.getByText("Unit")).toBeInTheDocument();
  });

  it("updates label on input change", () => {
    const onUpdate = vi.fn();
    render(
      <CardTypeSettingsEditor cardType={mockCardType} activeDatasource={mockDatasource} onUpdateCardType={onUpdate} />,
    );
    const nameInput = screen.getByLabelText("Card type name");
    fireEvent.change(nameInput, { target: { value: "Heavy Infantry" } });
    expect(onUpdate).toHaveBeenCalledWith("label", "Heavy Infantry");
  });

  it("hides template selector when hasCardDesigner is false", () => {
    mockPremiumFeatures.hasCardDesigner = false;
    render(
      <CardTypeSettingsEditor cardType={mockCardType} activeDatasource={mockDatasource} onUpdateCardType={vi.fn()} />,
    );
    expect(screen.queryByTestId("template-selector")).not.toBeInTheDocument();
  });

  it("shows template selector and updates templateId when hasCardDesigner is true", () => {
    mockPremiumFeatures.hasCardDesigner = true;
    const onUpdate = vi.fn();
    render(
      <CardTypeSettingsEditor cardType={mockCardType} activeDatasource={mockDatasource} onUpdateCardType={onUpdate} />,
    );
    expect(screen.getByTestId("template-selector")).toBeInTheDocument();
    expect(screen.getByTestId("template-selector")).not.toHaveAttribute("data-format");

    fireEvent.click(screen.getByText("Select Template"));
    expect(onUpdate).toHaveBeenCalledWith("templateId", "template-uuid-1");
  });

  describe("auto-resize toggle", () => {
    const unitWithMetadata = { ...mockCardType, schema: { metadata: {} } };

    it("shows the auto-resize toggle for 40k-10e card types with metadata", () => {
      render(
        <CardTypeSettingsEditor
          cardType={unitWithMetadata}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={vi.fn()}
          baseSystem="40k-10e"
        />,
      );
      expect(screen.getByLabelText("Auto-resize")).toBeInTheDocument();
    });

    it("shows the auto-resize toggle for starcraft-tmg card types with metadata", () => {
      render(
        <CardTypeSettingsEditor
          cardType={unitWithMetadata}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={vi.fn()}
          baseSystem="starcraft-tmg"
        />,
      );
      expect(screen.getByLabelText("Auto-resize")).toBeInTheDocument();
    });

    it("hides the auto-resize toggle for unsupported base systems", () => {
      render(
        <CardTypeSettingsEditor
          cardType={unitWithMetadata}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={vi.fn()}
          baseSystem="aos"
        />,
      );
      expect(screen.queryByLabelText("Auto-resize")).not.toBeInTheDocument();
    });

    it("hides the auto-resize toggle when the schema has no metadata", () => {
      render(
        <CardTypeSettingsEditor
          cardType={mockCardType}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={vi.fn()}
          baseSystem="40k-10e"
        />,
      );
      expect(screen.queryByLabelText("Auto-resize")).not.toBeInTheDocument();
    });

    it("updates schema.metadata.hasAutoResize on toggle", () => {
      const onUpdateSchema = vi.fn();
      render(
        <CardTypeSettingsEditor
          cardType={unitWithMetadata}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={onUpdateSchema}
          baseSystem="40k-10e"
        />,
      );
      fireEvent.click(screen.getByLabelText("Auto-resize"));
      expect(onUpdateSchema).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: expect.objectContaining({ hasAutoResize: true }) }),
      );
    });
  });

  describe("subcategory toggle", () => {
    const unitWithMetadata = { ...mockCardType, schema: { metadata: {} } };

    it("shows the subcategory toggle for card types with metadata, regardless of base system", () => {
      render(
        <CardTypeSettingsEditor
          cardType={unitWithMetadata}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={vi.fn()}
          baseSystem="aos"
        />,
      );
      expect(screen.getByLabelText("Subcategory")).toBeInTheDocument();
    });

    it("hides the subcategory toggle when the schema has no metadata", () => {
      render(
        <CardTypeSettingsEditor
          cardType={mockCardType}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={vi.fn()}
          baseSystem="40k-10e"
        />,
      );
      expect(screen.queryByLabelText("Subcategory")).not.toBeInTheDocument();
    });

    it("updates schema.metadata.hasSubcategory on toggle", () => {
      const onUpdateSchema = vi.fn();
      render(
        <CardTypeSettingsEditor
          cardType={unitWithMetadata}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={onUpdateSchema}
          baseSystem="40k-10e"
        />,
      );
      fireEvent.click(screen.getByLabelText("Subcategory"));
      expect(onUpdateSchema).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: expect.objectContaining({ hasSubcategory: true }) }),
      );
    });
  });

  afterEach(() => {
    mockPremiumFeatures.hasCardDesigner = false;
  });

  describe("Back side", () => {
    const makeCardType = (overrides = {}) => ({
      ...mockCardType,
      schema: {
        metadata: {},
        sections: {
          label: "Sections",
          sections: [
            { key: "wargear-options", label: "Wargear Options", format: "list" },
            { key: "special", label: "Special Rules", format: "list", side: "back" },
            { key: "loadout", label: "Loadout", format: "richtext", side: "front" },
          ],
        },
      },
      ...overrides,
    });

    const renderEditor = (props) =>
      render(
        <CardTypeSettingsEditor
          cardType={makeCardType()}
          activeDatasource={mockDatasource}
          onUpdateCardType={vi.fn()}
          onUpdateSchema={vi.fn()}
          baseSystem="40k-11e"
          {...props}
        />,
      );

    it("is off by default on both 40K editions", () => {
      ["40k-10e", "40k-11e"].forEach((baseSystem) => {
        const { unmount } = renderEditor({ baseSystem });
        expect(screen.getByLabelText("Back side")).not.toBeChecked();
        unmount();
      });
    });

    it("is hidden on other base systems and card types", () => {
      const { unmount } = renderEditor({ baseSystem: "aos" });
      expect(screen.queryByLabelText("Back side")).toBeNull();
      unmount();
      renderEditor({ cardType: makeCardType({ baseType: "stratagem" }) });
      expect(screen.queryByLabelText("Back side")).toBeNull();
    });

    it("applies the default split without touching explicit choices", () => {
      const onUpdateSchema = vi.fn();
      renderEditor({ onUpdateSchema });
      fireEvent.click(screen.getByLabelText("Back side"));

      const updated = onUpdateSchema.mock.calls[0][0];
      expect(updated.metadata.hasBackSide).toBe(true);
      expect(updated.sections.sections.map((s) => s.side)).toEqual(["back", "back", "front"]);
    });

    it("keeps stored sides when turned off", () => {
      const onUpdateSchema = vi.fn();
      const cardType = makeCardType();
      cardType.schema.metadata.hasBackSide = true;
      renderEditor({ onUpdateSchema, cardType });
      fireEvent.click(screen.getByLabelText("Back side"));

      const updated = onUpdateSchema.mock.calls[0][0];
      expect(updated.metadata.hasBackSide).toBe(false);
      expect(updated.sections).toBe(cardType.schema.sections);
    });
  });
});
