import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MobileListForgeImporter } from "../MobileListForgeImporter";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn(() => `uuid-${Math.random().toString(36).slice(2, 8)}`),
}));

// Mock ReactDOM.createPortal to render inline
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node) => node,
  };
});

// Mock useMobileList
const mockCreateListWithCards = vi.fn();
vi.mock("../../useMobileList", () => ({
  useMobileList: () => ({
    createListWithCards: mockCreateListWithCards,
  }),
}));

// Mock useDataSourceStorage
vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: {
      data: [
        {
          id: "BA",
          name: "Blood Angels",
          datasheets: [
            { id: "ds-1", name: "Captain", rangedWeapons: [], meleeWeapons: [] },
            { id: "ds-2", name: "Intercessors", rangedWeapons: [], meleeWeapons: [] },
          ],
          enhancements: [],
          detachments: [],
        },
      ],
    },
  }),
}));

// Mock useUmami
vi.mock("../../../../Hooks/useUmami", () => ({
  useUmami: () => ({
    trackEvent: vi.fn(),
  }),
}));

// Mock message
vi.mock("../../../Toast/message", () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Create a valid Listforge JSON export
const createValidExport = (overrides = {}) => ({
  id: "roster-1",
  name: "My Blood Angels",
  generatedBy: "List Forge",
  gameSystemId: "sys-40k",
  gameSystemName: "Warhammer 40,000",
  roster: {
    name: "Blood Angels Roster",
    costs: [{ name: "pts", typeId: "points", value: 200 }],
    forces: [
      {
        id: "force-1",
        name: "Gladius Task Force",
        catalogueName: "Blood Angels",
        selections: [
          {
            name: "Captain",
            type: "unit",
            number: 1,
            costs: [{ name: "pts", typeId: "points", value: 100 }],
            categories: [{ id: "cat-char", name: "Character", primary: true }],
            profiles: [],
            selections: [],
            rules: [],
          },
        ],
      },
    ],
  },
  ...overrides,
});

describe("MobileListForgeImporter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Create modal-root for portals
    if (!document.getElementById("modal-root")) {
      const root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
  });

  it("renders upload step when opened", () => {
    render(<MobileListForgeImporter isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Import an army list exported from List Forge/)).toBeTruthy();
    expect(screen.getByText("Choose JSON file")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<MobileListForgeImporter isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/Import an army list exported from List Forge/)).toBeNull();
  });

  it("shows error for invalid JSON text", () => {
    render(<MobileListForgeImporter isOpen={true} onClose={vi.fn()} />);

    const textarea = screen.getByPlaceholderText("Paste List Forge JSON export here...");
    fireEvent.change(textarea, { target: { value: "not valid json" } });

    const parseButton = screen.getByText("Parse JSON");
    fireEvent.click(parseButton);

    expect(screen.getByText("Invalid JSON text")).toBeTruthy();
  });

  it("shows validation error for non-Listforge JSON", () => {
    render(<MobileListForgeImporter isOpen={true} onClose={vi.fn()} />);

    const textarea = screen.getByPlaceholderText("Paste List Forge JSON export here...");
    fireEvent.change(textarea, { target: { value: JSON.stringify({ foo: "bar" }) } });

    const parseButton = screen.getByText("Parse JSON");
    fireEvent.click(parseButton);

    expect(screen.getByText(/Not a supported export/)).toBeTruthy();
  });

  it("parses valid JSON and shows file info", () => {
    const validData = createValidExport();

    render(<MobileListForgeImporter isOpen={true} onClose={vi.fn()} />);

    const textarea = screen.getByPlaceholderText("Paste List Forge JSON export here...");
    fireEvent.change(textarea, { target: { value: JSON.stringify(validData) } });

    const parseButton = screen.getByText("Parse JSON");
    fireEvent.click(parseButton);

    // After parsing JSON text, the file should be set (no file info with name, but the Continue button appears)
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("advances to review step after parsing valid file data", async () => {
    const validData = createValidExport();

    render(<MobileListForgeImporter isOpen={true} onClose={vi.fn()} />);

    const textarea = screen.getByPlaceholderText("Paste List Forge JSON export here...");
    fireEvent.change(textarea, { target: { value: JSON.stringify(validData) } });

    // Parse the JSON text first
    fireEvent.click(screen.getByText("Parse JSON"));

    // Now click Continue to advance to review
    fireEvent.click(screen.getByText("Continue"));

    // Should now show review step with Back button
    expect(screen.getByText("Back")).toBeTruthy();
  });

  it("navigates back from review to upload", async () => {
    const validData = createValidExport();

    render(<MobileListForgeImporter isOpen={true} onClose={vi.fn()} />);

    const textarea = screen.getByPlaceholderText("Paste List Forge JSON export here...");
    fireEvent.change(textarea, { target: { value: JSON.stringify(validData) } });
    fireEvent.click(screen.getByText("Parse JSON"));
    fireEvent.click(screen.getByText("Continue"));

    // Should be on review step
    expect(screen.getByText("Back")).toBeTruthy();

    // Navigate back
    fireEvent.click(screen.getByText("Back"));

    // Should be back on upload step
    expect(screen.getByText(/Import an army list exported from List Forge/)).toBeTruthy();
  });

  it("shows mode toggle on review step", async () => {
    const validData = createValidExport();

    render(<MobileListForgeImporter isOpen={true} onClose={vi.fn()} />);

    const textarea = screen.getByPlaceholderText("Paste List Forge JSON export here...");
    fireEvent.change(textarea, { target: { value: JSON.stringify(validData) } });
    fireEvent.click(screen.getByText("Parse JSON"));
    fireEvent.click(screen.getByText("Continue"));

    expect(screen.getByText("Match")).toBeTruthy();
    expect(screen.getByText("Direct")).toBeTruthy();
  });

  it("resets state when closed", () => {
    const onClose = vi.fn();
    const { rerender } = render(<MobileListForgeImporter isOpen={true} onClose={onClose} />);

    const textarea = screen.getByPlaceholderText("Paste List Forge JSON export here...");
    fireEvent.change(textarea, { target: { value: JSON.stringify(createValidExport()) } });
    fireEvent.click(screen.getByText("Parse JSON"));

    // Re-render as closed then open again
    rerender(<MobileListForgeImporter isOpen={false} onClose={onClose} />);
    rerender(<MobileListForgeImporter isOpen={true} onClose={onClose} />);

    // Should be back to upload step (note: state persists in component, but closing resets)
    expect(screen.getByText(/Import an army list exported from List Forge/)).toBeTruthy();
  });
});
