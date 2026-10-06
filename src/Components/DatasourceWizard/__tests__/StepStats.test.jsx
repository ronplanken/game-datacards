import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepStats } from "../steps/StepStats";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

const DEFAULT_FIELDS = [
  { key: "m", label: "M", type: "string", displayOrder: 1 },
  { key: "t", label: "T", type: "string", displayOrder: 2 },
  { key: "sv", label: "SV", type: "string", displayOrder: 3 },
];

describe("StepStats", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepStats wizard={wizard} />);

    expect(screen.getByText("Stat Profile Fields")).toBeInTheDocument();
    expect(screen.getByText(/Define the stat columns/)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-stats")).toBeInTheDocument();
  });

  it("renders the allow multiple profiles toggle", () => {
    const wizard = createMockWizard();
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-allow-multiple")).toBeInTheDocument();
    expect(screen.getByText("Allow multiple stat profiles")).toBeInTheDocument();
  });

  it("shows the toggle unchecked by default", () => {
    const wizard = createMockWizard();
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-allow-multiple")).not.toBeChecked();
  });

  it("shows the toggle checked when allowMultipleProfiles is true", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: true, fields: [] } },
    });
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-allow-multiple")).toBeChecked();
  });

  it("toggles allowMultipleProfiles when checkbox is clicked", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: [] } },
    });
    render(<StepStats wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-stats-allow-multiple"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("stats", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ stats: { label: "Stats", allowMultipleProfiles: false, fields: [] } });
    expect(result.stats.allowMultipleProfiles).toBe(true);
  });

  it("shows empty state when no fields exist", () => {
    const wizard = createMockWizard();
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-empty")).toBeInTheDocument();
    expect(screen.getByText(/No stat fields defined/)).toBeInTheDocument();
  });

  it("renders existing fields from step data", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-field-0")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-stats-field-1")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-stats-field-2")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-stats-field-key-0")).toHaveValue("m");
    expect(screen.getByTestId("dsw-stats-field-label-0")).toHaveValue("M");
  });

  it("shows field count in the header", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    expect(screen.getByText("Stat Fields (3)")).toBeInTheDocument();
  });

  it("renders add field button", () => {
    const wizard = createMockWizard();
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-add-field")).toBeInTheDocument();
    expect(screen.getByText("Add Field")).toBeInTheDocument();
  });

  it("adds a new field when add button is clicked", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-stats-add-field"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("stats", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } });

    expect(result.stats.fields).toHaveLength(4);
    expect(result.stats.fields[3].key).toBe("stat4");
    expect(result.stats.fields[3].displayOrder).toBe(4);
  });

  it("removes a field when remove button is clicked", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-stats-remove-1"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("stats", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } });

    expect(result.stats.fields).toHaveLength(2);
    expect(result.stats.fields[0].key).toBe("m");
    expect(result.stats.fields[1].key).toBe("sv");
    // displayOrder should be reindexed
    expect(result.stats.fields[0].displayOrder).toBe(1);
    expect(result.stats.fields[1].displayOrder).toBe(2);
  });

  it("updates field key when key input changes", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-stats-field-key-0"), {
      target: { value: "movement" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("stats", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } });
    expect(result.stats.fields[0].key).toBe("movement");
    expect(result.stats.fields[0].label).toBe("M");
  });

  it("updates field label when label input changes", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-stats-field-label-0"), {
      target: { value: "Movement" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("stats", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } });
    expect(result.stats.fields[0].label).toBe("Movement");
    expect(result.stats.fields[0].key).toBe("m");
  });

  it("moves a field up when move up button is clicked", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-stats-move-up-1"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("stats", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } });

    expect(result.stats.fields[0].key).toBe("t");
    expect(result.stats.fields[1].key).toBe("m");
    expect(result.stats.fields[0].displayOrder).toBe(1);
    expect(result.stats.fields[1].displayOrder).toBe(2);
  });

  it("moves a field down when move down button is clicked", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-stats-move-down-0"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("stats", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } });

    expect(result.stats.fields[0].key).toBe("t");
    expect(result.stats.fields[1].key).toBe("m");
    expect(result.stats.fields[0].displayOrder).toBe(1);
    expect(result.stats.fields[1].displayOrder).toBe(2);
  });

  it("disables move up button for the first field", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-move-up-0")).toBeDisabled();
  });

  it("disables move down button for the last field", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-move-down-2")).toBeDisabled();
  });

  it("shows displayOrder numbers on each field row", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    const fieldRows = screen.getAllByTestId(/^dsw-stats-field-\d+$/);
    expect(fieldRows).toHaveLength(3);
  });

  it("generates unique keys when adding fields with existing keys", () => {
    const fieldsWithStat4 = [...DEFAULT_FIELDS, { key: "stat4", label: "STAT4", type: "string", displayOrder: 4 }];
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: fieldsWithStat4 } },
    });
    render(<StepStats wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-stats-add-field"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ stats: { label: "Stats", allowMultipleProfiles: false, fields: fieldsWithStat4 } });

    expect(result.stats.fields[4].key).toBe("stat5");
  });

  it("shows key conflict warning when duplicate keys exist", () => {
    const duplicateFields = [
      { key: "m", label: "M", type: "string", displayOrder: 1 },
      { key: "m", label: "Movement", type: "string", displayOrder: 2 },
    ];
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: duplicateFields } },
    });
    render(<StepStats wizard={wizard} />);

    expect(screen.getByTestId("dsw-stats-key-conflict")).toBeInTheDocument();
    expect(screen.getByText(/Duplicate keys detected/)).toBeInTheDocument();
  });

  it("does not show key conflict warning when all keys are unique", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    expect(screen.queryByTestId("dsw-stats-key-conflict")).not.toBeInTheDocument();
  });

  it("renders aria labels on action buttons", () => {
    const wizard = createMockWizard({
      stats: { stats: { label: "Stats", allowMultipleProfiles: false, fields: DEFAULT_FIELDS } },
    });
    render(<StepStats wizard={wizard} />);

    expect(screen.getByLabelText("Move M up")).toBeInTheDocument();
    expect(screen.getByLabelText("Move M down")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove M")).toBeInTheDocument();
  });
});
