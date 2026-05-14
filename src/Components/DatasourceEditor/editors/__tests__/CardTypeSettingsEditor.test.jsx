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

  afterEach(() => {
    mockPremiumFeatures.hasCardDesigner = false;
  });
});
