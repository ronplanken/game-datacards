import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepFields } from "../steps/StepFields";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

const DEFAULT_FIELDS = [
  { key: "name", label: "Name", type: "string", required: true },
  { key: "cost", label: "Cost", type: "string", required: true },
  { key: "description", label: "Description", type: "richtext", required: false },
];

describe("StepFields", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepFields wizard={wizard} />);

    expect(screen.getByText("Fields")).toBeInTheDocument();
    expect(screen.getByText(/Define the data fields/)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-fields")).toBeInTheDocument();
  });

  it("shows empty state when no fields exist", () => {
    const wizard = createMockWizard();
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-fields-empty")).toBeInTheDocument();
    expect(screen.getByText(/No fields defined yet/)).toBeInTheDocument();
  });

  it("renders existing fields from step data", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-fields-field-0")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-fields-field-1")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-fields-field-2")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-fields-key-0")).toHaveValue("name");
    expect(screen.getByTestId("dsw-fields-label-0")).toHaveValue("Name");
  });

  it("shows field count in the header", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    expect(screen.getByText("Fields (3)")).toBeInTheDocument();
  });

  it("renders add field button", () => {
    const wizard = createMockWizard();
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-fields-add")).toBeInTheDocument();
    expect(screen.getByText("Add Field")).toBeInTheDocument();
  });

  it("adds a new field when add button is clicked", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-fields-add"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("fields", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });

    expect(result.fields).toHaveLength(4);
    expect(result.fields[3].key).toBe("field4");
    expect(result.fields[3].type).toBe("string");
    expect(result.fields[3].required).toBe(false);
  });

  it("removes a field when remove button is clicked", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-fields-remove-1"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("fields", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });

    expect(result.fields).toHaveLength(2);
    expect(result.fields[0].key).toBe("name");
    expect(result.fields[1].key).toBe("description");
  });

  it("updates field key when key input changes", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-fields-key-0"), {
      target: { value: "title" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });
    expect(result.fields[0].key).toBe("title");
    expect(result.fields[0].label).toBe("Name");
  });

  it("updates field label when label input changes", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-fields-label-0"), {
      target: { value: "Full Name" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });
    expect(result.fields[0].label).toBe("Full Name");
    expect(result.fields[0].key).toBe("name");
  });

  it("renders type dropdown with correct options", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    const typeSelect = screen.getByTestId("dsw-fields-type-0");
    expect(typeSelect).toHaveValue("string");

    const options = typeSelect.querySelectorAll("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue("string");
    expect(options[1]).toHaveValue("richtext");
    expect(options[2]).toHaveValue("enum");
    expect(options[3]).toHaveValue("boolean");
  });

  it("changes field type when type dropdown changes", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-fields-type-0"), {
      target: { value: "boolean" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });
    expect(result.fields[0].type).toBe("boolean");
  });

  it("adds empty options array when changing type to enum", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-fields-type-0"), {
      target: { value: "enum" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });
    expect(result.fields[0].type).toBe("enum");
    expect(result.fields[0].options).toEqual([]);
  });

  it("removes options when changing type away from enum", () => {
    const fieldsWithEnum = [
      { key: "phase", label: "Phase", type: "enum", required: true, options: ["command", "fight"] },
    ];
    const wizard = createMockWizard({ fields: { fields: fieldsWithEnum } });
    render(<StepFields wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-fields-type-0"), {
      target: { value: "string" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: fieldsWithEnum });
    expect(result.fields[0].type).toBe("string");
    expect(result.fields[0].options).toBeUndefined();
  });

  it("shows enum options editor when field type is enum", () => {
    const fieldsWithEnum = [
      { key: "phase", label: "Phase", type: "enum", required: true, options: ["command", "fight"] },
    ];
    const wizard = createMockWizard({ fields: { fields: fieldsWithEnum } });
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-fields-enum-options-0")).toBeInTheDocument();
    expect(screen.getByText("Enum Options (2)")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-fields-enum-value-0-0")).toHaveValue("command");
    expect(screen.getByTestId("dsw-fields-enum-value-0-1")).toHaveValue("fight");
  });

  it("does not show enum options editor for non-enum fields", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    expect(screen.queryByTestId("dsw-fields-enum-options-0")).not.toBeInTheDocument();
  });

  it("adds an enum option when add option button is clicked", () => {
    const fieldsWithEnum = [{ key: "phase", label: "Phase", type: "enum", required: true, options: ["command"] }];
    const wizard = createMockWizard({ fields: { fields: fieldsWithEnum } });
    render(<StepFields wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-fields-enum-add-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: fieldsWithEnum });
    expect(result.fields[0].options).toEqual(["command", ""]);
  });

  it("updates an enum option value", () => {
    const fieldsWithEnum = [{ key: "phase", label: "Phase", type: "enum", required: true, options: ["command", ""] }];
    const wizard = createMockWizard({ fields: { fields: fieldsWithEnum } });
    render(<StepFields wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-fields-enum-value-0-1"), {
      target: { value: "shooting" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: fieldsWithEnum });
    expect(result.fields[0].options).toEqual(["command", "shooting"]);
  });

  it("removes an enum option when remove button is clicked", () => {
    const fieldsWithEnum = [
      { key: "phase", label: "Phase", type: "enum", required: true, options: ["command", "fight"] },
    ];
    const wizard = createMockWizard({ fields: { fields: fieldsWithEnum } });
    render(<StepFields wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-fields-enum-remove-0-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: fieldsWithEnum });
    expect(result.fields[0].options).toEqual(["fight"]);
  });

  it("shows enum empty state when no options defined", () => {
    const fieldsWithEnum = [{ key: "phase", label: "Phase", type: "enum", required: true, options: [] }];
    const wizard = createMockWizard({ fields: { fields: fieldsWithEnum } });
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-fields-enum-empty-0")).toBeInTheDocument();
    expect(screen.getByText(/No options defined/)).toBeInTheDocument();
  });

  it("toggles required flag when checkbox is clicked", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    const requiredCheckbox = screen.getByTestId("dsw-fields-required-2").querySelector("input[type='checkbox']");
    fireEvent.click(requiredCheckbox);

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });
    expect(result.fields[2].required).toBe(true);
  });

  it("moves a field up when move up button is clicked", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-fields-move-up-1"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });

    expect(result.fields[0].key).toBe("cost");
    expect(result.fields[1].key).toBe("name");
  });

  it("moves a field down when move down button is clicked", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-fields-move-down-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: DEFAULT_FIELDS });

    expect(result.fields[0].key).toBe("cost");
    expect(result.fields[1].key).toBe("name");
  });

  it("disables move up button for the first field", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-fields-move-up-0")).toBeDisabled();
  });

  it("disables move down button for the last field", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-fields-move-down-2")).toBeDisabled();
  });

  it("shows key conflict warning when duplicate keys exist", () => {
    const duplicateFields = [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "name", label: "Title", type: "string", required: false },
    ];
    const wizard = createMockWizard({ fields: { fields: duplicateFields } });
    render(<StepFields wizard={wizard} />);

    expect(screen.getByTestId("dsw-fields-key-conflict")).toBeInTheDocument();
    expect(screen.getByText(/Duplicate keys detected/)).toBeInTheDocument();
  });

  it("does not show key conflict warning when all keys are unique", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    expect(screen.queryByTestId("dsw-fields-key-conflict")).not.toBeInTheDocument();
  });

  it("generates unique keys when adding fields with existing keys", () => {
    const fieldsWithField4 = [...DEFAULT_FIELDS, { key: "field4", label: "Field 4", type: "string", required: false }];
    const wizard = createMockWizard({ fields: { fields: fieldsWithField4 } });
    render(<StepFields wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-fields-add"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ fields: fieldsWithField4 });

    expect(result.fields[4].key).toBe("field5");
  });

  it("renders aria labels on action buttons", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    expect(screen.getByLabelText("Move Name up")).toBeInTheDocument();
    expect(screen.getByLabelText("Move Name down")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Name")).toBeInTheDocument();
  });

  it("shows required checkbox checked for required fields", () => {
    const wizard = createMockWizard({ fields: { fields: DEFAULT_FIELDS } });
    render(<StepFields wizard={wizard} />);

    const requiredCheckbox0 = screen.getByTestId("dsw-fields-required-0").querySelector("input[type='checkbox']");
    const requiredCheckbox2 = screen.getByTestId("dsw-fields-required-2").querySelector("input[type='checkbox']");
    expect(requiredCheckbox0.checked).toBe(true);
    expect(requiredCheckbox2.checked).toBe(false);
  });
});
