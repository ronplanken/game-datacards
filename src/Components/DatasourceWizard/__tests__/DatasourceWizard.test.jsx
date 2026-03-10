import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DatasourceWizard } from "../index";

describe("DatasourceWizard", () => {
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
  });

  it("does not render when open is false", () => {
    render(<DatasourceWizard open={false} onClose={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.queryByTestId("dsw-overlay")).not.toBeInTheDocument();
  });

  it("renders the modal when open is true", () => {
    render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByTestId("dsw-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("dsw-modal")).toBeInTheDocument();
  });

  describe("create mode (no existingDatasource)", () => {
    it("displays 'Create Datasource' as the header title", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      expect(screen.getByText("Create Datasource")).toBeInTheDocument();
    });

    it("displays the correct subtitle", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      expect(screen.getByText("Define the structure for your custom game system")).toBeInTheDocument();
    });

    it("shows the step badge with correct step count", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      // Create mode starts with metadata, base-system, card-type, review = 4 steps (no baseType yet)
      expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument();
    });
  });

  describe("add-card-type mode", () => {
    const existingDatasource = {
      name: "Test DS",
      schema: { cardTypes: [{ baseType: "unit", key: "infantry", label: "Infantry" }] },
    };

    it("displays 'Add Card Type' as the header title", () => {
      render(
        <DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} existingDatasource={existingDatasource} />,
      );
      expect(screen.getByText("Add Card Type")).toBeInTheDocument();
    });

    it("displays the correct subtitle for add-card-type mode", () => {
      render(
        <DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} existingDatasource={existingDatasource} />,
      );
      expect(screen.getByText("Add a new card type to your datasource")).toBeInTheDocument();
    });

    it("shows correct step count (card-type + review = 2)", () => {
      render(
        <DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} existingDatasource={existingDatasource} />,
      );
      expect(screen.getByText(/Step 1 of 2/)).toBeInTheDocument();
    });
  });

  describe("sidebar", () => {
    it("renders the sidebar with step indicators", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      expect(screen.getByTestId("dsw-sidebar")).toBeInTheDocument();
    });

    it("highlights the current step", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      const sidebar = screen.getByTestId("dsw-sidebar");
      const firstItem = sidebar.querySelector(".dsw-sidebar-item--active");
      expect(firstItem).toBeInTheDocument();
      expect(firstItem).toHaveTextContent("Datasource Info");
    });

    it("reflects the dynamic step list in create mode", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      const sidebar = screen.getByTestId("dsw-sidebar");
      const items = sidebar.querySelectorAll(".dsw-sidebar-item");
      // Create mode without baseType: metadata, base-system, card-type, review = 4
      expect(items).toHaveLength(4);
      const titles = Array.from(items).map((item) => item.querySelector(".dsw-sidebar-title").textContent);
      expect(titles).toEqual(["Datasource Info", "Base System", "Card Type", "Review"]);
    });

    it("reflects a different step list in add-card-type mode", () => {
      const existingDatasource = { name: "Test", schema: { cardTypes: [] } };
      render(
        <DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} existingDatasource={existingDatasource} />,
      );
      const sidebar = screen.getByTestId("dsw-sidebar");
      const items = sidebar.querySelectorAll(".dsw-sidebar-item");
      // Add-card-type mode without baseType: card-type, review = 2
      expect(items).toHaveLength(2);
      const titles = Array.from(items).map((item) => item.querySelector(".dsw-sidebar-title").textContent);
      expect(titles).toEqual(["Card Type", "Review"]);
    });

    it("highlights the first step as active in add-card-type mode", () => {
      const existingDatasource = { name: "Test", schema: { cardTypes: [] } };
      render(
        <DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} existingDatasource={existingDatasource} />,
      );
      const sidebar = screen.getByTestId("dsw-sidebar");
      const activeItem = sidebar.querySelector(".dsw-sidebar-item--active");
      expect(activeItem).toBeInTheDocument();
      expect(activeItem).toHaveTextContent("Card Type");
    });

    it("shows step numbers in sidebar markers", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      const sidebar = screen.getByTestId("dsw-sidebar");
      const markers = sidebar.querySelectorAll(".dsw-sidebar-marker");
      expect(markers).toHaveLength(4);
      expect(markers[0]).toHaveTextContent("1");
      expect(markers[1]).toHaveTextContent("2");
      expect(markers[2]).toHaveTextContent("3");
      expect(markers[3]).toHaveTextContent("4");
    });
  });

  describe("footer navigation", () => {
    it("shows Cancel button on the first step", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      expect(screen.getByTestId("dsw-btn-cancel")).toBeInTheDocument();
      expect(screen.queryByTestId("dsw-btn-previous")).not.toBeInTheDocument();
    });

    it("shows Next button (disabled when cannot proceed)", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      const nextBtn = screen.getByTestId("dsw-btn-next");
      expect(nextBtn).toBeInTheDocument();
      // Metadata step requires name, so canProceed is false initially
      expect(nextBtn).toBeDisabled();
    });

    it("calls onClose when Cancel is clicked (after animation)", () => {
      const onClose = vi.fn();
      render(<DatasourceWizard open={true} onClose={onClose} onComplete={vi.fn()} />);
      fireEvent.click(screen.getByTestId("dsw-btn-cancel"));
      expect(onClose).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(200));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when overlay is clicked (after animation)", () => {
      const onClose = vi.fn();
      render(<DatasourceWizard open={true} onClose={onClose} onComplete={vi.fn()} />);
      fireEvent.click(screen.getByTestId("dsw-overlay"));
      expect(onClose).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(200));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("progress bar", () => {
    it("renders a progress bar", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      const progressBar = document.querySelector(".dsw-progress-bar");
      expect(progressBar).toBeInTheDocument();
      // Step 1 of 4 = 25%
      expect(progressBar.style.width).toBe("25%");
    });
  });

  describe("step transitions", () => {
    it("renders step content with transition wrapper", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      const stepContent = document.querySelector(".dsw-step-content");
      expect(stepContent).toBeInTheDocument();
    });

    it("shows placeholder content for unimplemented steps", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      expect(screen.getByTestId("dsw-step-metadata")).toBeInTheDocument();
      expect(screen.getByText("This step will be implemented in a later phase.")).toBeInTheDocument();
    });
  });

  describe("keyboard navigation", () => {
    it("closes on Escape key", () => {
      const onClose = vi.fn();
      render(<DatasourceWizard open={true} onClose={onClose} onComplete={vi.fn()} />);
      fireEvent.keyDown(document, { key: "Escape" });
      act(() => vi.advanceTimersByTime(200));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("completion action", () => {
    it("does not show complete button when not on the last step", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      // On the first step (metadata), should show Next, not Complete
      expect(screen.queryByTestId("dsw-btn-complete")).not.toBeInTheDocument();
      expect(screen.getByTestId("dsw-btn-next")).toBeInTheDocument();
    });

    it("header shows 'Add Card Type' in add-card-type mode", () => {
      const existingDatasource = { name: "Test", schema: { cardTypes: [] } };
      render(
        <DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} existingDatasource={existingDatasource} />,
      );
      expect(screen.getByText("Add Card Type")).toBeInTheDocument();
    });

    it("header shows 'Create Datasource' in create mode", () => {
      render(<DatasourceWizard open={true} onClose={vi.fn()} onComplete={vi.fn()} />);
      expect(screen.getByText("Create Datasource")).toBeInTheDocument();
    });
  });
});
