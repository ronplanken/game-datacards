import { render, screen, fireEvent } from "@testing-library/react";
import { StatsSchemaEditor } from "../StatsSchemaEditor";

vi.mock("lucide-react", () => ({
  BarChart3: (props) => <svg data-testid="icon-bar-chart" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
  ChevronUp: (props) => <svg data-testid="icon-chevron-up" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
}));

const mockSchema = {
  stats: {
    label: "Stat Profiles",
    allowMultipleProfiles: true,
    fields: [
      { key: "m", label: "M", type: "string", displayOrder: 1 },
      { key: "t", label: "T", type: "string", displayOrder: 2 },
      { key: "sv", label: "SV", type: "string", displayOrder: 3 },
    ],
  },
};

describe("StatsSchemaEditor", () => {
  it("returns null when schema has no stats", () => {
    const { container } = render(<StatsSchemaEditor schema={{}} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when schema is null", () => {
    const { container } = render(<StatsSchemaEditor schema={null} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders section with Stats title", () => {
    render(<StatsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByText("Stats")).toBeInTheDocument();
  });

  it("renders allowMultipleProfiles checkbox checked when true", () => {
    render(<StatsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // First checkbox is allowMultipleProfiles
    expect(checkboxes[0].checked).toBe(true);
  });

  it("renders allowMultipleProfiles checkbox unchecked when false", () => {
    const schema = { stats: { ...mockSchema.stats, allowMultipleProfiles: false } };
    render(<StatsSchemaEditor schema={schema} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0].checked).toBe(false);
  });

  it("toggles allowMultipleProfiles on checkbox change", () => {
    const onChange = vi.fn();
    render(<StatsSchemaEditor schema={mockSchema} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: expect.objectContaining({ allowMultipleProfiles: false }),
      }),
    );
  });

  it("renders all stat fields", () => {
    render(<StatsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("M")).toBeInTheDocument();
    expect(screen.getByDisplayValue("T")).toBeInTheDocument();
    expect(screen.getByDisplayValue("SV")).toBeInTheDocument();
  });

  it("renders key inputs for each field", () => {
    render(<StatsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("m")).toBeInTheDocument();
    expect(screen.getByDisplayValue("t")).toBeInTheDocument();
    expect(screen.getByDisplayValue("sv")).toBeInTheDocument();
  });

  it("updates field label on change", () => {
    const onChange = vi.fn();
    render(<StatsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const labelInput = screen.getByDisplayValue("M");
    fireEvent.change(labelInput, { target: { value: "Move" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: expect.objectContaining({
          fields: expect.arrayContaining([expect.objectContaining({ key: "m", label: "Move" })]),
        }),
      }),
    );
  });

  it("updates field key on change", () => {
    const onChange = vi.fn();
    render(<StatsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const keyInput = screen.getByDisplayValue("m");
    fireEvent.change(keyInput, { target: { value: "move" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: expect.objectContaining({
          fields: expect.arrayContaining([expect.objectContaining({ key: "move", label: "M" })]),
        }),
      }),
    );
  });

  it("updates field type via select", () => {
    const onChange = vi.fn();
    render(<StatsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const typeSelects = screen.getAllByLabelText("Type");
    fireEvent.change(typeSelects[0], { target: { value: "boolean" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: expect.objectContaining({
          fields: expect.arrayContaining([expect.objectContaining({ key: "m", type: "boolean" })]),
        }),
      }),
    );
  });

  it("adds a new field when Add Field is clicked", () => {
    const onChange = vi.fn();
    render(<StatsSchemaEditor schema={mockSchema} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add stat"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({ key: "m" }),
            expect.objectContaining({ key: "t" }),
            expect.objectContaining({ key: "sv" }),
            expect.objectContaining({ key: "stat_4", displayOrder: 4 }),
          ]),
        }),
      }),
    );
  });

  it("adds first field with displayOrder 1 when fields are empty", () => {
    const onChange = vi.fn();
    const emptySchema = { stats: { label: "Stats", allowMultipleProfiles: false, fields: [] } };
    render(<StatsSchemaEditor schema={emptySchema} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add stat"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: expect.objectContaining({
          fields: [expect.objectContaining({ key: "stat_1", displayOrder: 1 })],
        }),
      }),
    );
  });

  it("removes a field when remove button is clicked", () => {
    const onChange = vi.fn();
    render(<StatsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const removeButtons = screen.getAllByTitle("Remove field");
    fireEvent.click(removeButtons[1]); // Remove T field
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: expect.objectContaining({
          fields: [expect.objectContaining({ key: "m" }), expect.objectContaining({ key: "sv" })],
        }),
      }),
    );
  });

  it("moves a field up", () => {
    const onChange = vi.fn();
    render(<StatsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const moveUpButtons = screen.getAllByTitle("Move up");
    fireEvent.click(moveUpButtons[1]); // Move T up
    const call = onChange.mock.calls[0][0];
    expect(call.stats.fields[0].key).toBe("t");
    expect(call.stats.fields[1].key).toBe("m");
    expect(call.stats.fields[0].displayOrder).toBe(1);
    expect(call.stats.fields[1].displayOrder).toBe(2);
  });

  it("moves a field down", () => {
    const onChange = vi.fn();
    render(<StatsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const moveDownButtons = screen.getAllByTitle("Move down");
    fireEvent.click(moveDownButtons[0]); // Move M down
    const call = onChange.mock.calls[0][0];
    expect(call.stats.fields[0].key).toBe("t");
    expect(call.stats.fields[1].key).toBe("m");
  });

  it("disables move up for first field", () => {
    render(<StatsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const moveUpButtons = screen.getAllByTitle("Move up");
    expect(moveUpButtons[0]).toBeDisabled();
  });

  it("disables move down for last field", () => {
    render(<StatsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const moveDownButtons = screen.getAllByTitle("Move down");
    expect(moveDownButtons[moveDownButtons.length - 1]).toBeDisabled();
  });

  it("renders type selects with string as default option", () => {
    render(<StatsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const typeSelects = screen.getAllByLabelText("Type");
    expect(typeSelects[0].value).toBe("string");
  });

  it("preserves other schema properties when updating stats", () => {
    const onChange = vi.fn();
    const schemaWithExtra = { ...mockSchema, weaponTypes: { types: [] } };
    render(<StatsSchemaEditor schema={schemaWithExtra} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: { types: [] },
      }),
    );
  });
});
