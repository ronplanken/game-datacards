import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepRules } from "../steps/StepRules";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

const DEFAULT_RULES = {
  label: "Rules",
  allowMultiple: true,
  fields: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "description", label: "Description", type: "richtext", required: true },
    { key: "format", label: "Format", type: "enum", options: ["name-description", "name-only", "table"] },
  ],
};

describe("StepRules", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepRules wizard={wizard} />);

    expect(screen.getByText("Rules Collection")).toBeInTheDocument();
    expect(screen.getByText(/Define the fields that each rule/)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-rules")).toBeInTheDocument();
  });

  it("renders collection label input with default value", () => {
    const wizard = createMockWizard();
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-rules-label")).toHaveValue("Rules");
  });

  it("renders collection label from step data", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-rules-label")).toHaveValue("Rules");
  });

  it("updates collection label when input changes", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-rules-label"), {
      target: { value: "Sub-Rules" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("rules", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.label).toBe("Sub-Rules");
  });

  it("renders allowMultiple toggle checked by default", () => {
    const wizard = createMockWizard();
    render(<StepRules wizard={wizard} />);

    const checkbox = screen.getByTestId("dsw-rules-allow-multiple").querySelector("input[type='checkbox']");
    expect(checkbox.checked).toBe(true);
  });

  it("toggles allowMultiple when checkbox is clicked", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    const checkbox = screen.getByTestId("dsw-rules-allow-multiple").querySelector("input[type='checkbox']");
    fireEvent.click(checkbox);

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.allowMultiple).toBe(false);
  });

  it("shows empty state when no fields exist", () => {
    const wizard = createMockWizard();
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-rules-fields-empty")).toBeInTheDocument();
    expect(screen.getByText(/No rule fields defined yet/)).toBeInTheDocument();
  });

  it("renders existing fields from step data", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-rules-field-0")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-rules-field-1")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-rules-field-2")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-rules-field-key-0")).toHaveValue("title");
    expect(screen.getByTestId("dsw-rules-field-label-0")).toHaveValue("Title");
  });

  it("shows field count in the header", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    expect(screen.getByText("Rule Fields (3)")).toBeInTheDocument();
  });

  it("adds a new field when add button is clicked", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-rules-fields-add"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("rules", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });

    expect(result.rules.fields).toHaveLength(4);
    expect(result.rules.fields[3].key).toBe("field4");
    expect(result.rules.fields[3].type).toBe("string");
    expect(result.rules.fields[3].required).toBe(false);
  });

  it("removes a field when remove button is clicked", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-rules-field-remove-1"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });

    expect(result.rules.fields).toHaveLength(2);
    expect(result.rules.fields[0].key).toBe("title");
    expect(result.rules.fields[1].key).toBe("format");
  });

  it("updates field key when key input changes", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-rules-field-key-0"), {
      target: { value: "heading" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[0].key).toBe("heading");
  });

  it("updates field label when label input changes", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-rules-field-label-0"), {
      target: { value: "Heading" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[0].label).toBe("Heading");
  });

  it("renders type dropdown with correct options", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    const typeSelect = screen.getByTestId("dsw-rules-field-type-0");
    expect(typeSelect).toHaveValue("string");

    const options = typeSelect.querySelectorAll("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue("string");
    expect(options[1]).toHaveValue("richtext");
    expect(options[2]).toHaveValue("enum");
    expect(options[3]).toHaveValue("boolean");
  });

  it("changes field type when type dropdown changes", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-rules-field-type-0"), {
      target: { value: "boolean" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[0].type).toBe("boolean");
  });

  it("adds empty options array when changing type to enum", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-rules-field-type-0"), {
      target: { value: "enum" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[0].type).toBe("enum");
    expect(result.rules.fields[0].options).toEqual([]);
  });

  it("removes options when changing type away from enum", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    // Field at index 2 is the enum "format" field
    fireEvent.change(screen.getByTestId("dsw-rules-field-type-2"), {
      target: { value: "string" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[2].type).toBe("string");
    expect(result.rules.fields[2].options).toBeUndefined();
  });

  it("shows enum options editor when field type is enum", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    // Field at index 2 is the enum "format" field
    expect(screen.getByTestId("dsw-rules-field-enum-options-2")).toBeInTheDocument();
    expect(screen.getByText("Choice Options (3)")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-rules-field-enum-value-2-0")).toHaveValue("name-description");
    expect(screen.getByTestId("dsw-rules-field-enum-value-2-1")).toHaveValue("name-only");
    expect(screen.getByTestId("dsw-rules-field-enum-value-2-2")).toHaveValue("table");
  });

  it("does not show enum options editor for non-enum fields", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    expect(screen.queryByTestId("dsw-rules-field-enum-options-0")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dsw-rules-field-enum-options-1")).not.toBeInTheDocument();
  });

  it("adds an enum option when add option button is clicked", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-rules-field-enum-add-2"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[2].options).toEqual(["name-description", "name-only", "table", ""]);
  });

  it("updates an enum option value", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-rules-field-enum-value-2-0"), {
      target: { value: "full-description" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[2].options[0]).toBe("full-description");
  });

  it("removes an enum option when remove button is clicked", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-rules-field-enum-remove-2-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[2].options).toEqual(["name-only", "table"]);
  });

  it("shows enum empty state when no options defined", () => {
    const rulesWithEmptyEnum = {
      ...DEFAULT_RULES,
      fields: [{ key: "format", label: "Format", type: "enum", options: [] }],
    };
    const wizard = createMockWizard({ rules: { rules: rulesWithEmptyEnum } });
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-rules-field-enum-empty-0")).toBeInTheDocument();
    expect(screen.getByText(/No options defined/)).toBeInTheDocument();
  });

  it("toggles required flag when checkbox is clicked", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    const requiredCheckbox = screen.getByTestId("dsw-rules-field-required-0").querySelector("input[type='checkbox']");
    fireEvent.click(requiredCheckbox);

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });
    expect(result.rules.fields[0].required).toBe(false);
  });

  it("moves a field up when move up button is clicked", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-rules-field-move-up-1"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });

    expect(result.rules.fields[0].key).toBe("description");
    expect(result.rules.fields[1].key).toBe("title");
  });

  it("moves a field down when move down button is clicked", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-rules-field-move-down-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });

    expect(result.rules.fields[0].key).toBe("description");
    expect(result.rules.fields[1].key).toBe("title");
  });

  it("disables move up button for the first field", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-rules-field-move-up-0")).toBeDisabled();
  });

  it("disables move down button for the last field", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-rules-field-move-down-2")).toBeDisabled();
  });

  it("shows key conflict warning when duplicate keys exist", () => {
    const rulesWithDuplicates = {
      ...DEFAULT_RULES,
      fields: [
        { key: "title", label: "Title", type: "string", required: true },
        { key: "title", label: "Other Title", type: "string", required: false },
      ],
    };
    const wizard = createMockWizard({ rules: { rules: rulesWithDuplicates } });
    render(<StepRules wizard={wizard} />);

    expect(screen.getByTestId("dsw-rules-fields-key-conflict")).toBeInTheDocument();
    expect(screen.getByText(/Duplicate keys detected/)).toBeInTheDocument();
  });

  it("does not show key conflict warning when all keys are unique", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    expect(screen.queryByTestId("dsw-rules-fields-key-conflict")).not.toBeInTheDocument();
  });

  it("generates unique keys when adding fields", () => {
    const rulesWithField4 = {
      ...DEFAULT_RULES,
      fields: [...DEFAULT_RULES.fields, { key: "field4", label: "Field 4", type: "string", required: false }],
    };
    const wizard = createMockWizard({ rules: { rules: rulesWithField4 } });
    render(<StepRules wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-rules-fields-add"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: rulesWithField4 });

    expect(result.rules.fields[4].key).toBe("field5");
  });

  it("renders aria labels on action buttons", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    expect(screen.getByLabelText("Move Title up")).toBeInTheDocument();
    expect(screen.getByLabelText("Move Title down")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Title")).toBeInTheDocument();
  });

  it("preserves other rules properties when updating fields", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-rules-fields-add"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });

    expect(result.rules.label).toBe("Rules");
    expect(result.rules.allowMultiple).toBe(true);
  });

  it("preserves fields when toggling allowMultiple", () => {
    const wizard = createMockWizard({ rules: { rules: DEFAULT_RULES } });
    render(<StepRules wizard={wizard} />);

    const checkbox = screen.getByTestId("dsw-rules-allow-multiple").querySelector("input[type='checkbox']");
    fireEvent.click(checkbox);

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ rules: DEFAULT_RULES });

    expect(result.rules.fields).toHaveLength(3);
    expect(result.rules.allowMultiple).toBe(false);
  });
});
