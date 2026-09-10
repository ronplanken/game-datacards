import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListOverview } from "../ListOverview";

// The list overview shares either the selected local list or, when a cloud
// category is open, that cloud category. These tests pin down which object ends
// up in the share sheet, because sharing the wrong one would publish a
// completely different army list.

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
vi.mock("../../MobileImporter", () => ({
  MobileGwImporter: () => null,
  MobileListForgeImporter: () => null,
}));

const openMoreMenu = (container) => {
  fireEvent.click(container.querySelector(".list-overview-more-button"));
};

describe("ListOverview sharing", () => {
  let modalRoot;

  beforeEach(() => {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);

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
    shareAnonymousResult = { success: true, shareId: "anon-share" };

    shareAnonymous.mockClear();
    shareOwned.mockClear();
    updateShare.mockClear();
    getExistingShare.mockClear();
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
    document.body.style.overflow = "";
  });

  const renderOverview = () => render(<ListOverview isVisible={true} setIsVisible={vi.fn()} />);

  it("offers Share List for a local list", () => {
    renderOverview();
    openMoreMenu(document.body);
    expect(screen.getByText("Share List")).toBeTruthy();
    expect(screen.getByText("Copy List")).toBeTruthy();
  });

  it("offers Share List for a cloud category", () => {
    mobileListState.selectedCloudCategoryId = "cloud-1";
    renderOverview();
    openMoreMenu(document.body);
    expect(screen.getByText("Share List")).toBeTruthy();
  });

  it("shares the cloud category, not the selected local list", async () => {
    mobileListState.selectedCloudCategoryId = "cloud-1";
    renderOverview();
    openMoreMenu(document.body);
    fireEvent.click(screen.getByText("Share List"));

    // The sheet describes the cloud category (2 cards), not the local list (1 card)
    expect(document.querySelector(".list-share-name").textContent).toBe("My Cloud Category");
    expect(document.querySelector(".list-share-meta").textContent).toBe("2 cards");

    fireEvent.click(screen.getByText("Generate Link"));
    await waitFor(() => expect(shareAnonymous).toHaveBeenCalledTimes(1));
    expect(shareAnonymous.mock.calls[0][0]).toBe(cloudCategory);
    expect(shareAnonymous.mock.calls[0][0].uuid).toBe("cloud-1");
  });

  it("looks up an existing share by the cloud category uuid when authenticated", async () => {
    isAuthenticated = true;
    mobileListState.selectedCloudCategoryId = "cloud-1";
    renderOverview();
    openMoreMenu(document.body);
    fireEvent.click(screen.getByText("Share List"));

    await waitFor(() => expect(getExistingShare).toHaveBeenCalledWith("cloud-1"));

    fireEvent.click(await screen.findByText("Share"));
    await waitFor(() => expect(shareOwned).toHaveBeenCalledTimes(1));
    expect(shareOwned.mock.calls[0][0]).toBe(cloudCategory);
  });

  it("still shares the selected local list when no cloud category is open", async () => {
    renderOverview();
    openMoreMenu(document.body);
    fireEvent.click(screen.getByText("Share List"));

    expect(document.querySelector(".list-share-name").textContent).toBe("My Local List");
    expect(document.querySelector(".list-share-meta").textContent).toBe("1 card");

    fireEvent.click(screen.getByText("Generate Link"));
    await waitFor(() => expect(shareAnonymous).toHaveBeenCalledTimes(1));
    expect(shareAnonymous.mock.calls[0][0]).toBe(localList);
  });

  it("hides Share List when there is no list or cloud category to share", () => {
    mobileListState.lists = [];
    renderOverview();
    openMoreMenu(document.body);
    expect(screen.queryByText("Share List")).toBeNull();
    expect(screen.getByText("Copy List")).toBeTruthy();
  });

  it("surfaces a share failure such as the card limit", async () => {
    shareAnonymousResult = { success: false, error: "Maximum 100 cards per share" };
    mobileListState.selectedCloudCategoryId = "cloud-1";
    renderOverview();
    openMoreMenu(document.body);
    fireEvent.click(screen.getByText("Share List"));
    fireEvent.click(screen.getByText("Generate Link"));

    expect(await screen.findByText("Maximum 100 cards per share")).toBeTruthy();
  });
});
