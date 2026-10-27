import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UnitComposition } from "../UnitComposition";

const mockUpdateActiveCard = vi.fn();
let mockActiveCard;

vi.mock("../../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard,
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

vi.mock("../../../CustomMarkdownEditor", () => ({
  CustomMarkdownEditor: ({ value, onChange }) => (
    <textarea data-testid="composition-input" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) => children({ droppableProps: {}, innerRef: vi.fn(), placeholder: null }, {}),
  Draggable: ({ children }) => children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }, {}),
}));

const COMPOSITION = ["1 Team Leader", "OR", "2 Marksmen", "OR", "3 Riflemen"];

const lastUpdate = () => mockUpdateActiveCard.mock.calls.at(-1)[0];

describe("UnitComposition", () => {
  beforeEach(() => {
    mockUpdateActiveCard.mockClear();
    mockActiveCard = { name: "Kill Team", composition: [...COMPOSITION] };
  });

  it("adds exactly one empty entry", () => {
    render(<UnitComposition />);

    fireEvent.click(screen.getByText("Add composition option"));

    expect(mockUpdateActiveCard).toHaveBeenCalledTimes(1);
    expect(lastUpdate()).toEqual({ name: "Kill Team", composition: [...COMPOSITION, ""] });
  });

  it("removes only the deleted entry", async () => {
    const { container } = render(<UnitComposition />);

    fireEvent.click(container.querySelectorAll(".ant-card-extra button")[1]);
    fireEvent.click(await screen.findByText("OK"));

    expect(mockUpdateActiveCard).toHaveBeenCalledTimes(1);
    expect(lastUpdate()).toEqual({
      name: "Kill Team",
      composition: ["1 Team Leader", "2 Marksmen", "OR", "3 Riflemen"],
    });
  });

  it("changes only the edited entry", () => {
    render(<UnitComposition />);

    fireEvent.change(screen.getAllByTestId("composition-input")[2], { target: { value: "2 Snipers" } });

    expect(lastUpdate()).toEqual({
      name: "Kill Team",
      composition: ["1 Team Leader", "OR", "2 Snipers", "OR", "3 Riflemen"],
    });
  });
});
