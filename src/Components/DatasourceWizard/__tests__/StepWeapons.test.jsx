import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepWeapons } from "../steps/StepWeapons";

const createMockWizard = (stepData = {}) => ({
  stepData,
  updateStepData: vi.fn(),
});

const DEFAULT_COLUMNS = [
  { key: "range", label: "Range", type: "string", required: true },
  { key: "a", label: "A", type: "string", required: true },
  { key: "bs", label: "BS", type: "string", required: true },
];

const TWO_TYPES = {
  weapons: {
    weaponTypes: {
      label: "Weapon Types",
      allowMultiple: true,
      types: [
        { key: "ranged", label: "Ranged Weapons", hasKeywords: true, hasProfiles: false, columns: DEFAULT_COLUMNS },
        { key: "melee", label: "Melee Weapons", hasKeywords: false, hasProfiles: true, columns: [] },
      ],
    },
  },
};

const SINGLE_TYPE = {
  weapons: {
    weaponTypes: {
      label: "Weapon Types",
      allowMultiple: true,
      types: [
        { key: "ranged", label: "Ranged Weapons", hasKeywords: true, hasProfiles: false, columns: DEFAULT_COLUMNS },
      ],
    },
  },
};

describe("StepWeapons", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByText("Weapon Types")).toBeInTheDocument();
    expect(screen.getByText(/Define weapon categories/)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-weapons")).toBeInTheDocument();
  });

  it("shows empty state when no weapon types exist", () => {
    const wizard = createMockWizard();
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-empty")).toBeInTheDocument();
    expect(screen.getByText(/No weapon types defined/)).toBeInTheDocument();
  });

  it("renders add type button", () => {
    const wizard = createMockWizard();
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-add-type")).toBeInTheDocument();
    expect(screen.getByText("Add Type")).toBeInTheDocument();
  });

  it("adds a new weapon type when add button is clicked", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-add-type"));

    expect(wizard.updateStepData).toHaveBeenCalledWith("weapons", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);

    expect(result.weaponTypes.types).toHaveLength(2);
    expect(result.weaponTypes.types[1].key).toBe("weapon2");
    expect(result.weaponTypes.types[1].columns).toEqual([]);
  });

  it("renders tabs for each weapon type", () => {
    const wizard = createMockWizard(TWO_TYPES);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-tab-0")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-weapons-tab-1")).toBeInTheDocument();
    expect(screen.getByText("Ranged Weapons")).toBeInTheDocument();
    expect(screen.getByText("Melee Weapons")).toBeInTheDocument();
  });

  it("shows the first tab as active by default", () => {
    const wizard = createMockWizard(TWO_TYPES);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-tab-0").className).toContain("dsw-weapons-tab--active");
  });

  it("switches active tab when clicking another tab", () => {
    const wizard = createMockWizard(TWO_TYPES);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-tab-1"));

    expect(screen.getByTestId("dsw-weapons-tab-1").className).toContain("dsw-weapons-tab--active");
    expect(screen.getByTestId("dsw-weapons-tab-0").className).not.toContain("dsw-weapons-tab--active");
  });

  it("shows the type panel with key/label inputs for the active type", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-type-panel")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-weapons-type-key")).toHaveValue("ranged");
    expect(screen.getByTestId("dsw-weapons-type-label")).toHaveValue("Ranged Weapons");
  });

  it("updates weapon type key when key input changes", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-weapons-type-key"), {
      target: { value: "shooting" },
    });

    expect(wizard.updateStepData).toHaveBeenCalledWith("weapons", expect.any(Function));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].key).toBe("shooting");
  });

  it("updates weapon type label when label input changes", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-weapons-type-label"), {
      target: { value: "Shooting Weapons" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].label).toBe("Shooting Weapons");
  });

  it("shows hasKeywords toggle checked when type has keywords enabled", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-has-keywords")).toBeChecked();
  });

  it("shows hasProfiles toggle unchecked when type has profiles disabled", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-has-profiles")).not.toBeChecked();
  });

  it("toggles hasKeywords when checkbox is clicked", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-has-keywords"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].hasKeywords).toBe(false);
  });

  it("toggles hasProfiles when checkbox is clicked", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-has-profiles"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].hasProfiles).toBe(true);
  });

  it("renders columns for the active weapon type", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-col-0")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-weapons-col-1")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-weapons-col-2")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-weapons-col-key-0")).toHaveValue("range");
    expect(screen.getByTestId("dsw-weapons-col-label-0")).toHaveValue("Range");
  });

  it("shows column count in the header", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByText("Columns (3)")).toBeInTheDocument();
  });

  it("shows columns empty state when type has no columns", () => {
    const noColTypes = {
      weapons: {
        weaponTypes: {
          label: "Weapon Types",
          allowMultiple: true,
          types: [{ key: "ranged", label: "Ranged", hasKeywords: false, hasProfiles: false, columns: [] }],
        },
      },
    };
    const wizard = createMockWizard(noColTypes);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-columns-empty")).toBeInTheDocument();
  });

  it("adds a column when add column button is clicked", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-add-column"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].columns).toHaveLength(4);
    expect(result.weaponTypes.types[0].columns[3].key).toBe("col4");
  });

  it("removes a column when remove button is clicked", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-col-remove-1"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].columns).toHaveLength(2);
    expect(result.weaponTypes.types[0].columns[0].key).toBe("range");
    expect(result.weaponTypes.types[0].columns[1].key).toBe("bs");
  });

  it("updates column key when key input changes", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-weapons-col-key-0"), {
      target: { value: "distance" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].columns[0].key).toBe("distance");
  });

  it("updates column label when label input changes", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.change(screen.getByTestId("dsw-weapons-col-label-0"), {
      target: { value: "Distance" },
    });

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].columns[0].label).toBe("Distance");
  });

  it("moves a column up when move up button is clicked", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-col-move-up-1"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].columns[0].key).toBe("a");
    expect(result.weaponTypes.types[0].columns[1].key).toBe("range");
  });

  it("moves a column down when move down button is clicked", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-col-move-down-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(SINGLE_TYPE.weapons);
    expect(result.weaponTypes.types[0].columns[0].key).toBe("a");
    expect(result.weaponTypes.types[0].columns[1].key).toBe("range");
  });

  it("disables move up button for the first column", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-col-move-up-0")).toBeDisabled();
  });

  it("disables move down button for the last column", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-col-move-down-2")).toBeDisabled();
  });

  it("removes a weapon type when tab remove button is clicked", () => {
    const wizard = createMockWizard(TWO_TYPES);
    render(<StepWeapons wizard={wizard} />);

    fireEvent.click(screen.getByTestId("dsw-weapons-tab-remove-0"));

    const updater = wizard.updateStepData.mock.calls[0][1];
    const result = updater(TWO_TYPES.weapons);
    expect(result.weaponTypes.types).toHaveLength(1);
    expect(result.weaponTypes.types[0].key).toBe("melee");
  });

  it("shows type key conflict warning when duplicate type keys exist", () => {
    const duplicateTypes = {
      weapons: {
        weaponTypes: {
          label: "Weapon Types",
          allowMultiple: true,
          types: [
            { key: "ranged", label: "Ranged", hasKeywords: false, hasProfiles: false, columns: [] },
            { key: "ranged", label: "Also Ranged", hasKeywords: false, hasProfiles: false, columns: [] },
          ],
        },
      },
    };
    const wizard = createMockWizard(duplicateTypes);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-type-key-conflict")).toBeInTheDocument();
  });

  it("shows column key conflict warning when duplicate column keys exist", () => {
    const duplicateCols = {
      weapons: {
        weaponTypes: {
          label: "Weapon Types",
          allowMultiple: true,
          types: [
            {
              key: "ranged",
              label: "Ranged",
              hasKeywords: false,
              hasProfiles: false,
              columns: [
                { key: "range", label: "Range", type: "string", required: true },
                { key: "range", label: "Also Range", type: "string", required: true },
              ],
            },
          ],
        },
      },
    };
    const wizard = createMockWizard(duplicateCols);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByTestId("dsw-weapons-col-key-conflict")).toBeInTheDocument();
  });

  it("renders aria labels on column action buttons", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByLabelText("Move Range up")).toBeInTheDocument();
    expect(screen.getByLabelText("Move Range down")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Range")).toBeInTheDocument();
  });

  it("renders aria label on tab remove button", () => {
    const wizard = createMockWizard(SINGLE_TYPE);
    render(<StepWeapons wizard={wizard} />);

    expect(screen.getByLabelText("Remove Ranged Weapons")).toBeInTheDocument();
  });
});
