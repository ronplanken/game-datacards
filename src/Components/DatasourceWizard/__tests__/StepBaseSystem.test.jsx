import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepBaseSystem } from "../steps/StepBaseSystem";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

describe("StepBaseSystem", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    expect(screen.getByText("Choose a Base System")).toBeInTheDocument();
    expect(screen.getByText(/Select a starting template/)).toBeInTheDocument();
  });

  it("renders a card per system, with 11th edition first", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    expect(screen.getByTestId("dsw-system-card-40k-11e")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-system-card-40k-10e")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-system-card-aos")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-system-card-blank")).toBeInTheDocument();

    const grid = screen.getByTestId("dsw-system-grid");
    expect(grid.firstChild).toBe(screen.getByTestId("dsw-system-card-40k-11e"));
  });

  it("renders correct titles for each system", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    // Both 40K editions share the title; 11e and legacy 10e are separate cards.
    expect(screen.getAllByText("Warhammer 40K")).toHaveLength(2);
    expect(screen.getByText("11th Edition")).toBeInTheDocument();
    expect(screen.getByText("10th Edition")).toBeInTheDocument();
    expect(screen.getByText("Age of Sigmar")).toBeInTheDocument();
    expect(screen.getByText("Blank Template")).toBeInTheDocument();
  });

  it("tags 10th edition as legacy and leaves 11th edition untagged", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    const legacyTag = screen.getByText("Legacy");
    expect(screen.getByTestId("dsw-system-card-40k-10e")).toContainElement(legacyTag);
    expect(screen.getByTestId("dsw-system-card-40k-11e")).not.toContainElement(legacyTag);
  });

  it("calls updateStepData when the 11th edition card is clicked", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-system-card-40k-11e"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    expect(updater({})).toEqual({ baseSystem: "40k-11e" });
  });

  it("shows no card as selected when no data exists", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    const cards = screen.getAllByRole("button");
    cards.forEach((card) => {
      expect(card).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("shows the correct card as selected when data exists", () => {
    const wizard = createMockWizard({
      "base-system": { baseSystem: "aos" },
    });
    render(<StepBaseSystem wizard={wizard} />);

    expect(screen.getByTestId("dsw-system-card-aos")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("dsw-system-card-40k-10e")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("dsw-system-card-blank")).toHaveAttribute("aria-pressed", "false");
  });

  it("applies selected class to the chosen card", () => {
    const wizard = createMockWizard({
      "base-system": { baseSystem: "40k-10e" },
    });
    render(<StepBaseSystem wizard={wizard} />);

    expect(screen.getByTestId("dsw-system-card-40k-10e")).toHaveClass("dsw-system-card--selected");
    expect(screen.getByTestId("dsw-system-card-aos")).not.toHaveClass("dsw-system-card--selected");
  });

  it("calls updateStepData when a card is clicked", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-system-card-40k-10e"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("base-system", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({});
    expect(result).toEqual({ baseSystem: "40k-10e" });
  });

  it("calls updateStepData when AoS card is clicked", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-system-card-aos"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({});
    expect(result).toEqual({ baseSystem: "aos" });
  });

  it("calls updateStepData when Blank card is clicked", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-system-card-blank"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({});
    expect(result).toEqual({ baseSystem: "blank" });
  });

  it("preserves existing step data when selecting a system", () => {
    const wizard = createMockWizard({
      "base-system": { someOtherField: "value" },
    });
    render(<StepBaseSystem wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-system-card-40k-10e"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ someOtherField: "value" });
    expect(result).toEqual({ someOtherField: "value", baseSystem: "40k-10e" });
  });

  it("supports keyboard selection with Enter key", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    fireEvent.keyDown(screen.getByTestId("dsw-system-card-aos"), { key: "Enter" });

    expect(wizard.updateStepData).toHaveBeenCalledWith("base-system", expect.any(Function));
  });

  it("supports keyboard selection with Space key", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    fireEvent.keyDown(screen.getByTestId("dsw-system-card-blank"), { key: " " });

    expect(wizard.updateStepData).toHaveBeenCalledWith("base-system", expect.any(Function));
  });

  it("renders the system grid container", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    expect(screen.getByTestId("dsw-system-grid")).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-base-system")).toBeInTheDocument();
  });

  it("renders descriptions for each system", () => {
    const wizard = createMockWizard();
    render(<StepBaseSystem wizard={wizard} />);

    expect(screen.getAllByText(/Pre-configured stat lines/)).toHaveLength(2);
    expect(screen.getByText(/11th Edition keyword glossary/)).toBeInTheDocument();
    expect(screen.getByText(/Stat profiles for move/)).toBeInTheDocument();
    expect(screen.getByText(/empty schema with no pre-configured/)).toBeInTheDocument();
  });
});
