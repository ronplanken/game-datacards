import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { DatasourceUpdatesDialog } from "../DatasourceUpdatesDialog";

let modalProps;
let storage;
const replaceCategoryCards = vi.fn();
const success = vi.fn();
const info = vi.fn();

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
  message: { success: (...args) => success(...args), info: (...args) => info(...args) },
}));

const source = { id: "u1", name: "Belial", cardType: "DataCard", source: "40k-11e", keywords: ["Infantry"] };
const saved = { ...source, uuid: "a", keywords: ["Old"], isWarlord: true };
const category = { uuid: "list-1", name: "List", type: "list", cards: [saved] };
const results = [{ card: saved, status: "changed", sourceCard: source, changes: [{}] }];

describe("DatasourceUpdatesDialog", () => {
  beforeEach(() => {
    modalProps = null;
    replaceCategoryCards.mockClear();
    success.mockClear();
    info.mockClear();
    storage = {
      cardStorage: { categories: [category] },
      replaceCategoryCards,
    };
  });

  it("renders the desktop modal by default and the mobile sheet on request", () => {
    render(<DatasourceUpdatesDialog category={category} cards={category.cards} onClose={vi.fn()} />);
    expect(modalProps.variant).toBe("desktop");
    render(<DatasourceUpdatesDialog variant="mobile" category={category} cards={category.cards} onClose={vi.fn()} />);
    expect(modalProps.variant).toBe("mobile");
  });

  it("replaces only the updated cards in the category", () => {
    const onClose = vi.fn();
    render(<DatasourceUpdatesDialog variant="mobile" category={category} cards={category.cards} onClose={onClose} />);
    modalProps.onApply(results, ["a"]);

    expect(onClose).toHaveBeenCalled();
    expect(replaceCategoryCards).toHaveBeenCalledTimes(1);
    const [uuid, written] = replaceCategoryCards.mock.calls[0];
    expect(uuid).toBe("list-1");
    expect(written).toHaveLength(1);
    expect(written[0].keywords).toEqual(["Infantry"]);
    expect(written[0].isWarlord).toBe(true);
  });

  it("offers an undo that restores the previous cards", () => {
    render(<DatasourceUpdatesDialog category={category} cards={category.cards} onClose={vi.fn()} />);
    modalProps.onApply(results, ["a"]);

    const toast = success.mock.calls[0][0];
    expect(toast.content).toBe("Updated 1 card from the datasource.");
    expect(toast.action.label).toBe("Undo");

    toast.action.onClick();
    expect(replaceCategoryCards).toHaveBeenCalledTimes(2);
    expect(replaceCategoryCards.mock.calls[1]).toEqual(["list-1", [saved]]);
    expect(info).toHaveBeenCalledWith("Restored 1 card.");
  });

  it("writes nothing when no card was selected", () => {
    render(<DatasourceUpdatesDialog category={category} cards={category.cards} onClose={vi.fn()} />);
    modalProps.onApply(results, []);
    expect(replaceCategoryCards).not.toHaveBeenCalled();
  });
});
