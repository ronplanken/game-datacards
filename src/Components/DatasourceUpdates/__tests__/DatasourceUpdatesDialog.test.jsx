import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { DatasourceUpdatesDialog } from "../DatasourceUpdatesDialog";

let modalProps;
let storage;
const updateCategory = vi.fn();
const markCategoryPending = vi.fn();
const updateActiveCard = vi.fn();

vi.mock("../DatasourceUpdatesModal", () => ({
  DatasourceUpdatesModal: (props) => {
    modalProps = { ...props, variant: "desktop" };
    return null;
  },
}));

vi.mock("../MobileDatasourceUpdatesSheet", () => ({
  MobileDatasourceUpdatesSheet: (props) => {
    modalProps = { ...props, variant: "mobile" };
    return null;
  },
}));

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => storage,
}));

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: { data: [] }, selectedFaction: null }),
}));

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { selectedDataSource: "40k-11e", language: "en" } }),
}));

vi.mock("../../../Hooks/useUmami", () => ({
  useUmami: () => ({ trackEvent: vi.fn() }),
}));

vi.mock("../../Toast/message", () => ({
  message: { success: vi.fn() },
}));

const source = { id: "u1", name: "Belial", cardType: "DataCard", source: "40k-11e", keywords: ["Infantry"] };
const saved = { ...source, uuid: "a", keywords: ["Old"], isWarlord: true };
const category = { uuid: "list-1", name: "List", type: "list", cards: [saved] };
const results = [{ card: saved, status: "changed", sourceCard: source, changes: [{}] }];

describe("DatasourceUpdatesDialog", () => {
  beforeEach(() => {
    modalProps = null;
    updateCategory.mockClear();
    markCategoryPending.mockClear();
    updateActiveCard.mockClear();
    storage = {
      cardStorage: { categories: [category] },
      updateCategory,
      markCategoryPending,
      activeCard: null,
      updateActiveCard,
    };
  });

  it("renders the desktop modal by default and the mobile sheet on request", () => {
    render(<DatasourceUpdatesDialog category={category} cards={category.cards} onClose={vi.fn()} />);
    expect(modalProps.variant).toBe("desktop");
    render(<DatasourceUpdatesDialog variant="mobile" category={category} cards={category.cards} onClose={vi.fn()} />);
    expect(modalProps.variant).toBe("mobile");
  });

  it("writes the updated cards in one category update and marks it pending", () => {
    const onClose = vi.fn();
    render(<DatasourceUpdatesDialog variant="mobile" category={category} cards={category.cards} onClose={onClose} />);
    modalProps.onApply(results, ["a"]);

    expect(onClose).toHaveBeenCalled();
    expect(updateCategory).toHaveBeenCalledTimes(1);
    const [written, uuid] = updateCategory.mock.calls[0];
    expect(uuid).toBe("list-1");
    expect(written.cards[0].keywords).toEqual(["Infantry"]);
    expect(written.cards[0].isWarlord).toBe(true);
    expect(markCategoryPending).toHaveBeenCalledWith("list-1");
  });

  it("refreshes the active card when it was updated", () => {
    storage.activeCard = saved;
    render(<DatasourceUpdatesDialog category={category} cards={category.cards} onClose={vi.fn()} />);
    modalProps.onApply(results, ["a"]);
    expect(updateActiveCard).toHaveBeenCalledWith(expect.objectContaining({ uuid: "a", keywords: ["Infantry"] }), true);
  });

  it("writes nothing when no card was selected", () => {
    render(<DatasourceUpdatesDialog category={category} cards={category.cards} onClose={vi.fn()} />);
    modalProps.onApply(results, []);
    expect(updateCategory).not.toHaveBeenCalled();
  });
});
