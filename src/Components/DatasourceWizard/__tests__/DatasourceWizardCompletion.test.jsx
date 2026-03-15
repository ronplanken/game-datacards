import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DatasourceWizard } from "../index";
import { useDatasourceWizard } from "../hooks/useDatasourceWizard";

vi.mock("../hooks/useDatasourceWizard");

/**
 * Helper to build a mock wizard state for a given mode on the review step.
 */
const createMockWizard = (mode, assembleResultReturn) => ({
  mode,
  currentStepIndex: mode === "create" ? 3 : 1,
  currentStep: { id: "review", title: "Review", required: false },
  steps:
    mode === "create"
      ? [
          { id: "metadata", title: "Datasource Info", required: true },
          { id: "base-system", title: "Base System", required: true },
          { id: "card-type", title: "Card Type", required: true },
          { id: "review", title: "Review", required: false },
        ]
      : [
          { id: "card-type", title: "Card Type", required: true },
          { id: "review", title: "Review", required: false },
        ],
  totalSteps: mode === "create" ? 4 : 2,
  isFirstStep: false,
  isLastStep: true,
  progress: 100,
  completedSteps: new Set(mode === "create" ? [0, 1, 2] : [0]),
  transitionDirection: "forward",
  canProceed: true,
  goToStep: vi.fn(),
  goNext: vi.fn(),
  goPrevious: vi.fn(),
  baseType: "stratagem",
  changeBaseType: vi.fn(),
  existingBaseTypes: mode === "add-card-type" ? ["unit"] : [],
  availableBaseTypes: ["stratagem", "enhancement"],
  stepData: {},
  updateStepData: vi.fn(),
  assembleResult: vi.fn().mockReturnValue(assembleResultReturn),
});

describe("DatasourceWizard completion action", () => {
  let modalRoot;

  beforeEach(() => {
    vi.useFakeTimers();
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.removeChild(modalRoot);
    vi.restoreAllMocks();
  });

  it("shows 'Create Datasource' complete button on the review step in create mode", () => {
    const mockResult = {
      name: "My DS",
      version: "1.0.0",
      author: "",
      schema: { version: "1.0.0", baseSystem: "blank", cardTypes: [] },
    };
    useDatasourceWizard.mockReturnValue(createMockWizard("create", mockResult));

    render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
    const completeBtn = screen.getByTestId("dsw-btn-complete");
    expect(completeBtn).toBeInTheDocument();
    expect(completeBtn).toHaveTextContent("Create Datasource");
    expect(screen.queryByTestId("dsw-btn-next")).not.toBeInTheDocument();
  });

  it("shows 'Add Card Type' complete button on the review step in add-card-type mode", () => {
    const mockResult = { key: "stratagem", label: "stratagem", baseType: "stratagem", schema: { fields: [] } };
    useDatasourceWizard.mockReturnValue(createMockWizard("add-card-type", mockResult));

    const existingDatasource = { name: "Test", schema: { cardTypes: [{ baseType: "unit" }] } };
    render(
      <DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} existingDatasource={existingDatasource} />,
    );
    const completeBtn = screen.getByTestId("dsw-btn-complete");
    expect(completeBtn).toBeInTheDocument();
    expect(completeBtn).toHaveTextContent("Add Card Type");
  });

  it("calls onComplete with full datasource result in create mode", () => {
    const mockResult = {
      name: "My DS",
      version: "1.0.0",
      author: "",
      schema: {
        version: "1.0.0",
        baseSystem: "blank",
        cardTypes: [{ key: "stratagem", label: "stratagem", baseType: "stratagem", schema: { fields: [] } }],
      },
    };
    useDatasourceWizard.mockReturnValue(createMockWizard("create", mockResult));

    const onComplete = vi.fn();
    render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={onComplete} />);
    fireEvent.click(screen.getByTestId("dsw-btn-complete"));
    act(() => vi.advanceTimersByTime(200));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(mockResult);
    // Verify full datasource shape
    expect(mockResult).toHaveProperty("name");
    expect(mockResult).toHaveProperty("schema.cardTypes");
    expect(mockResult).not.toHaveProperty("key");
  });

  it("calls onComplete with card type entry in add-card-type mode", () => {
    const mockResult = {
      key: "stratagem",
      label: "stratagem",
      baseType: "stratagem",
      schema: { fields: [] },
    };
    useDatasourceWizard.mockReturnValue(createMockWizard("add-card-type", mockResult));

    const onComplete = vi.fn();
    const existingDatasource = { name: "Test", schema: { cardTypes: [{ baseType: "unit" }] } };
    render(
      <DatasourceWizard
        open={true}
        onClose={vi.fn()}
        onComplete={onComplete}
        existingDatasource={existingDatasource}
      />,
    );
    fireEvent.click(screen.getByTestId("dsw-btn-complete"));
    act(() => vi.advanceTimersByTime(200));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(mockResult);
    // Verify card type entry shape (no top-level datasource properties)
    expect(mockResult).toHaveProperty("key");
    expect(mockResult).toHaveProperty("baseType");
    expect(mockResult).not.toHaveProperty("name");
  });

  it("closes the modal with exit animation after completion", () => {
    const mockResult = { name: "DS", schema: { version: "1.0.0", baseSystem: "blank", cardTypes: [] } };
    useDatasourceWizard.mockReturnValue(createMockWizard("create", mockResult));

    const onComplete = vi.fn();
    render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={onComplete} />);

    fireEvent.click(screen.getByTestId("dsw-btn-complete"));

    // During animation, overlay should have exiting class
    expect(screen.getByTestId("dsw-overlay")).toHaveClass("dsw-overlay--exiting");

    // onComplete fires after animation delay
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
