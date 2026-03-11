import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepMetadata } from "../steps/StepMetadata";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

describe("StepMetadata", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    expect(screen.getByText("Datasource Information")).toBeInTheDocument();
    expect(screen.getByText(/Provide basic details/)).toBeInTheDocument();
  });

  it("renders name, version, and author inputs", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-metadata-name")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-metadata-version")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-metadata-author")).toBeInTheDocument();
  });

  it("shows default version as 1.0.0 when no data exists", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-metadata-version")).toHaveValue("1.0.0");
  });

  it("displays existing step data values", () => {
    const wizard = createMockWizard({
      metadata: { name: "My Game", version: "2.0.0", author: "Test Author" },
    });
    render(<StepMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-metadata-name")).toHaveValue("My Game");
    expect(screen.getByTestId("dsw-metadata-version")).toHaveValue("2.0.0");
    expect(screen.getByTestId("dsw-metadata-author")).toHaveValue("Test Author");
  });

  it("calls updateStepData with name when name input changes", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-metadata-name"), {
      target: { value: "New Name" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("metadata", expect.any(Function));

    // Execute the updater function to verify the merge behavior
    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({});
    expect(result).toEqual({ name: "New Name" });
  });

  it("calls updateStepData with version when version input changes", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-metadata-version"), {
      target: { value: "3.0.0" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("metadata", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ name: "Existing" });
    expect(result).toEqual({ name: "Existing", version: "3.0.0" });
  });

  it("calls updateStepData with author when author input changes", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-metadata-author"), {
      target: { value: "Jane Doe" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("metadata", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({});
    expect(result).toEqual({ author: "Jane Doe" });
  });

  it("shows a required indicator on the name field", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass("dsw-form-required");
  });

  it("renders hint text for each field", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    expect(screen.getByText(/descriptive name/i)).toBeInTheDocument();
    expect(screen.getByText(/version number for tracking changes/i)).toBeInTheDocument();
    expect(screen.getByText(/person or group who created/i)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-metadata")).toBeInTheDocument();
  });
});
