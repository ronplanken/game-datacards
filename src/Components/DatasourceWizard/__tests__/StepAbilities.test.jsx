import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepAbilities } from "../steps/StepAbilities";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

const DEFAULT_CATEGORIES = [
  { key: "core", label: "Core", format: "name-only" },
  { key: "faction", label: "Faction", format: "name-description" },
  { key: "unit", label: "Unit Abilities", format: "name-description" },
];

describe("StepAbilities", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByText("Abilities")).toBeInTheDocument();
    expect(screen.getByText(/Define ability categories/)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-abilities")).toBeInTheDocument();
  });

  it("renders invulnerable save toggle unchecked by default", () => {
    const wizard = createMockWizard();
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-invuln-toggle")).not.toBeChecked();
    expect(screen.getByText("Invulnerable Save")).toBeInTheDocument();
  });

  it("renders damaged ability toggle unchecked by default", () => {
    const wizard = createMockWizard();
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-damaged-toggle")).not.toBeChecked();
    expect(screen.getByText("Damaged Ability")).toBeInTheDocument();
  });

  it("shows invulnerable save toggle checked when enabled", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: { label: "Abilities", categories: [], hasInvulnerableSave: true, hasDamagedAbility: false },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-invuln-toggle")).toBeChecked();
  });

  it("shows damaged ability toggle checked when enabled", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: { label: "Abilities", categories: [], hasInvulnerableSave: false, hasDamagedAbility: true },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-damaged-toggle")).toBeChecked();
  });

  it("toggles invulnerable save when checkbox is clicked", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: { label: "Abilities", categories: [], hasInvulnerableSave: false, hasDamagedAbility: false },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-abilities-invuln-toggle"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: { label: "Abilities", categories: [], hasInvulnerableSave: false, hasDamagedAbility: false },
    });
    expect(result.abilities.hasInvulnerableSave).toBe(true);
  });

  it("toggles damaged ability when checkbox is clicked", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: { label: "Abilities", categories: [], hasInvulnerableSave: false, hasDamagedAbility: false },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-abilities-damaged-toggle"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: { label: "Abilities", categories: [], hasInvulnerableSave: false, hasDamagedAbility: false },
    });
    expect(result.abilities.hasDamagedAbility).toBe(true);
  });

  it("shows empty state when no categories exist", () => {
    const wizard = createMockWizard();
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-empty")).toBeInTheDocument();
    expect(screen.getByText(/No ability categories defined/)).toBeInTheDocument();
  });

  it("renders existing categories from step data", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-category-0")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-abilities-category-1")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-abilities-category-2")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-abilities-category-key-0")).toHaveValue("core");
    expect(screen.getByTestId("dsw-abilities-category-label-0")).toHaveValue("Core");
  });

  it("shows category count in the header", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByText("Categories (3)")).toBeInTheDocument();
  });

  it("renders add category button", () => {
    const wizard = createMockWizard();
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-add-category")).toBeInTheDocument();
    expect(screen.getByText("Add Category")).toBeInTheDocument();
  });

  it("adds a new category when add button is clicked", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-abilities-add-category"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: {
        label: "Abilities",
        categories: DEFAULT_CATEGORIES,
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });

    expect(result.abilities.categories).toHaveLength(4);
    expect(result.abilities.categories[3].key).toBe("category4");
    expect(result.abilities.categories[3].format).toBe("name-description");
  });

  it("removes a category when remove button is clicked", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-abilities-remove-1"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: {
        label: "Abilities",
        categories: DEFAULT_CATEGORIES,
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });

    expect(result.abilities.categories).toHaveLength(2);
    expect(result.abilities.categories[0].key).toBe("core");
    expect(result.abilities.categories[1].key).toBe("unit");
  });

  it("updates category key when key input changes", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-abilities-category-key-0"), {
      target: { value: "special" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: {
        label: "Abilities",
        categories: DEFAULT_CATEGORIES,
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });
    expect(result.abilities.categories[0].key).toBe("special");
    expect(result.abilities.categories[0].label).toBe("Core");
  });

  it("updates category label when label input changes", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-abilities-category-label-0"), {
      target: { value: "Core Abilities" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: {
        label: "Abilities",
        categories: DEFAULT_CATEGORIES,
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });
    expect(result.abilities.categories[0].label).toBe("Core Abilities");
    expect(result.abilities.categories[0].key).toBe("core");
  });

  it("updates category format when format dropdown changes", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-abilities-category-format-0"), {
      target: { value: "name-description" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: {
        label: "Abilities",
        categories: DEFAULT_CATEGORIES,
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });
    expect(result.abilities.categories[0].format).toBe("name-description");
  });

  it("renders format dropdown with correct options", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: [{ key: "core", label: "Core", format: "name-only" }],
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    const select = screen.getByTestId("dsw-abilities-category-format-0");
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe("name-only");
    expect(options[1].value).toBe("name-description");
  });

  it("moves a category up when move up button is clicked", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-abilities-move-up-1"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: {
        label: "Abilities",
        categories: DEFAULT_CATEGORIES,
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });

    expect(result.abilities.categories[0].key).toBe("faction");
    expect(result.abilities.categories[1].key).toBe("core");
  });

  it("moves a category down when move down button is clicked", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-abilities-move-down-0"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("abilities", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: {
        label: "Abilities",
        categories: DEFAULT_CATEGORIES,
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });

    expect(result.abilities.categories[0].key).toBe("faction");
    expect(result.abilities.categories[1].key).toBe("core");
  });

  it("disables move up button for the first category", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-move-up-0")).toBeDisabled();
  });

  it("disables move down button for the last category", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-move-down-2")).toBeDisabled();
  });

  it("shows key conflict warning when duplicate keys exist", () => {
    const duplicateCategories = [
      { key: "core", label: "Core", format: "name-only" },
      { key: "core", label: "Core 2", format: "name-description" },
    ];
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: duplicateCategories,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByTestId("dsw-abilities-key-conflict")).toBeInTheDocument();
    expect(screen.getByText(/Duplicate keys detected/)).toBeInTheDocument();
  });

  it("does not show key conflict warning when all keys are unique", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.queryByTestId("dsw-abilities-key-conflict")).not.toBeInTheDocument();
  });

  it("generates unique keys when adding categories with existing keys", () => {
    const categoriesWithCategory4 = [
      ...DEFAULT_CATEGORIES,
      { key: "category4", label: "Category 4", format: "name-only" },
    ];
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: categoriesWithCategory4,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-abilities-add-category"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater({
      abilities: {
        label: "Abilities",
        categories: categoriesWithCategory4,
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });

    expect(result.abilities.categories[4].key).toBe("category5");
  });

  it("renders aria labels on action buttons", () => {
    const wizard = createMockWizard({
      abilities: {
        abilities: {
          label: "Abilities",
          categories: DEFAULT_CATEGORIES,
          hasInvulnerableSave: false,
          hasDamagedAbility: false,
        },
      },
    });
    render(<StepAbilities wizard={wizard} />);

    expect(screen.getByLabelText("Move Core up")).toBeInTheDocument();
    expect(screen.getByLabelText("Move Core down")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Core")).toBeInTheDocument();
  });
});
