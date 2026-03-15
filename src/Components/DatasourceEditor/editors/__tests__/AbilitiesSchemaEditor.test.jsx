import { render, screen, fireEvent } from "@testing-library/react";
import { AbilitiesSchemaEditor } from "../AbilitiesSchemaEditor";

vi.mock("lucide-react", () => ({
  Sparkles: (props) => <svg data-testid="icon-sparkles" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
  ChevronUp: (props) => <svg data-testid="icon-chevron-up" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
}));

const mockSchema = {
  abilities: {
    label: "Abilities",
    categories: [
      { key: "core", label: "Core", format: "name-only" },
      { key: "faction", label: "Faction", format: "name-description" },
      { key: "unit", label: "Unit Abilities", format: "name-description" },
    ],
  },
};

describe("AbilitiesSchemaEditor", () => {
  it("returns null when schema has no abilities", () => {
    const { container } = render(<AbilitiesSchemaEditor schema={{}} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when schema is null", () => {
    const { container } = render(<AbilitiesSchemaEditor schema={null} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders section with Abilities title", () => {
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByText("Abilities")).toBeInTheDocument();
  });

  it("renders all category labels", () => {
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("Core")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Faction")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Unit Abilities")).toBeInTheDocument();
  });

  it("renders category key inputs", () => {
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("core")).toBeInTheDocument();
    expect(screen.getByDisplayValue("faction")).toBeInTheDocument();
    expect(screen.getByDisplayValue("unit")).toBeInTheDocument();
  });

  it("renders format dropdowns with correct values", () => {
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const formatSelects = screen.getAllByLabelText("Format");
    expect(formatSelects[0].value).toBe("name-only");
    expect(formatSelects[1].value).toBe("name-description");
    expect(formatSelects[2].value).toBe("name-description");
  });

  it("updates category label on change", () => {
    const onChange = vi.fn();
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue("Core"), { target: { value: "Core Abilities" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({
          categories: expect.arrayContaining([expect.objectContaining({ key: "core", label: "Core Abilities" })]),
        }),
      }),
    );
  });

  it("updates category key on change", () => {
    const onChange = vi.fn();
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue("core"), { target: { value: "core_abilities" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({
          categories: expect.arrayContaining([expect.objectContaining({ key: "core_abilities", label: "Core" })]),
        }),
      }),
    );
  });

  it("updates category format via select", () => {
    const onChange = vi.fn();
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={onChange} />);
    const formatSelects = screen.getAllByLabelText("Format");
    fireEvent.change(formatSelects[0], { target: { value: "name-description" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({
          categories: expect.arrayContaining([expect.objectContaining({ key: "core", format: "name-description" })]),
        }),
      }),
    );
  });

  it("adds a new category when Add Category is clicked", () => {
    const onChange = vi.fn();
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add category"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({
          categories: expect.arrayContaining([
            expect.objectContaining({ key: "core" }),
            expect.objectContaining({ key: "faction" }),
            expect.objectContaining({ key: "unit" }),
            expect.objectContaining({ key: "category_4", label: "Category 4", format: "name-description" }),
          ]),
        }),
      }),
    );
  });

  it("adds first category with number 1 when categories are empty", () => {
    const onChange = vi.fn();
    const emptySchema = {
      abilities: { label: "Abilities", categories: [] },
    };
    render(<AbilitiesSchemaEditor schema={emptySchema} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add category"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({
          categories: [expect.objectContaining({ key: "category_1", label: "Category 1" })],
        }),
      }),
    );
  });

  it("removes a category when remove button is clicked", () => {
    const onChange = vi.fn();
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={onChange} />);
    const removeButtons = screen.getAllByTitle("Remove category");
    fireEvent.click(removeButtons[1]); // Remove Faction
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        abilities: expect.objectContaining({
          categories: [expect.objectContaining({ key: "core" }), expect.objectContaining({ key: "unit" })],
        }),
      }),
    );
  });

  it("moves a category up", () => {
    const onChange = vi.fn();
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={onChange} />);
    const moveUpButtons = screen.getAllByTitle("Move up");
    fireEvent.click(moveUpButtons[1]); // Move Faction up
    const call = onChange.mock.calls[0][0];
    expect(call.abilities.categories[0].key).toBe("faction");
    expect(call.abilities.categories[1].key).toBe("core");
  });

  it("moves a category down", () => {
    const onChange = vi.fn();
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={onChange} />);
    const moveDownButtons = screen.getAllByTitle("Move down");
    fireEvent.click(moveDownButtons[0]); // Move Core down
    const call = onChange.mock.calls[0][0];
    expect(call.abilities.categories[0].key).toBe("faction");
    expect(call.abilities.categories[1].key).toBe("core");
  });

  it("disables move up for first category", () => {
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const moveUpButtons = screen.getAllByTitle("Move up");
    expect(moveUpButtons[0]).toBeDisabled();
  });

  it("disables move down for last category", () => {
    render(<AbilitiesSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const moveDownButtons = screen.getAllByTitle("Move down");
    expect(moveDownButtons[moveDownButtons.length - 1]).toBeDisabled();
  });

  it("preserves other schema properties when updating abilities", () => {
    const onChange = vi.fn();
    const schemaWithExtra = { ...mockSchema, stats: { fields: [] } };
    render(<AbilitiesSchemaEditor schema={schemaWithExtra} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add category"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: { fields: [] },
      }),
    );
  });
});
