import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepCardType } from "../steps/StepCardType";
import { WIZARD_MODES } from "../constants";

const createMockWizard = (overrides = {}) => ({
  mode: WIZARD_MODES.CREATE,
  baseType: null,
  existingBaseTypes: [],
  stepData: {},
  changeBaseType: vi.fn(),
  updateStepData: vi.fn(),
  ...overrides,
});

describe("StepCardType", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    expect(screen.getByText("Choose a Card Type")).toBeInTheDocument();
    expect(screen.getByText(/Select the type of card to define/)).toBeInTheDocument();
  });

  it("renders four card type options", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    expect(screen.getByTestId("dsw-card-type-unit")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-card-type-rule")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-card-type-enhancement")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-card-type-stratagem")).toBeInTheDocument();
  });

  it("renders correct titles for each type", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    expect(screen.getByText("Unit")).toBeInTheDocument();
    expect(screen.getByText("Rule")).toBeInTheDocument();
    expect(screen.getByText("Enhancement")).toBeInTheDocument();
    expect(screen.getByText("Stratagem")).toBeInTheDocument();
  });

  it("shows no card as selected when no baseType is set", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    const cards = screen.getByTestId("dsw-card-type-grid").querySelectorAll("[role='button']");
    cards.forEach((card) => {
      expect(card).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("shows the correct card as selected when baseType is set", () => {
    const wizard = createMockWizard({ baseType: "rule" });
    render(<StepCardType wizard={wizard} />);

    expect(screen.getByTestId("dsw-card-type-rule")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("dsw-card-type-unit")).toHaveAttribute("aria-pressed", "false");
  });

  it("applies selected class to the chosen card", () => {
    const wizard = createMockWizard({ baseType: "unit" });
    render(<StepCardType wizard={wizard} />);

    expect(screen.getByTestId("dsw-card-type-unit")).toHaveClass("dsw-system-card--selected");
    expect(screen.getByTestId("dsw-card-type-rule")).not.toHaveClass("dsw-system-card--selected");
  });

  it("calls changeBaseType and updateStepData when a card is clicked", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-card-type-unit"));

    expect(wizard.changeBaseType).toHaveBeenCalledWith("unit");
    expect(wizard.updateStepData).toHaveBeenCalledWith("card-type", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({});
    expect(result).toEqual({ key: "unit", label: "Unit" });
  });

  it("calls changeBaseType with the correct type for each option", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-card-type-stratagem"));
    expect(wizard.changeBaseType).toHaveBeenCalledWith("stratagem");
  });

  it("supports keyboard selection with Enter key", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    fireEvent.keyDown(screen.getByTestId("dsw-card-type-enhancement"), { key: "Enter" });

    expect(wizard.changeBaseType).toHaveBeenCalledWith("enhancement");
  });

  it("supports keyboard selection with Space key", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    fireEvent.keyDown(screen.getByTestId("dsw-card-type-rule"), { key: " " });

    expect(wizard.changeBaseType).toHaveBeenCalledWith("rule");
  });

  // Add-card-type mode tests
  describe("add-card-type mode", () => {
    it("shows existing types as disabled", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        existingBaseTypes: ["unit", "rule"],
      });
      render(<StepCardType wizard={wizard} />);

      expect(screen.getByTestId("dsw-card-type-unit")).toHaveClass("dsw-system-card--disabled");
      expect(screen.getByTestId("dsw-card-type-rule")).toHaveClass("dsw-system-card--disabled");
      expect(screen.getByTestId("dsw-card-type-enhancement")).not.toHaveClass("dsw-system-card--disabled");
      expect(screen.getByTestId("dsw-card-type-stratagem")).not.toHaveClass("dsw-system-card--disabled");
    });

    it("shows 'Already defined' badge on disabled types", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        existingBaseTypes: ["unit"],
      });
      render(<StepCardType wizard={wizard} />);

      const badges = screen.getAllByText("Already defined");
      expect(badges).toHaveLength(1);
    });

    it("does not call changeBaseType when clicking a disabled type", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        existingBaseTypes: ["unit"],
      });
      render(<StepCardType wizard={wizard} />);

      // The card has pointer-events: none via CSS, but we also guard in the handler
      const unitCard = screen.getByTestId("dsw-card-type-unit");
      fireEvent.click(unitCard);

      expect(wizard.changeBaseType).not.toHaveBeenCalled();
    });

    it("sets aria-disabled on disabled types", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        existingBaseTypes: ["stratagem"],
      });
      render(<StepCardType wizard={wizard} />);

      expect(screen.getByTestId("dsw-card-type-stratagem")).toHaveAttribute("aria-disabled", "true");
      expect(screen.getByTestId("dsw-card-type-unit")).toHaveAttribute("aria-disabled", "false");
    });

    it("sets tabIndex to -1 on disabled types", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        existingBaseTypes: ["enhancement"],
      });
      render(<StepCardType wizard={wizard} />);

      expect(screen.getByTestId("dsw-card-type-enhancement")).toHaveAttribute("tabindex", "-1");
      expect(screen.getByTestId("dsw-card-type-unit")).toHaveAttribute("tabindex", "0");
    });
  });

  // Card type details section
  describe("card type details", () => {
    it("does not show details section when no type is selected", () => {
      const wizard = createMockWizard();
      render(<StepCardType wizard={wizard} />);

      expect(screen.queryByTestId("dsw-card-type-details")).not.toBeInTheDocument();
    });

    it("shows details section when a type is selected", () => {
      const wizard = createMockWizard({ baseType: "unit" });
      render(<StepCardType wizard={wizard} />);

      expect(screen.getByTestId("dsw-card-type-details")).toBeInTheDocument();
    });

    it("shows key and label inputs in details section", () => {
      const wizard = createMockWizard({
        baseType: "unit",
        stepData: { "card-type": { key: "infantry", label: "Infantry" } },
      });
      render(<StepCardType wizard={wizard} />);

      const keyInput = screen.getByTestId("dsw-card-type-key");
      const labelInput = screen.getByTestId("dsw-card-type-label");

      expect(keyInput).toHaveValue("infantry");
      expect(labelInput).toHaveValue("Infantry");
    });

    it("calls updateStepData when key input changes", () => {
      const wizard = createMockWizard({ baseType: "rule" });
      render(<StepCardType wizard={wizard} />);

      fireEvent.change(screen.getByTestId("dsw-card-type-key"), { target: { value: "battle-rules" } });

      const calls = wizard.updateStepData.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe("card-type");
      const updater = lastCall[1];
      const result = updater({ label: "Rule" });
      expect(result).toEqual({ label: "Rule", key: "battle-rules" });
    });

    it("calls updateStepData when label input changes", () => {
      const wizard = createMockWizard({ baseType: "rule" });
      render(<StepCardType wizard={wizard} />);

      fireEvent.change(screen.getByTestId("dsw-card-type-label"), { target: { value: "Battle Rules" } });

      const calls = wizard.updateStepData.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe("card-type");
      const updater = lastCall[1];
      const result = updater({ key: "rule" });
      expect(result).toEqual({ key: "rule", label: "Battle Rules" });
    });
  });

  it("renders the card type grid container", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    expect(screen.getByTestId("dsw-card-type-grid")).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-card-type")).toBeInTheDocument();
  });

  it("renders descriptions for each type", () => {
    const wizard = createMockWizard();
    render(<StepCardType wizard={wizard} />);

    expect(screen.getByText(/stat profiles, weapon tables/)).toBeInTheDocument();
    expect(screen.getByText(/Text-based rule cards/)).toBeInTheDocument();
    expect(screen.getByText(/Upgrade cards with a cost/)).toBeInTheDocument();
    expect(screen.getByText(/Tactical ability cards/)).toBeInTheDocument();
  });

  it("preserves existing step data when selecting a type", () => {
    const wizard = createMockWizard({
      stepData: { "card-type": { someField: "value" } },
    });
    render(<StepCardType wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-card-type-unit"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({ someField: "value" });
    expect(result).toEqual({ someField: "value", key: "unit", label: "Unit" });
  });
});
