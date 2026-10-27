import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ListOverview } from "../ListOverview";

const localList = {
  uuid: "local-1",
  name: "My Local List",
  cards: [{ uuid: "card-local", name: "Local Marine", cardType: "datasheet", keywords: [], faction_id: "faction-1" }],
};

const cloudCategory = {
  uuid: "cloud-1",
  name: "My Cloud Category",
  type: "category",
  gameSystem: "40k",
  cloudId: 42,
  cardCount: 2,
  cards: [
    { uuid: "card-cloud-1", name: "Cloud Marine", cardType: "datasheet", keywords: [] },
    { uuid: "card-cloud-2", name: "Cloud Terminator", cardType: "datasheet", keywords: [] },
  ],
};

let mobileListState;
let dialogProps;
let cloudCategories;
let isAuthenticated;
let shareAnonymousResult;

const shareAnonymous = vi.fn(() => Promise.resolve(shareAnonymousResult));
const shareOwned = vi.fn(() => Promise.resolve({ success: true, shareId: "owned-share" }));
const updateShare = vi.fn(() => Promise.resolve({ success: true }));
const getExistingShare = vi.fn(() => Promise.resolve(null));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/mobile", state: {} }),
}));

vi.mock("../../useMobileList", () => ({
  useMobileList: () => mobileListState,
}));

vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: { data: [{ id: "faction-1", name: "Space Marines", detachments: [] }] },
    selectedFaction: { id: "faction-1", name: "Space Marines" },
  }),
}));

vi.mock("../../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { selectedDataSource: "40k-10e" }, updateSettings: vi.fn() }),
}));

vi.mock("../../../../Premium", () => ({
  useCloudCategories: () => ({ categories: cloudCategories }),
  useAuth: () => ({ isAuthenticated }),
  ListSyncButton: () => null,
}));

vi.mock("../../../../Hooks/useCategorySharing", () => ({
  useCategorySharing: () => ({
    shareAnonymous,
    shareOwned,
    updateShare,
    getExistingShare,
    isSharing: false,
  }),
}));

// Sibling sheets are not under test and pull in their own storage hooks.
vi.mock("../ListSelector", () => ({ ListSelector: () => null }));
vi.mock("../ListEditCard", () => ({ ListEditCard: () => null }));
vi.mock("../../Mobile/ArmyRosterSheet", () => ({ ArmyRosterSheet: () => null }));
vi.mock("../../../DatasourceUpdates", () => ({
  DatasourceUpdatesDialog: (props) => {
    dialogProps = props;
    return <div data-testid="compare-dialog" />;
  },
}));
vi.mock("../../MobileImporter", () => ({
  MobileGwImporter: () => null,
  MobileListForgeImporter: () => null,
}));

const openMoreMenu = () => {
  fireEvent.click(document.body.querySelector(".list-overview-more-button"));
};

describe("ListOverview compare with datasource", () => {
  let modalRoot;

  beforeEach(() => {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
    dialogProps = null;
    mobileListState = {
      lists: [localList],
      selectedList: 0,
      removeDatacard: vi.fn(),
      selectedCloudCategoryId: null,
      setListDetachments: vi.fn(),
      setListBattleSize: vi.fn(),
    };
    cloudCategories = [cloudCategory];
    isAuthenticated = false;
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
    document.body.style.overflow = "";
  });

  const renderOverview = () => render(<ListOverview isVisible={true} setIsVisible={vi.fn()} />);

  it("opens the mobile compare dialog for the selected list", () => {
    renderOverview();
    openMoreMenu();
    fireEvent.click(screen.getByText("Compare with datasource"));
    expect(screen.getByTestId("compare-dialog")).toBeTruthy();
    expect(dialogProps.variant).toBe("mobile");
    expect(dialogProps.category).toBe(localList);
    expect(dialogProps.cards).toBe(localList.cards);
  });

  it("closes the dialog", () => {
    renderOverview();
    openMoreMenu();
    fireEvent.click(screen.getByText("Compare with datasource"));
    act(() => dialogProps.onClose());
    expect(screen.queryByTestId("compare-dialog")).toBeNull();
  });

  it("is not offered for a read-only cloud category", () => {
    mobileListState.selectedCloudCategoryId = "cloud-1";
    renderOverview();
    openMoreMenu();
    expect(screen.queryByText("Compare with datasource")).toBeNull();
  });

  it("is not offered for an empty list", () => {
    mobileListState.lists = [{ ...localList, cards: [] }];
    renderOverview();
    openMoreMenu();
    expect(screen.queryByText("Compare with datasource")).toBeNull();
  });
});
