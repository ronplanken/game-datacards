import { render, screen, fireEvent } from "@testing-library/react";
import { DatasourceMetadataEditor } from "../DatasourceMetadataEditor";

vi.mock("lucide-react", () => ({
  Database: (props) => <svg data-testid="icon-database" {...props} />,
  Info: (props) => <svg data-testid="icon-info" {...props} />,
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
    expect(onUpdate).toHaveBeenCalledWith({ ...mockDatasource, name: "New Name" });
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
    expect(screen.getByText("System")).toBeInTheDocument();
  });
});
