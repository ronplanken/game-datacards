import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CardStylingInfo } from "../CardStylingInfo";

// Mock window.matchMedia for Ant Design components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock useCardStorage hook
const mockUpdateActiveCard = vi.fn();
vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: {
      styling: {
        width: 300,
        height: 500,
        textSize: 14,
        lineHeight: 1.2,
      },
    },
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

describe("CardStylingInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render Card section title", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("Card")).toBeInTheDocument();
    });

    it("should render Content section title", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should render Width label", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("Width")).toBeInTheDocument();
    });

    it("should render Height label", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("Height")).toBeInTheDocument();
    });

    it("should render Text size label", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("Text size")).toBeInTheDocument();
    });

    it("should render Line height label", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("Line height")).toBeInTheDocument();
    });
  });

  describe("default values", () => {
    it("should use default width of 260 when not specified", () => {
      render(<CardStylingInfo />);
      // Default marker for width should be shown
      expect(screen.getByText("260")).toBeInTheDocument();
    });

    it("should use default height of 458 when not specified", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("458")).toBeInTheDocument();
    });

    it("should use default text size of 16 when not specified", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("16")).toBeInTheDocument();
    });

    it("should use default line height of 1 when not specified", () => {
      render(<CardStylingInfo />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("custom defaults", () => {
    it("should accept custom default values", () => {
      const customDefaults = {
        width: 400,
        height: 600,
        textSize: 20,
        lineHeight: 1.5,
      };
      render(<CardStylingInfo defaults={customDefaults} />);

      // Custom markers should be shown
      expect(screen.getByText("400")).toBeInTheDocument();
      expect(screen.getByText("600")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("1.5")).toBeInTheDocument();
    });
  });
});
