import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock useCategorySharing
const mockShareAnonymous = vi.fn();
const mockShareOwned = vi.fn();
const mockUpdateShare = vi.fn();
const mockGetExistingShare = vi.fn();

vi.mock("../../Hooks/useCategorySharing", () => ({
  useCategorySharing: () => ({
    shareAnonymous: mockShareAnonymous,
    shareOwned: mockShareOwned,
    updateShare: mockUpdateShare,
    getExistingShare: mockGetExistingShare,
    isSharing: false,
  }),
}));

// Mock useCardStorage
vi.mock("../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCategory: {
      name: "Test Category",
      uuid: "cat-uuid-123",
      type: "category",
      cards: [{ name: "Unit 1" }, { name: "Unit 2" }],
    },
  }),
}));

// Mock useAuth - default to not authenticated
let mockIsAuthenticated = false;
vi.mock("../../Premium", () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

// Mock Toast
vi.mock("../Toast/message", () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { ShareModal } from "../ShareModal";

describe("ShareModal", () => {
  beforeEach(() => {
    mockShareAnonymous.mockReset();
    mockShareOwned.mockReset();
    mockUpdateShare.mockReset();
    mockGetExistingShare.mockReset();
    mockIsAuthenticated = false;
    mockGetExistingShare.mockResolvedValue(null);
  });

  it("renders the share trigger button", () => {
    render(<ShareModal />);
    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("opens dropdown on click", async () => {
    const user = userEvent.setup();
    render(<ShareModal />);

    await user.click(screen.getByText("Share"));

    expect(screen.getByText("Test Category")).toBeInTheDocument();
    expect(screen.getByText("2 cards")).toBeInTheDocument();
  });

  it("shows Generate Link button when not authenticated", async () => {
    const user = userEvent.setup();
    render(<ShareModal />);

    await user.click(screen.getByText("Share"));

    expect(screen.getByText("Generate Link")).toBeInTheDocument();
  });

  it("calls shareAnonymous when not authenticated", async () => {
    mockShareAnonymous.mockResolvedValue({ success: true, shareId: "anon-share-123" });
    const user = userEvent.setup();
    render(<ShareModal />);

    await user.click(screen.getByText("Share"));
    await user.click(screen.getByText("Generate Link"));

    await waitFor(() => {
      expect(mockShareAnonymous).toHaveBeenCalled();
    });
  });

  it("shows anonymous note when not authenticated", async () => {
    const user = userEvent.setup();
    render(<ShareModal />);

    await user.click(screen.getByText("Share"));

    expect(screen.getByText("Links are snapshots and won\u0027t auto-update")).toBeInTheDocument();
  });

  it("shows authenticated note when logged in", async () => {
    mockIsAuthenticated = true;
    const user = userEvent.setup();
    render(<ShareModal />);

    await user.click(screen.getByText("Share"));

    expect(screen.getByText("You can update this share later from your account menu")).toBeInTheDocument();
  });

  it("closes on escape key", async () => {
    const user = userEvent.setup();
    render(<ShareModal />);

    await user.click(screen.getByText("Share"));
    expect(screen.getByText("Test Category")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByText("Test Category")).not.toBeInTheDocument();
    });
  });
});
