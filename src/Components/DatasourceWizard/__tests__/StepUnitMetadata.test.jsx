import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepUnitMetadata } from "../steps/StepUnitMetadata";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

describe("StepUnitMetadata", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByText("Unit Metadata")).toBeInTheDocument();
    expect(screen.getByText(/Configure keyword and points settings/)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-unit-metadata")).toBeInTheDocument();
  });

  it("renders keywords toggle checked by default", () => {
    const wizard = createMockWizard();
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-unit-metadata-keywords-toggle")).toBeChecked();
    expect(screen.getByText("Keywords")).toBeInTheDocument();
  });

  it("renders faction keywords toggle checked by default", () => {
    const wizard = createMockWizard();
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-unit-metadata-faction-keywords-toggle")).toBeChecked();
    expect(screen.getByText("Faction Keywords")).toBeInTheDocument();
  });

  it("renders points toggle unchecked by default", () => {
    const wizard = createMockWizard();
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-unit-metadata-points-toggle")).not.toBeChecked();
    expect(screen.getByText("Points")).toBeInTheDocument();
  });

  it("does not show points format when points is disabled", () => {
    const wizard = createMockWizard();
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.queryByTestId("dsw-unit-metadata-points-format")).not.toBeInTheDocument();
  });

  it("shows points format select when points is enabled", () => {
    const wizard = createMockWizard({
      "unit-metadata": {
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: true,
          pointsFormat: "per-model",
        },
      },
    });
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-unit-metadata-points-format")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-unit-metadata-points-format-select")).toHaveValue("per-model");
  });

  it("shows keywords toggle unchecked when disabled in step data", () => {
    const wizard = createMockWizard({
      "unit-metadata": {
        metadata: {
          hasKeywords: false,
          hasFactionKeywords: true,
          hasPoints: false,
          pointsFormat: "per-model",
        },
      },
    });
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-unit-metadata-keywords-toggle")).not.toBeChecked();
  });

  it("shows faction keywords toggle unchecked when disabled in step data", () => {
    const wizard = createMockWizard({
      "unit-metadata": {
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: false,
          hasPoints: false,
          pointsFormat: "per-model",
        },
      },
    });
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-unit-metadata-faction-keywords-toggle")).not.toBeChecked();
  });

  it("toggles keywords when checkbox is clicked", () => {
    const wizard = createMockWizard({
      "unit-metadata": {
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: false,
          pointsFormat: "per-model",
        },
      },
    });
    render(<StepUnitMetadata wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-unit-metadata-keywords-toggle"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("unit-metadata", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      metadata: {
        hasKeywords: true,
        hasFactionKeywords: true,
        hasPoints: false,
        pointsFormat: "per-model",
      },
    });
    expect(result.metadata.hasKeywords).toBe(false);
  });

  it("toggles faction keywords when checkbox is clicked", () => {
    const wizard = createMockWizard({
      "unit-metadata": {
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: false,
          pointsFormat: "per-model",
        },
      },
    });
    render(<StepUnitMetadata wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-unit-metadata-faction-keywords-toggle"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("unit-metadata", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      metadata: {
        hasKeywords: true,
        hasFactionKeywords: true,
        hasPoints: false,
        pointsFormat: "per-model",
      },
    });
    expect(result.metadata.hasFactionKeywords).toBe(false);
  });

  it("toggles points when checkbox is clicked", () => {
    const wizard = createMockWizard({
      "unit-metadata": {
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: false,
          pointsFormat: "per-model",
        },
      },
    });
    render(<StepUnitMetadata wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-unit-metadata-points-toggle"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("unit-metadata", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      metadata: {
        hasKeywords: true,
        hasFactionKeywords: true,
        hasPoints: false,
        pointsFormat: "per-model",
      },
    });
    expect(result.metadata.hasPoints).toBe(true);
  });

  it("changes points format when dropdown value changes", () => {
    const wizard = createMockWizard({
      "unit-metadata": {
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: true,
          pointsFormat: "per-model",
        },
      },
    });
    render(<StepUnitMetadata wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-unit-metadata-points-format-select"), {
      target: { value: "per-unit" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("unit-metadata", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      metadata: {
        hasKeywords: true,
        hasFactionKeywords: true,
        hasPoints: true,
        pointsFormat: "per-model",
      },
    });
    expect(result.metadata.pointsFormat).toBe("per-unit");
  });

  it("renders points format dropdown with correct options", () => {
    const wizard = createMockWizard({
      "unit-metadata": {
        metadata: {
          hasKeywords: true,
          hasFactionKeywords: true,
          hasPoints: true,
          pointsFormat: "per-model",
        },
      },
    });
    render(<StepUnitMetadata wizard={wizard} />);

    const select = screen.getByTestId("dsw-unit-metadata-points-format-select");
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe("per-model");
    expect(options[0].textContent).toBe("Per model");
    expect(options[1].value).toBe("per-unit");
    expect(options[1].textContent).toBe("Per unit");
  });

  it("renders toggle hint text for all toggles", () => {
    const wizard = createMockWizard();
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByText(/Show keywords on the card/)).toBeInTheDocument();
    expect(screen.getByText(/Show faction keywords on the card/)).toBeInTheDocument();
    expect(screen.getByText(/Enable a points cost field/)).toBeInTheDocument();
  });

  it("renders section header with icon and title", () => {
    const wizard = createMockWizard();
    render(<StepUnitMetadata wizard={wizard} />);

    expect(screen.getByTestId("dsw-unit-metadata-section")).toBeInTheDocument();
  });
});
