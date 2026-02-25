import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnitConfigModal } from "../UnitConfigModal";

// Mock hooks
vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: {
      data: [
        {
          id: "faction-1",
          detachments: [{ name: "Det A" }, { name: "Det B" }],
          enhancements: [
            {
              name: "Enhancement 1",
              cost: 20,
              keywords: ["Character"],
              detachment: "Det A",
            },
            {
              name: "Enhancement 2",
              cost: 15,
              keywords: ["Character"],
              detachment: "Det B",
            },
          ],
        },
      ],
    },
  }),
}));

const mockUpdateSettings = vi.fn();
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({
    settings: {},
    updateSettings: mockUpdateSettings,
  }),
}));

// Mock ReactDOM.createPortal
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node) => node,
  };
});

const baseCard = {
  name: "Test Unit",
  uuid: "card-uuid-1",
  id: "unit-1",
  faction_id: "faction-1",
  source: "40k-10e",
  cardType: "DataCard",
  keywords: [],
  factions: [],
  points: [
    { models: 5, cost: 90, active: true },
    { models: 10, cost: 170, active: true },
  ],
};

const baseCategory = {
  uuid: "cat-1",
  type: "list",
  cards: [],
};

describe("UnitConfigModal", () => {
  let modalRoot;

  beforeEach(() => {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
    document.body.style.overflow = "";
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <UnitConfigModal isOpen={false} onClose={vi.fn()} card={baseCard} category={baseCategory} onSave={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders modal content when isOpen is true", () => {
    render(
      <UnitConfigModal isOpen={true} onClose={vi.fn()} card={baseCard} category={baseCategory} onSave={vi.fn()} />,
    );
    expect(screen.getByText("Update Test Unit")).toBeInTheDocument();
    expect(screen.getByText("5 models")).toBeInTheDocument();
    expect(screen.getByText("10 models")).toBeInTheDocument();
    expect(screen.getByText("Set unit values")).toBeInTheDocument();
  });

  it("calls onClose on Escape key press", () => {
    const onClose = vi.fn();
    render(
      <UnitConfigModal isOpen={true} onClose={onClose} card={baseCard} category={baseCategory} onSave={vi.fn()} />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on backdrop click", () => {
    const onClose = vi.fn();
    render(
      <UnitConfigModal isOpen={true} onClose={onClose} card={baseCard} category={baseCategory} onSave={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId("ucm-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside modal", () => {
    const onClose = vi.fn();
    render(
      <UnitConfigModal isOpen={true} onClose={onClose} card={baseCard} category={baseCategory} onSave={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId("ucm-modal"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("disables submit when no unit size is selected", () => {
    const card = { ...baseCard, points: [{ models: 5, cost: 90, active: true }] };
    // Card has only 1 point option, so it auto-selects; use a card with no pre-selection
    const multiCard = { ...baseCard };
    render(
      <UnitConfigModal isOpen={true} onClose={vi.fn()} card={multiCard} category={baseCategory} onSave={vi.fn()} />,
    );
    // When no unitSize is set on the card and there are multiple options, submit should be disabled
    const submitBtn = screen.getByText("Set unit values");
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit when a unit size is selected", () => {
    const card = { ...baseCard, unitSize: { models: 5, cost: 90, active: true } };
    render(<UnitConfigModal isOpen={true} onClose={vi.fn()} card={card} category={baseCategory} onSave={vi.fn()} />);
    const submitBtn = screen.getByText("Set unit values");
    expect(submitBtn).not.toBeDisabled();
  });

  it("calls onSave with correct shape on submit", () => {
    const onSave = vi.fn();
    const card = { ...baseCard, unitSize: { models: 5, cost: 90, active: true } };
    render(<UnitConfigModal isOpen={true} onClose={vi.fn()} card={card} category={baseCategory} onSave={onSave} />);
    fireEvent.click(screen.getByText("Set unit values"));
    expect(onSave).toHaveBeenCalledTimes(1);
    const savedCard = onSave.mock.calls[0][0];
    expect(savedCard).toHaveProperty("unitSize");
    expect(savedCard).toHaveProperty("isWarlord");
    expect(savedCard).toHaveProperty("name", "Test Unit");
  });

  it("shows warlord section for Character keywords", () => {
    const card = { ...baseCard, keywords: ["Character"], unitSize: { models: 5, cost: 90 } };
    render(<UnitConfigModal isOpen={true} onClose={vi.fn()} card={card} category={baseCategory} onSave={vi.fn()} />);
    const warlordElements = screen.getAllByText("Warlord");
    expect(warlordElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows single model text for unit size with 1 model", () => {
    const card = {
      ...baseCard,
      points: [{ models: 1, cost: 50, active: true }],
    };
    render(<UnitConfigModal isOpen={true} onClose={vi.fn()} card={card} category={baseCategory} onSave={vi.fn()} />);
    expect(screen.getByText("1 model")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <UnitConfigModal isOpen={true} onClose={onClose} card={baseCard} category={baseCategory} onSave={vi.fn()} />,
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll when open", () => {
    render(
      <UnitConfigModal isOpen={true} onClose={vi.fn()} card={baseCard} category={baseCategory} onSave={vi.fn()} />,
    );
    expect(document.body.style.overflow).toBe("hidden");
  });
});
