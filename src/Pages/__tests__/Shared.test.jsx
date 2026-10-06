import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Mock useCategorySharing
const mockGetSharedCategory = vi.fn();
vi.mock("../../Hooks/useCategorySharing", () => ({
  useCategorySharing: () => ({
    getSharedCategory: mockGetSharedCategory,
  }),
}));

// Mock useCardStorage
const mockImportCategory = vi.fn();
vi.mock("../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    importCategory: mockImportCategory,
  }),
}));

// Mock useAutoFitScale
vi.mock("../../Hooks/useAutoFitScale", () => ({
  useAutoFitScale: () => ({ autoScale: 1 }),
}));

// Mock antd Image
vi.mock("antd", () => ({
  Image: ({ src, ...props }) => <img src={src} {...props} />,
}));

// Mock resizable panels
vi.mock("react-resizable-panels", () => ({
  Panel: ({ children }) => <div>{children}</div>,
  PanelGroup: ({ children }) => <div>{children}</div>,
  PanelResizeHandle: () => <div />,
}));

// Mock react-swipeable
vi.mock("react-swipeable", () => ({
  useSwipeable: () => ({}),
}));

// Mock shared components
vi.mock("../../Components/Shared/SharedCardDisplay", () => ({
  SharedCardDisplay: ({ card }) => <div data-testid="card-display">{card?.name || "No card"}</div>,
}));
vi.mock("../../Components/Shared/SharedCardList", () => ({
  SharedCardList: () => <div data-testid="card-list" />,
}));
vi.mock("../../Components/Shared/SharedMobileNav", () => ({
  SharedMobileNav: () => <div data-testid="mobile-nav" />,
}));
vi.mock("../../Components/Shared/SharedMobileCardList", () => ({
  SharedMobileCardList: () => <div data-testid="mobile-card-list" />,
}));
vi.mock("../../Components/Viewer/Mobile/BottomSheet", () => ({
  BottomSheet: () => null,
}));

// Ensure we stay in desktop mode
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Must import Shared after all mocks are set up
const { Shared } = await import("../../Pages/Shared");

const renderShared = (shareId = "test-share-id") => {
  return render(
    <MemoryRouter initialEntries={[`/shared/${shareId}`]}>
      <Routes>
        <Route path="/shared/:Id" element={<Shared />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("Shared page", () => {
  beforeEach(() => {
    mockGetSharedCategory.mockReset();
    mockImportCategory.mockReset();
  });

  it("shows loading state initially", () => {
    mockGetSharedCategory.mockReturnValue(new Promise(() => {})); // never resolves
    renderShared();
    expect(screen.getByText("Loading shared cards...")).toBeInTheDocument();
  });

  it("shows error when shared link not found", async () => {
    mockGetSharedCategory.mockResolvedValue(null);
    renderShared();

    await waitFor(() => {
      expect(screen.getByText("Unable to Load")).toBeInTheDocument();
    });
    expect(screen.getByText("This shared link could not be found.")).toBeInTheDocument();
  });

  it("shows error on fetch failure", async () => {
    mockGetSharedCategory.mockRejectedValue(new Error("fail"));
    renderShared();

    await waitFor(() => {
      expect(screen.getByText("Unable to Load")).toBeInTheDocument();
    });
    expect(screen.getByText("Failed to load the shared content.")).toBeInTheDocument();
  });

  it("renders shared category content", async () => {
    mockGetSharedCategory.mockResolvedValue({
      category: {
        name: "My Army",
        cards: [{ name: "Unit 1", source: "40k-10e" }],
      },
      views: 10,
    });

    renderShared();

    await waitFor(() => {
      expect(screen.getByText("My Army")).toBeInTheDocument();
    });
  });

  it("does not render like button (removed)", async () => {
    mockGetSharedCategory.mockResolvedValue({
      category: {
        name: "My Army",
        cards: [{ name: "Unit 1" }],
      },
      views: 5,
      likes: 10,
    });

    renderShared();

    await waitFor(() => {
      expect(screen.getByText("My Army")).toBeInTheDocument();
    });

    expect(screen.queryByText("Like")).not.toBeInTheDocument();
    expect(screen.queryByText("Liked")).not.toBeInTheDocument();
  });

  it("renders clone button", async () => {
    mockGetSharedCategory.mockResolvedValue({
      category: {
        name: "My Army",
        cards: [{ name: "Unit 1" }],
      },
      views: 5,
    });

    renderShared();

    await waitFor(() => {
      expect(screen.getByText("Clone")).toBeInTheDocument();
    });
  });

  it("calls getSharedCategory with share ID from URL", async () => {
    mockGetSharedCategory.mockResolvedValue(null);
    renderShared("abc123");

    await waitFor(() => {
      expect(mockGetSharedCategory).toHaveBeenCalledWith("abc123");
    });
  });
});
