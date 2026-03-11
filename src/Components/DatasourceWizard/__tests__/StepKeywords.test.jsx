import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepKeywords } from "../steps/StepKeywords";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

const DEFAULT_KEYWORDS = {
  label: "Keywords",
  allowMultiple: true,
  fields: [{ key: "keyword", label: "Keyword", type: "string", required: true }],
};

describe("StepKeywords", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByText("Keywords Collection")).toBeInTheDocument();
    expect(screen.getByText(/Configure the keywords collection/)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-keywords")).toBeInTheDocument();
  });

  it("renders collection label input with default value", () => {
    const wizard = createMockWizard();
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-label")).toHaveValue("Keywords");
  });

  it("renders collection label from step data", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-label")).toHaveValue("Keywords");
  });

  it("updates collection label when input changes", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-keywords-label"), {
      target: { value: "Tags" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("keywords", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });
    expect(result.keywords.label).toBe("Tags");
  });

  it("renders allowMultiple toggle checked by default", () => {
    const wizard = createMockWizard();
    render(<StepKeywords wizard={wizard} />);

    const checkbox = screen.getByTestId("dsw-keywords-allow-multiple").querySelector("input[type='checkbox']");
    expect(checkbox.checked).toBe(true);
  });

  it("toggles allowMultiple when checkbox is clicked", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    const checkbox = screen.getByTestId("dsw-keywords-allow-multiple").querySelector("input[type='checkbox']");
    fireEvent.click(checkbox);

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });
    expect(result.keywords.allowMultiple).toBe(false);
  });

  it("shows empty state when no fields exist", () => {
    const wizard = createMockWizard();
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-fields-empty")).toBeInTheDocument();
    expect(screen.getByText(/No keyword fields defined yet/)).toBeInTheDocument();
  });

  it("renders existing fields from step data", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-field-0")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-keywords-field-key-0")).toHaveValue("keyword");
    expect(screen.getByTestId("dsw-keywords-field-label-0")).toHaveValue("Keyword");
  });

  it("shows field count in the header", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByText("Keyword Fields (1)")).toBeInTheDocument();
  });

  it("adds a new field when add button is clicked", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-keywords-fields-add"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("keywords", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });

    expect(result.keywords.fields).toHaveLength(2);
    expect(result.keywords.fields[1].key).toBe("field2");
    expect(result.keywords.fields[1].type).toBe("string");
    expect(result.keywords.fields[1].required).toBe(false);
  });

  it("removes a field when remove button is clicked", () => {
    const keywordsWithTwoFields = {
      ...DEFAULT_KEYWORDS,
      fields: [
        { key: "keyword", label: "Keyword", type: "string", required: true },
        { key: "category", label: "Category", type: "string", required: false },
      ],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithTwoFields } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-keywords-field-remove-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: keywordsWithTwoFields });

    expect(result.keywords.fields).toHaveLength(1);
    expect(result.keywords.fields[0].key).toBe("category");
  });

  it("updates field key when key input changes", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-keywords-field-key-0"), {
      target: { value: "tag" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });
    expect(result.keywords.fields[0].key).toBe("tag");
  });

  it("updates field label when label input changes", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-keywords-field-label-0"), {
      target: { value: "Tag" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });
    expect(result.keywords.fields[0].label).toBe("Tag");
  });

  it("renders type dropdown with correct options", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    const typeSelect = screen.getByTestId("dsw-keywords-field-type-0");
    expect(typeSelect).toHaveValue("string");

    const options = typeSelect.querySelectorAll("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue("string");
    expect(options[1]).toHaveValue("richtext");
    expect(options[2]).toHaveValue("enum");
    expect(options[3]).toHaveValue("boolean");
  });

  it("changes field type when type dropdown changes", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-keywords-field-type-0"), {
      target: { value: "boolean" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });
    expect(result.keywords.fields[0].type).toBe("boolean");
  });

  it("adds empty options array when changing type to enum", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-keywords-field-type-0"), {
      target: { value: "enum" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });
    expect(result.keywords.fields[0].type).toBe("enum");
    expect(result.keywords.fields[0].options).toEqual([]);
  });

  it("removes options when changing type away from enum", () => {
    const keywordsWithEnum = {
      ...DEFAULT_KEYWORDS,
      fields: [{ key: "category", label: "Category", type: "enum", options: ["core", "faction"] }],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithEnum } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-keywords-field-type-0"), {
      target: { value: "string" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: keywordsWithEnum });
    expect(result.keywords.fields[0].type).toBe("string");
    expect(result.keywords.fields[0].options).toBeUndefined();
  });

  it("shows enum options editor when field type is enum", () => {
    const keywordsWithEnum = {
      ...DEFAULT_KEYWORDS,
      fields: [{ key: "category", label: "Category", type: "enum", options: ["core", "faction"] }],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithEnum } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-field-enum-options-0")).toBeInTheDocument();
    expect(screen.getByText("Enum Options (2)")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-keywords-field-enum-value-0-0")).toHaveValue("core");
    expect(screen.getByTestId("dsw-keywords-field-enum-value-0-1")).toHaveValue("faction");
  });

  it("does not show enum options editor for non-enum fields", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.queryByTestId("dsw-keywords-field-enum-options-0")).not.toBeInTheDocument();
  });

  it("adds an enum option when add option button is clicked", () => {
    const keywordsWithEnum = {
      ...DEFAULT_KEYWORDS,
      fields: [{ key: "category", label: "Category", type: "enum", options: ["core"] }],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithEnum } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-keywords-field-enum-add-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: keywordsWithEnum });
    expect(result.keywords.fields[0].options).toEqual(["core", ""]);
  });

  it("updates an enum option value", () => {
    const keywordsWithEnum = {
      ...DEFAULT_KEYWORDS,
      fields: [{ key: "category", label: "Category", type: "enum", options: ["core"] }],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithEnum } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-keywords-field-enum-value-0-0"), {
      target: { value: "elite" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: keywordsWithEnum });
    expect(result.keywords.fields[0].options[0]).toBe("elite");
  });

  it("removes an enum option when remove button is clicked", () => {
    const keywordsWithEnum = {
      ...DEFAULT_KEYWORDS,
      fields: [{ key: "category", label: "Category", type: "enum", options: ["core", "faction"] }],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithEnum } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-keywords-field-enum-remove-0-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: keywordsWithEnum });
    expect(result.keywords.fields[0].options).toEqual(["faction"]);
  });

  it("shows enum empty state when no options defined", () => {
    const keywordsWithEmptyEnum = {
      ...DEFAULT_KEYWORDS,
      fields: [{ key: "category", label: "Category", type: "enum", options: [] }],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithEmptyEnum } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-field-enum-empty-0")).toBeInTheDocument();
    expect(screen.getByText(/No options defined/)).toBeInTheDocument();
  });

  it("toggles required flag when checkbox is clicked", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    const requiredCheckbox = screen
      .getByTestId("dsw-keywords-field-required-0")
      .querySelector("input[type='checkbox']");
    fireEvent.click(requiredCheckbox);

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });
    expect(result.keywords.fields[0].required).toBe(false);
  });

  it("moves a field up when move up button is clicked", () => {
    const keywordsWithTwoFields = {
      ...DEFAULT_KEYWORDS,
      fields: [
        { key: "keyword", label: "Keyword", type: "string", required: true },
        { key: "category", label: "Category", type: "string", required: false },
      ],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithTwoFields } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-keywords-field-move-up-1"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: keywordsWithTwoFields });

    expect(result.keywords.fields[0].key).toBe("category");
    expect(result.keywords.fields[1].key).toBe("keyword");
  });

  it("moves a field down when move down button is clicked", () => {
    const keywordsWithTwoFields = {
      ...DEFAULT_KEYWORDS,
      fields: [
        { key: "keyword", label: "Keyword", type: "string", required: true },
        { key: "category", label: "Category", type: "string", required: false },
      ],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithTwoFields } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-keywords-field-move-down-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: keywordsWithTwoFields });

    expect(result.keywords.fields[0].key).toBe("category");
    expect(result.keywords.fields[1].key).toBe("keyword");
  });

  it("disables move up button for the first field", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-field-move-up-0")).toBeDisabled();
  });

  it("disables move down button for the last field", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-field-move-down-0")).toBeDisabled();
  });

  it("shows key conflict warning when duplicate keys exist", () => {
    const keywordsWithDuplicates = {
      ...DEFAULT_KEYWORDS,
      fields: [
        { key: "keyword", label: "Keyword", type: "string", required: true },
        { key: "keyword", label: "Other Keyword", type: "string", required: false },
      ],
    };
    const wizard = createMockWizard({ keywords: { keywords: keywordsWithDuplicates } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByTestId("dsw-keywords-fields-key-conflict")).toBeInTheDocument();
    expect(screen.getByText(/Duplicate keys detected/)).toBeInTheDocument();
  });

  it("does not show key conflict warning when all keys are unique", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.queryByTestId("dsw-keywords-fields-key-conflict")).not.toBeInTheDocument();
  });

  it("preserves other keywords properties when updating fields", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-keywords-fields-add"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });

    expect(result.keywords.label).toBe("Keywords");
    expect(result.keywords.allowMultiple).toBe(true);
  });

  it("preserves fields when toggling allowMultiple", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    const checkbox = screen.getByTestId("dsw-keywords-allow-multiple").querySelector("input[type='checkbox']");
    fireEvent.click(checkbox);

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ keywords: DEFAULT_KEYWORDS });

    expect(result.keywords.fields).toHaveLength(1);
    expect(result.keywords.allowMultiple).toBe(false);
  });

  it("renders aria labels on action buttons", () => {
    const wizard = createMockWizard({ keywords: { keywords: DEFAULT_KEYWORDS } });
    render(<StepKeywords wizard={wizard} />);

    expect(screen.getByLabelText("Move Keyword up")).toBeInTheDocument();
    expect(screen.getByLabelText("Move Keyword down")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Keyword")).toBeInTheDocument();
  });
});
