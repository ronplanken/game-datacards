import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ViewerMobile } from "../ViewerMobile";

const state = vi.hoisted(() => ({
  card: null,
  settings: {},
  updateSettings: vi.fn(),
  scrollHeader: vi.fn(),
}));

vi.mock("@formkit/auto-animate/react", () => ({ useAutoAnimate: () => [null] }));
vi.mock("../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: state.settings, updateSettings: state.updateSettings }),
}));
vi.mock("../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: state.card,
    updateActiveCard: vi.fn(),
    cardStorage: { categories: [] },
  }),
}));
vi.mock("../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: { data: [{ id: "SM", name: "Space Marines" }] },
    selectedFaction: null,
    getCustomDatasourceData: vi.fn(),
  }),
  useOptionalDataSourceStorage: () => null,
}));
vi.mock("../../Hooks/useViewerNavigation", () => ({ useViewerNavigation: () => {} }));
vi.mock("../../Hooks/useMobileSharing", () => ({ useMobileSharing: () => ({}) }));
vi.mock("../../Hooks/useRecentSearches", () => ({ useRecentSearches: () => ({ recentSearches: [] }) }));
vi.mock("../../Hooks/useScrollRevealHeader", () => ({
  useScrollRevealHeader: (options) => {
    state.scrollHeader(options);
    return { showHeader: false, headerReady: true, scrollContainerRef: null };
  },
}));
vi.mock("../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({ isReady: false, getImageUrl: vi.fn() }),
}));
vi.mock("../../Components/Viewer/useMobileList", () => ({
  MobileListProvider: ({ children }) => <>{children}</>,
  useMobileList: () => ({}),
}));
vi.mock("../../Components/Viewer/MobileSearchHeader", () => ({ MobileSearchHeader: () => null }));
vi.mock("../../Components/Viewer/MobileSearchDropdown", () => ({ MobileSearchDropdown: () => null }));
vi.mock("../../Components/Viewer/MobileSearchFactionFilter", () => ({ MobileSearchFactionFilter: () => null }));
vi.mock("../../Components/Viewer/MobileNav", () => ({ MobileNav: () => null }));
vi.mock("../../Components/Viewer/MobileMenu", () => ({ MobileMenu: () => null }));
vi.mock("../../Components/Viewer/MobileWelcome", () => ({ MobileWelcome: () => null }));
vi.mock("../../Components/Viewer/MobileSharingMenu", () => ({ MobileSharingMenu: () => null }));
vi.mock("../../Components/Viewer/MobileGameSystemSelector", () => ({ MobileGameSystemSelector: () => null }));
vi.mock("../../Components/Viewer/MobileGlossaryList", () => ({ MobileGlossaryList: () => null }));
vi.mock("../../Components/Viewer/MobileGameSystemSettings", () => ({ MobileGameSystemSettings: () => null }));
vi.mock("../../Components/Viewer/ListCreator/ListAdd", () => ({ ListAdd: () => null }));
vi.mock("../../Components/Viewer/Mobile/PWAInstallPrompt", () => ({ PWAInstallPrompt: () => null }));
vi.mock("../../Components/Viewer/MobileEditor", () => ({ MobileCardEditor: () => null }));
vi.mock("../../Premium", async (importOriginal) => ({
  ...(await importOriginal()),
  MobileAccountSheet: () => null,
  MobileAccountSettingsSheet: () => null,
  MobileSyncSheet: () => null,
  MobileSharedListsModal: () => null,
}));

// Minimal 10e fixture preserving the conflicting fields in the reported export.
const make10eCard = () => ({
  uuid: "saved-kraven",
  name: "Kraven Sevatorus",
  source: "40k-10e",
  cardType: "DataCard",
  faction_id: "SM",
  stats: [],
  points: [],
  rangedWeapons: [],
  meleeWeapons: [],
  keywords: [],
  factions: [],
  composition: ["1 Kraven Sevatorus"],
  loadout: "Master-crafted heavy bolt pistol; Abyssbane",
  leader: "This model can be attached to the following units: ■ TACTICAL SQUAD",
  leads: { units: ["COMPANY HEROS SQUAD"], extra: "" },
  abilities: {
    core: ["Fights First", "Leader"],
    faction: ["Oath of Moment"],
    other: [
      {
        name: "Bane of the Neverborn",
        description: "Custom ability description",
        showAbility: true,
        showDescription: true,
      },
    ],
  },
});

