import { render, screen, fireEvent } from "@testing-library/react";
import { ListOverview } from "../ListOverview";

const mocks = vi.hoisted(() => ({
  deleteList: vi.fn(),
  deleteConfirmDialog: vi.fn(),
  state: {
    mobileList: null,
    cloudCategories: [],
  },
}));

vi.mock("../../useMobileList", () => ({
  useMobileList: () => mocks.state.mobileList,
}));

vi.mock("../../../DeleteConfirmModal", () => ({
  deleteConfirmDialog: (...args) => mocks.deleteConfirmDialog(...args),
}));

// Render modal children inline so we can query the header/menu directly
vi.mock("../../Mobile/MobileModal", () => ({
  MobileModal: ({ isOpen, children, title }) =>
    isOpen ? (
      <div data-testid="mobile-modal">
        <span>{title}</span>
        {children}
      </div>
    ) : null,
}));

vi.mock("../ListSelector", () => ({ ListSelector: () => null }));
vi.mock("../ListEditCard", () => ({ ListEditCard: () => null }));
vi.mock("../../MobileImporter", () => ({
  MobileGwImporter: () => null,
  MobileListForgeImporter: () => null,
}));
vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: { data: [] } }),
}));
vi.mock("../../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { selectedDataSource: "40k-10e" }, updateSettings: vi.fn() }),
}));
vi.mock("../../../../Premium", () => ({
  useCloudCategories: () => ({ categories: mocks.state.cloudCategories }),
  useAuth: () => ({ isAuthenticated: false }),
  ListSyncButton: () => null,
}));
vi.mock("../../../../Hooks/useCategorySharing", () => ({
  useCategorySharing: () => ({
    shareAnonymous: vi.fn(),
    shareOwned: vi.fn(),
    updateShare: vi.fn(),
    getExistingShare: vi.fn(() => Promise.resolve(null)),
    isSharing: false,
  }),
}));
vi.mock("../../../Toast/message", () => ({
  message: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: {}, pathname: "/mobile" }),
}));

const makeList = (uuid, name) => ({ uuid, name, type: "list", dataSource: "40k-10e", cards: [] });

const openMoreMenu = (container) => {
  const moreButton = container.querySelector(".list-overview-more-button");
  fireEvent.click(moreButton);
};

describe("ListOverview - delete list menu", () => {
  beforeEach(() => {
    mocks.deleteList.mockClear();
    mocks.deleteConfirmDialog.mockClear();
    mocks.state.cloudCategories = [];
    mocks.state.mobileList = {
      lists: [makeList("a", "Default"), makeList("b", "Second")],
      selectedList: 0,
      removeDatacard: vi.fn(),
      deleteList: mocks.deleteList,
      selectedCloudCategoryId: null,
    };
  });

  it("shows Delete List in the more menu when multiple local lists exist", () => {
    const { container } = render(<ListOverview isVisible={true} setIsVisible={vi.fn()} />);
    expect(screen.queryByText("Delete List")).not.toBeInTheDocument();
    openMoreMenu(container);
    expect(screen.getByText("Delete List")).toBeInTheDocument();
  });

  it("hides Delete List when only one list exists", () => {
    mocks.state.mobileList.lists = [makeList("a", "Default")];
    const { container } = render(<ListOverview isVisible={true} setIsVisible={vi.fn()} />);
    openMoreMenu(container);
    expect(screen.queryByText("Delete List")).not.toBeInTheDocument();
    // Copy List is still available
    expect(screen.getByText("Copy List")).toBeInTheDocument();
  });

  it("hides Delete List (and Share List) for cloud categories", () => {
    mocks.state.cloudCategories = [{ uuid: "c1", name: "Cloud Cat", gameSystem: "40k", cards: [] }];
    mocks.state.mobileList.selectedCloudCategoryId = "c1";
    const { container } = render(<ListOverview isVisible={true} setIsVisible={vi.fn()} />);
    openMoreMenu(container);
    expect(screen.queryByText("Delete List")).not.toBeInTheDocument();
    expect(screen.queryByText("Share List")).not.toBeInTheDocument();
    expect(screen.getByText("Copy List")).toBeInTheDocument();
  });

  it("opens the confirmation dialog with the current list name when Delete List is clicked", () => {
    const { container } = render(<ListOverview isVisible={true} setIsVisible={vi.fn()} />);
    openMoreMenu(container);
    fireEvent.click(screen.getByText("Delete List"));

    expect(mocks.deleteConfirmDialog).toHaveBeenCalledTimes(1);
    const arg = mocks.deleteConfirmDialog.mock.calls[0][0];
    expect(arg.title).toBe('Delete "Default"?');
    expect(arg.content).toBe("This list will be permanently deleted.");
    // Deletion is deferred until the user confirms
    expect(mocks.deleteList).not.toHaveBeenCalled();
  });

  it("deletes the selected list only after the confirmation is accepted", () => {
    mocks.state.mobileList.selectedList = 1;
    const { container } = render(<ListOverview isVisible={true} setIsVisible={vi.fn()} />);
    openMoreMenu(container);
    fireEvent.click(screen.getByText("Delete List"));

    const arg = mocks.deleteConfirmDialog.mock.calls[0][0];
    arg.onConfirm();
    expect(mocks.deleteList).toHaveBeenCalledWith(1);
  });
});
