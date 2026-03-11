import { render, screen, fireEvent } from "@testing-library/react";
import { FieldsSchemaEditor } from "../FieldsSchemaEditor";

vi.mock("lucide-react", () => ({
  List: (props) => <svg data-testid="icon-list" {...props} />,
  BookOpen: (props) => <svg data-testid="icon-book-open" {...props} />,
  Tag: (props) => <svg data-testid="icon-tag" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
  ChevronUp: (props) => <svg data-testid="icon-chevron-up" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
}));

const ruleSchema = {
  fields: [
    { key: "name", label: "Name", type: "string", required: true },
    { key: "description", label: "Description", type: "richtext", required: false },
  ],
  rules: {
    label: "Rules",
    allowMultiple: true,
    fields: [
      { key: "title", label: "Title", type: "string", required: true },
      { key: "description", label: "Description", type: "richtext", required: true },
    ],
  },
};

const enhancementSchema = {
  fields: [
    { key: "name", label: "Name", type: "string", required: true },
    { key: "cost", label: "Cost", type: "string", required: true },
  ],
  keywords: {
    label: "Keywords",
    allowMultiple: true,
    fields: [{ key: "keyword", label: "Keyword", type: "string", required: true }],
  },
};

const stratagemSchema = {
  fields: [
    { key: "name", label: "Name", type: "string", required: true },
    { key: "cost", label: "Cost", type: "string", required: true },
    { key: "phase", label: "Phase", type: "enum", required: true, options: ["command", "movement", "shooting"] },
  ],
};