beforeEach(() => {
  state.card = make10eCard();
  state.settings = {
    selectedDataSource: "40k-11e",
    showCardsAsDoubleSided: true,
    language: "en",
    mobile: { gameSystemSelected: true },
  };
  state.updateSettings.mockClear();
  state.scrollHeader.mockClear();
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(cleanup);

const renderViewer = (stateKey = "cloudCard") =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/mobile/space-marines/kraven-sevatorus", state: { [stateKey]: state.card } }]}>
      <ViewerMobile />
    </MemoryRouter>,
  );

describe("saved card editions in the mobile viewer", () => {
  it.each(["cloudCard", "listCard"])(
    "renders saved 10e %s abilities and edited leaders while browsing 11e",
    async (stateKey) => {
      const { container } = renderViewer(stateKey);
      await waitFor(() => expect(container.querySelectorAll(".unit.full")).toHaveLength(3));
      // The visible card and both image-export copies must all use the same edition.
      for (const card of container.querySelectorAll(".unit.full")) {
        expect(card.closest(".data-40k-10e")).not.toBeNull();
        expect(card.querySelector('[data-name="core"]').textContent.toLowerCase()).toContain("fights first");
        expect(card.querySelector('[data-name="faction"]')).toHaveTextContent("Oath of Moment");
        expect(card).toHaveTextContent("COMPANY HEROS SQUAD");
        expect(card).not.toHaveTextContent("TACTICAL SQUAD");
        expect(card).toHaveTextContent("Custom ability description");
      }
      expect(container.querySelector(".data-40k-11e")).toBeNull();
      expect(state.updateSettings).not.toHaveBeenCalled();
    },
  );

  it("renders 11e object abilities and leader text while browsing 10e", async () => {
    state.settings.selectedDataSource = "40k-10e";
    state.card = {
      ...make10eCard(),
      source: "40k-11e",
      abilities: {
        core: [{ name: { en: "Deep Strike" } }],
        faction: [{ name: { en: "Oath of Moment" } }],
        other: [],
      },
      leader: { en: "This model leads TERMINATOR SQUAD" },
    };
    const { container } = renderViewer();
    await waitFor(() => expect(container.querySelectorAll(".unit.full")).toHaveLength(3));
    for (const card of container.querySelectorAll(".unit.full")) {
      expect(card.closest(".data-40k-11e")).not.toBeNull();
      expect(card.querySelector('[data-name="core"]')).toHaveTextContent("Deep Strike");
      expect(card.querySelector('[data-name="faction"]')).toHaveTextContent("Oath of Moment");
      expect(card).toHaveTextContent("TERMINATOR SQUAD");
      expect(card).not.toHaveTextContent("COMPANY HEROS SQUAD");
    }
    expect(state.updateSettings).not.toHaveBeenCalled();
  });

  it("uses the card's header behavior and restores browsing styles after closing it", async () => {
    state.settings.selectedDataSource = "aos";
    const { container, rerender } = renderViewer();
    await waitFor(() => expect(container.querySelectorAll(".unit.full")).toHaveLength(3));
    expect(state.scrollHeader).toHaveBeenLastCalledWith(
      expect.objectContaining({ enabled: false, targetSelector: null }),
    );
    expect(container.querySelector(".mobile-card-header")).not.toBeNull();
    state.card = null;
    rerender(
      <MemoryRouter>
        <ViewerMobile />
      </MemoryRouter>,
    );
    await waitFor(() => expect(container.querySelector(".unit.full")).toBeNull());
    expect(container.querySelector(".data-aos")).not.toBeNull();
    expect(container.querySelector(".data-40k-10e")).toBeNull();
    expect(state.settings.selectedDataSource).toBe("aos");
  });

  it("falls back to the selected edition when a saved card has no source", async () => {
    state.settings.selectedDataSource = "40k-10e";
    delete state.card.source;
    const { container } = renderViewer();
    await waitFor(() => expect(container.querySelectorAll(".unit.full")).toHaveLength(3));
    expect(container.querySelector('[data-name="core"]').textContent.toLowerCase()).toContain("fights first");
    expect(container.querySelector(".data-40k-10e")).not.toBeNull();
  });
});
