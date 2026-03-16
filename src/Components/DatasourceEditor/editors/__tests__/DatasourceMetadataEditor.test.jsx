import { render, screen, fireEvent } from "@testing-library/react";
import { DatasourceMetadataEditor } from "../DatasourceMetadataEditor";

vi.mock("lucide-react", () => ({
  Database: (props) => <svg data-testid="icon-database" {...props} />,
  Info: (props) => <svg data-testid="icon-info" {...props} />,
  Palette: (props) => <svg data-testid="icon-palette" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
}));

const mockDatasource = {
  id: "ds-1",
  name: "Test Datasource",
  version: "1.0.0",
  author: "Test Author",
  schema: {
    baseSystem: "40k-10e",
    cardTypes: [],
  },
};

describe("DatasourceMetadataEditor", () => {
  it("returns null when datasource is null", () => {
    const { container } = render(<DatasourceMetadataEditor datasource={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders editable name input with current value", () => {
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={vi.fn()} />);
    const nameInput = screen.getByLabelText("Name");
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe("Test Datasource");
  });

  it("renders editable version input with current value", () => {
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={vi.fn()} />);
    const versionInput = screen.getByLabelText("Version");
    expect(versionInput).toBeInTheDocument();
    expect(versionInput.value).toBe("1.0.0");
  });

  it("renders editable author input with current value", () => {
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={vi.fn()} />);
    const authorInput = screen.getByLabelText("Author");
    expect(authorInput).toBeInTheDocument();
    expect(authorInput.value).toBe("Test Author");
  });

  it("displays base system as read-only label for 40k-10e", () => {
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={vi.fn()} />);
    expect(screen.getByText("Warhammer 40K 10th Edition")).toBeInTheDocument();
    expect(screen.getByText("Base System")).toBeInTheDocument();
  });

  it("displays base system label for aos", () => {
    const aosDatasource = { ...mockDatasource, schema: { ...mockDatasource.schema, baseSystem: "aos" } };
    render(<DatasourceMetadataEditor datasource={aosDatasource} onUpdateDatasource={vi.fn()} />);
    expect(screen.getByText("Age of Sigmar")).toBeInTheDocument();
  });

  it("displays base system label for blank", () => {
    const blankDatasource = { ...mockDatasource, schema: { ...mockDatasource.schema, baseSystem: "blank" } };
    render(<DatasourceMetadataEditor datasource={blankDatasource} onUpdateDatasource={vi.fn()} />);
    expect(screen.getByText("Blank / Custom")).toBeInTheDocument();
  });

  it("calls onUpdateDatasource with updated name on change", () => {
    const onUpdate = vi.fn();
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={onUpdate} />);
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: "New Name" }));
  });

  it("propagates name change to all factions in data array", () => {
    const onUpdate = vi.fn();
    const dsWithFactions = {
      ...mockDatasource,
      data: [
        { id: "f1", name: "Old Name", colours: {} },
        { id: "f2", name: "Old Name", colours: {} },
      ],
    };
    render(<DatasourceMetadataEditor datasource={dsWithFactions} onUpdateDatasource={onUpdate} />);
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Name",
        data: [
          expect.objectContaining({ id: "f1", name: "New Name" }),
          expect.objectContaining({ id: "f2", name: "New Name" }),
        ],
      }),
    );
  });

  it("calls onUpdateDatasource with updated version on change", () => {
    const onUpdate = vi.fn();
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={onUpdate} />);
    const versionInput = screen.getByLabelText("Version");
    fireEvent.change(versionInput, { target: { value: "2.0.0" } });
    expect(onUpdate).toHaveBeenCalledWith({ ...mockDatasource, version: "2.0.0" });
  });

  it("calls onUpdateDatasource with updated author on change", () => {
    const onUpdate = vi.fn();
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={onUpdate} />);
    const authorInput = screen.getByLabelText("Author");
    fireEvent.change(authorInput, { target: { value: "New Author" } });
    expect(onUpdate).toHaveBeenCalledWith({ ...mockDatasource, author: "New Author" });
  });

  it("does not crash when onUpdateDatasource is not provided", () => {
    render(<DatasourceMetadataEditor datasource={mockDatasource} />);
    const nameInput = screen.getByLabelText("Name");
    expect(() => fireEvent.change(nameInput, { target: { value: "Test" } })).not.toThrow();
  });

  it("handles empty author gracefully", () => {
    const dsNoAuthor = { ...mockDatasource, author: "" };
    render(<DatasourceMetadataEditor datasource={dsNoAuthor} onUpdateDatasource={vi.fn()} />);
    const authorInput = screen.getByLabelText("Author");
    expect(authorInput.value).toBe("");
  });

  it("renders section headers", () => {
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={vi.fn()} />);
    expect(screen.getByText("Datasource Info")).toBeInTheDocument();
    expect(screen.getByText("Colours")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("renders Main and Accent colour inputs", () => {
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={vi.fn()} />);
    expect(screen.getByLabelText("Main colour")).toBeInTheDocument();
    expect(screen.getByLabelText("Accent colour")).toBeInTheDocument();
  });

  it("shows default colours when schema has no colours", () => {
    render(<DatasourceMetadataEditor datasource={mockDatasource} onUpdateDatasource={vi.fn()} />);
    expect(screen.getAllByDisplayValue("#1a1a2e").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByDisplayValue("#16213e").length).toBeGreaterThanOrEqual(1);
  });

  it("shows existing schema colours", () => {
    const dsWithColours = {
      ...mockDatasource,
      schema: { ...mockDatasource.schema, colours: { header: "#ff0000", banner: "#00ff00" } },
    };
    render(<DatasourceMetadataEditor datasource={dsWithColours} onUpdateDatasource={vi.fn()} />);
    expect(screen.getAllByDisplayValue("#ff0000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByDisplayValue("#00ff00").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onUpdateDatasource with updated schema colours and faction colours on colour change", () => {
    const onUpdate = vi.fn();
    const dsWithData = {
      ...mockDatasource,
      data: [{ id: "f1", name: "Faction 1", colours: { header: "#1a1a2e", banner: "#16213e" } }],
    };
    render(<DatasourceMetadataEditor datasource={dsWithData} onUpdateDatasource={onUpdate} />);
    const mainColourInput = screen.getByLabelText("Main colour");
    fireEvent.change(mainColourInput, { target: { value: "#abcdef" } });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        schema: expect.objectContaining({
          colours: expect.objectContaining({ header: "#abcdef" }),
        }),
        data: [
          expect.objectContaining({
            colours: expect.objectContaining({ header: "#abcdef" }),
          }),
        ],
      }),
    );
  });
});
