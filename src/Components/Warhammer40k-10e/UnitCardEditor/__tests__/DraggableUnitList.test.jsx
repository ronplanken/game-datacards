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

  describe("delete item", () => {
    it("should call onItemsChange when delete button is clicked", () => {
      const onItemsChange = vi.fn();
      const items = [{ type: "official", name: "Unit 1" }];
      render(<DraggableUnitList {...defaultProps} items={items} onItemsChange={onItemsChange} />);

      // Find and click the delete button (it's the Button with Trash2 icon)
      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) => btn.className.includes("ant-btn-text"));
      fireEvent.click(deleteButton);

      expect(onItemsChange).toHaveBeenCalledTimes(1);
      expect(onItemsChange).toHaveBeenCalledWith([]);
    });

    it("should remove correct item when deleting from list with multiple items", () => {
      const onItemsChange = vi.fn();
      const items = [
        { type: "official", name: "Unit 1" },
        { type: "official", name: "Unit 2" },
        { type: "official", name: "Unit 3" },
      ];
      render(<DraggableUnitList {...defaultProps} items={items} onItemsChange={onItemsChange} />);

      // Find all delete buttons and click the first one
      const deleteButtons = screen.getAllByRole("button").filter((btn) => btn.className.includes("ant-btn-text"));
      fireEvent.click(deleteButtons[0]);

      expect(onItemsChange).toHaveBeenCalledWith([
        { type: "official", name: "Unit 2" },
        { type: "official", name: "Unit 3" },
      ]);
    });
  });

  describe("type switching", () => {
    it("should switch from Official to Custom type", () => {
      const onItemsChange = vi.fn();
      const items = [{ type: "official", name: "Test Unit" }];
      render(<DraggableUnitList {...defaultProps} items={items} onItemsChange={onItemsChange} />);

      // Find the Custom option in the Segmented control and click it
      const customOption = screen.getByText("Custom");
      fireEvent.click(customOption);

      expect(onItemsChange).toHaveBeenCalledTimes(1);
      // Should switch to custom type with first available card
      const call = onItemsChange.mock.calls[0][0];
      expect(call[0].type).toBe("custom");
    });

    it("should switch from Custom to Official type and preserve name", () => {
      const onItemsChange = vi.fn();
      const items = [{ type: "custom", uuid: "card-1", name: "Custom Card Name" }];
      render(<DraggableUnitList {...defaultProps} items={items} onItemsChange={onItemsChange} />);

      // Find and click the Official option
      const officialOption = screen.getByText("Official");
      fireEvent.click(officialOption);

      expect(onItemsChange).toHaveBeenCalledWith([{ type: "official", name: "Custom Card Name" }]);
    });

    it("should show Select dropdown for Custom type items", () => {
      const items = [{ type: "custom", uuid: "card-1", name: "Test Card 1" }];
      render(<DraggableUnitList {...defaultProps} items={items} />);

      // Should have a Select component (combobox role) for custom type
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should show editable Typography for Official type items", () => {
      const items = [{ type: "official", name: "Editable Name" }];
      render(<DraggableUnitList {...defaultProps} items={items} />);

      // Should show the text content
      expect(screen.getByText("Editable Name")).toBeInTheDocument();
    });
  });

  describe("custom card selection", () => {
    it("should call onItemsChange when selecting a custom card", async () => {
      const onItemsChange = vi.fn();
      const items = [{ type: "custom", uuid: "card-1", name: "Test Card 1" }];
      render(<DraggableUnitList {...defaultProps} items={items} onItemsChange={onItemsChange} />);

      // Find and click the select dropdown
      const selectBox = screen.getByRole("combobox");
      fireEvent.mouseDown(selectBox);

      // Wait for dropdown options to appear and select one
      const option = await screen.findByText(/Test Card 2/);
      fireEvent.click(option);

      expect(onItemsChange).toHaveBeenCalledTimes(1);
      const call = onItemsChange.mock.calls[0][0];
      expect(call[0].type).toBe("custom");
      expect(call[0].uuid).toBe("card-2");
      expect(call[0].name).toBe("Test Card 2");
    });
  });
});