describe("FieldsSchemaEditor", () => {
  it("returns null when schema is null", () => {
    const { container } = render(<FieldsSchemaEditor schema={null} onChange={vi.fn()} baseType="rule" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders Fields section for all base types", () => {
    render(<FieldsSchemaEditor schema={stratagemSchema} onChange={vi.fn()} baseType="stratagem" />);
    expect(screen.getByText("Fields")).toBeInTheDocument();
  });

  it("renders top-level fields with key and label inputs", () => {
    render(<FieldsSchemaEditor schema={ruleSchema} onChange={vi.fn()} baseType="rule" />);
    expect(screen.getByDisplayValue("name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Name")).toBeInTheDocument();
  });

  describe("rule baseType", () => {
    it("renders Rules Collection section", () => {
      render(<FieldsSchemaEditor schema={ruleSchema} onChange={vi.fn()} baseType="rule" />);
      expect(screen.getByText("Rules Collection")).toBeInTheDocument();
    });

    it("does not render Keywords Collection section", () => {
      render(<FieldsSchemaEditor schema={ruleSchema} onChange={vi.fn()} baseType="rule" />);
      expect(screen.queryByText("Keywords Collection")).not.toBeInTheDocument();
    });

    it("renders allowMultiple checkbox for rules collection", () => {
      render(<FieldsSchemaEditor schema={ruleSchema} onChange={vi.fn()} baseType="rule" />);
      const checkboxes = screen.getAllByRole("checkbox");
      const allowMultipleCheckbox = checkboxes.find((cb) =>
        cb.closest("label")?.textContent?.includes("Allow multiple rules"),
      );
      expect(allowMultipleCheckbox).toBeTruthy();
      expect(allowMultipleCheckbox.checked).toBe(true);
    });

    it("toggles allowMultiple for rules collection", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={ruleSchema} onChange={onChange} baseType="rule" />);
      const checkboxes = screen.getAllByRole("checkbox");
      const allowMultipleCheckbox = checkboxes.find((cb) =>
        cb.closest("label")?.textContent?.includes("Allow multiple rules"),
      );
      fireEvent.click(allowMultipleCheckbox);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          rules: expect.objectContaining({ allowMultiple: false }),
        }),
      );
    });

    it("does not render rules section when schema has no rules property", () => {
      const schemaNoRules = { fields: ruleSchema.fields };
      render(<FieldsSchemaEditor schema={schemaNoRules} onChange={vi.fn()} baseType="rule" />);
      expect(screen.queryByText("Rules Collection")).not.toBeInTheDocument();
    });
  });

  describe("enhancement baseType", () => {
    it("renders Keywords Collection section", () => {
      render(<FieldsSchemaEditor schema={enhancementSchema} onChange={vi.fn()} baseType="enhancement" />);
      expect(screen.getByText("Keywords Collection")).toBeInTheDocument();
    });

    it("does not render Rules Collection section", () => {
      render(<FieldsSchemaEditor schema={enhancementSchema} onChange={vi.fn()} baseType="enhancement" />);
      expect(screen.queryByText("Rules Collection")).not.toBeInTheDocument();
    });

    it("renders allowMultiple checkbox for keywords collection", () => {
      render(<FieldsSchemaEditor schema={enhancementSchema} onChange={vi.fn()} baseType="enhancement" />);
      const checkboxes = screen.getAllByRole("checkbox");
      const allowMultipleCheckbox = checkboxes.find((cb) =>
        cb.closest("label")?.textContent?.includes("Allow multiple keywords"),
      );
      expect(allowMultipleCheckbox).toBeTruthy();
      expect(allowMultipleCheckbox.checked).toBe(true);
    });

    it("toggles allowMultiple for keywords collection", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={enhancementSchema} onChange={onChange} baseType="enhancement" />);
      const checkboxes = screen.getAllByRole("checkbox");
      const allowMultipleCheckbox = checkboxes.find((cb) =>
        cb.closest("label")?.textContent?.includes("Allow multiple keywords"),
      );
      fireEvent.click(allowMultipleCheckbox);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          keywords: expect.objectContaining({ allowMultiple: false }),
        }),
      );
    });
  });

  describe("stratagem baseType", () => {
    it("renders only Fields section", () => {
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={vi.fn()} baseType="stratagem" />);
      expect(screen.getByText("Fields")).toBeInTheDocument();
      expect(screen.queryByText("Rules Collection")).not.toBeInTheDocument();
      expect(screen.queryByText("Keywords Collection")).not.toBeInTheDocument();
    });
  });

  describe("field editing", () => {
    it("updates field key on change", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const keyInput = screen.getByDisplayValue("name");
      fireEvent.change(keyInput, { target: { value: "title" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([expect.objectContaining({ key: "title", label: "Name" })]),
        }),
      );
    });

    it("updates field label on change", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const labelInput = screen.getByDisplayValue("Name");
      fireEvent.change(labelInput, { target: { value: "Full Name" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([expect.objectContaining({ key: "name", label: "Full Name" })]),
        }),
      );
    });

    it("updates field type via select", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const typeSelects = screen.getAllByLabelText("Type");
      fireEvent.change(typeSelects[0], { target: { value: "boolean" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([expect.objectContaining({ key: "name", type: "boolean" })]),
        }),
      );
    });

    it("toggles required flag on checkbox change", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const requiredCheckboxes = screen.getAllByRole("checkbox");
      const firstRequired = requiredCheckboxes.find((cb) => cb.closest("label")?.textContent?.includes("Required"));
      fireEvent.click(firstRequired);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([expect.objectContaining({ key: "name", required: false })]),
        }),
      );
    });

    it("adds a new field", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const addButtons = screen.getAllByLabelText("Add field");
      fireEvent.click(addButtons[0]);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({ key: "name" }),
            expect.objectContaining({ key: "cost" }),
            expect.objectContaining({ key: "phase" }),
            expect.objectContaining({ key: "field_4", type: "string", required: false }),
          ]),
        }),
      );
    });

    it("removes a field", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const removeButtons = screen.getAllByTitle("Remove field");
      fireEvent.click(removeButtons[1]); // Remove cost
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: [expect.objectContaining({ key: "name" }), expect.objectContaining({ key: "phase" })],
        }),
      );
    });

    it("moves a field up", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const moveUpButtons = screen.getAllByTitle("Move up");
      fireEvent.click(moveUpButtons[1]); // Move cost up
      const call = onChange.mock.calls[0][0];
      expect(call.fields[0].key).toBe("cost");
      expect(call.fields[1].key).toBe("name");
    });

    it("moves a field down", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const moveDownButtons = screen.getAllByTitle("Move down");
      fireEvent.click(moveDownButtons[0]); // Move name down
      const call = onChange.mock.calls[0][0];
      expect(call.fields[0].key).toBe("cost");
      expect(call.fields[1].key).toBe("name");
    });

    it("disables move up for first field", () => {
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={vi.fn()} baseType="stratagem" />);
      const moveUpButtons = screen.getAllByTitle("Move up");
      expect(moveUpButtons[0]).toBeDisabled();
    });

    it("disables move down for last field", () => {
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={vi.fn()} baseType="stratagem" />);
      const moveDownButtons = screen.getAllByTitle("Move down");
      expect(moveDownButtons[moveDownButtons.length - 1]).toBeDisabled();
    });
  });

  describe("enum options", () => {
    it("renders options input for enum fields", () => {
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={vi.fn()} baseType="stratagem" />);
      expect(screen.getByDisplayValue("command, movement, shooting")).toBeInTheDocument();
    });

    it("updates enum options on change", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={stratagemSchema} onChange={onChange} baseType="stratagem" />);
      const optionsInput = screen.getByDisplayValue("command, movement, shooting");
      fireEvent.change(optionsInput, { target: { value: "command, fight" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([expect.objectContaining({ key: "phase", options: ["command", "fight"] })]),
        }),
      );
    });

    it("does not render options input for non-enum fields", () => {
      const schema = { fields: [{ key: "name", label: "Name", type: "string", required: true }] };
      render(<FieldsSchemaEditor schema={schema} onChange={vi.fn()} baseType="stratagem" />);
      expect(screen.queryByDisplayValue(/command/)).not.toBeInTheDocument();
    });
  });

  describe("collection field editing", () => {
    it("updates collection fields for rules", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={ruleSchema} onChange={onChange} baseType="rule" />);
      // Find the Title field in the rules collection and change its label
      const titleInputs = screen.getAllByDisplayValue("Title");
      fireEvent.change(titleInputs[0], { target: { value: "Rule Title" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          rules: expect.objectContaining({
            fields: expect.arrayContaining([expect.objectContaining({ key: "title", label: "Rule Title" })]),
          }),
        }),
      );
    });

    it("updates collection fields for keywords", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={enhancementSchema} onChange={onChange} baseType="enhancement" />);
      const keywordInput = screen.getByDisplayValue("Keyword");
      fireEvent.change(keywordInput, { target: { value: "Tag" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          keywords: expect.objectContaining({
            fields: expect.arrayContaining([expect.objectContaining({ key: "keyword", label: "Tag" })]),
          }),
        }),
      );
    });

    it("preserves other schema properties when updating fields", () => {
      const onChange = vi.fn();
      render(<FieldsSchemaEditor schema={ruleSchema} onChange={onChange} baseType="rule" />);
      const nameInput = screen.getByDisplayValue("name");
      fireEvent.change(nameInput, { target: { value: "title" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          rules: ruleSchema.rules,
        }),
      );
    });
  });
});
