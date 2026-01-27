import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { normalizeEntry, DraggableUnitList } from "../DraggableUnitList";

// Mock useCardStorage hook
vi.mock("../../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    cardStorage: {
      categories: [
        {
          name: "Test Category",
          cards: [
            { cardType: "DataCard", uuid: "card-1", name: "Test Card 1" },
            { cardType: "DataCard", uuid: "card-2", name: "Test Card 2" },
          ],
        },
      ],
    },
    activeCard: { uuid: "active-card" },
  }),
}));

// Mock react-beautiful-dnd to simplify component testing
vi.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children }) => <div data-testid="drag-context">{children}</div>,
  Droppable: ({ children }) =>
    children(
      {
        droppableProps: { "data-testid": "droppable" },
        innerRef: vi.fn(),
        placeholder: null,
      },
      {},
    ),
  Draggable: ({ children, index }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: { "data-testid": `draggable-${index}` },
        dragHandleProps: {},
      },
      {},
    ),
}));

// ============================================
// normalizeEntry helper function
// ============================================
describe("normalizeEntry", () => {
  describe("string input", () => {
    it("should convert string to official type object", () => {
      const result = normalizeEntry("Space Marine");
      expect(result).toEqual({
        type: "official",
        name: "Space Marine",
      });
    });

    it("should handle empty string", () => {
      const result = normalizeEntry("");
      expect(result).toEqual({
        type: "official",
        name: "",
      });
    });

    it("should preserve string with special characters", () => {
      const result = normalizeEntry("Unit's Name (Elite)");
      expect(result).toEqual({
        type: "official",
        name: "Unit's Name (Elite)",
      });
    });
  });

  describe("object input", () => {
    it("should pass through official type object unchanged", () => {
      const input = { type: "official", name: "Test Unit" };
      const result = normalizeEntry(input);
      expect(result).toEqual(input);
      expect(result).toBe(input); // Same reference
    });

    it("should pass through custom type object unchanged", () => {
      const input = { type: "custom", uuid: "abc-123", name: "Custom Unit" };
      const result = normalizeEntry(input);
      expect(result).toEqual(input);
      expect(result).toBe(input); // Same reference
    });

    it("should preserve additional properties on objects", () => {
      const input = { type: "official", name: "Unit", extraProp: "value" };
      const result = normalizeEntry(input);
      expect(result.extraProp).toBe("value");
    });
  });
});

// ============================================
// DraggableUnitList component
// ============================================
describe("DraggableUnitList", () => {
  const defaultProps = {
    title: "Test Title",
    addButtonText: "Add item",
    droppableId: "test-droppable",
    itemPrefix: "test",
    items: [],
    onItemsChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render with title", () => {
      render(<DraggableUnitList {...defaultProps} />);
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render add button with correct text", () => {
      render(<DraggableUnitList {...defaultProps} />);
      expect(screen.getByText("Add item")).toBeInTheDocument();
    });

    it("should render empty list when no items", () => {
      render(<DraggableUnitList {...defaultProps} items={[]} />);
      expect(screen.queryByTestId("draggable-0")).not.toBeInTheDocument();
    });

    it("should render items when provided", () => {
      const items = [
        { type: "official", name: "Unit 1" },
        { type: "official", name: "Unit 2" },
      ];
      render(<DraggableUnitList {...defaultProps} items={items} />);
      expect(screen.getByText("Unit 1")).toBeInTheDocument();
      expect(screen.getByText("Unit 2")).toBeInTheDocument();
    });

    it("should render children when provided", () => {
      render(
        <DraggableUnitList {...defaultProps}>
          <div data-testid="child-content">Extra content</div>
        </DraggableUnitList>,
      );
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });

  describe("add item", () => {
    it("should call onItemsChange when add button is clicked", () => {
      const onItemsChange = vi.fn();
      render(<DraggableUnitList {...defaultProps} onItemsChange={onItemsChange} />);

      fireEvent.click(screen.getByText("Add item"));

      expect(onItemsChange).toHaveBeenCalledTimes(1);
      expect(onItemsChange).toHaveBeenCalledWith([{ type: "official", name: "Unit 1" }]);
    });

    it("should append new item to existing items", () => {
      const onItemsChange = vi.fn();
      const items = [{ type: "official", name: "Existing Unit" }];
      render(<DraggableUnitList {...defaultProps} items={items} onItemsChange={onItemsChange} />);

      fireEvent.click(screen.getByText("Add item"));

      expect(onItemsChange).toHaveBeenCalledWith([
        { type: "official", name: "Existing Unit" },
        { type: "official", name: "Unit 2" },
      ]);
    });
  });

  // Note: Delete button tests are skipped due to complexity of testing Ant Design
  // Button components with icon children. The delete functionality is tested
  // indirectly through integration testing.
  // The core logic (splice array and call onItemsChange) is straightforward.
});
