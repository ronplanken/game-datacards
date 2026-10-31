import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListEditCard } from "../ListEditCard";

const mocks = vi.hoisted(() => ({
  dataSourceStorage: {
    dataSource: {
      data: [
        {
          id: "necrons",
          name: "Necrons",
          detachments: [{ name: "Cryptek Conclave" }, { name: "Awakened Dynasty" }],
          enhancements: [
            { name: "Atomic Disintegrators", cost: 20, keywords: ["Cryptek"], detachment: "Cryptek Conclave" },
            { name: "Veil of Darkness", cost: 25, keywords: ["Necrons"], detachment: "Awakened Dynasty" },
          ],
        },
        {
          id: "csm",
          name: "Chaos Space Marines",
          detachments: [{ name: "Pactbound Zealots" }, { name: "Slaves to Darkness" }],
          enhancements: [],
        },
      ],
    },
  },
  settingsStorage: { settings: {}, updateSettings: () => {} },
  mobileList: { lists: [], selectedList: 0, updateDatacard: () => {} },
}));

vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => mocks.dataSourceStorage,
}));

vi.mock("../../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => mocks.settingsStorage,
}));

vi.mock("../../useMobileList", () => ({
  useMobileList: () => mocks.mobileList,
}));

const overlord = {
  name: "Overlord",
  uuid: "overlord-1",
  id: "unit-overlord",
  faction_id: "necrons",
  source: "40k-11e",
  keywords: ["Character"],
  factions: ["Necrons"],
  points: [{ models: 1, cost: 90 }],
  unitSize: { models: 1, cost: 90 },
};

const abaddon = {
  name: "Abaddon the Despoiler",
  uuid: "abaddon-1",
  id: "unit-abaddon",
  faction_id: "csm",
  source: "40k-11e",
  keywords: ["Character", "Epic Hero"],
  factions: ["Heretic Astartes"],
  points: [{ models: 1, cost: 280 }],
  unitSize: { models: 1, cost: 280 },
  attachesTo: [
    { type: "leader", target: "Chosen", targetType: "datasheet", excludesDetachment: "Pactbound Zealots" },
    {
      type: "leader",
      target: "Chosen",
      targetType: "datasheet",
      requiresDetachment: "Pactbound Zealots",
      requiresKeyword: "Khorne",
    },
  ],
};

const plainChosen = { uuid: "chosen-1", nameEn: "Chosen", name: "Chosen", keywords: ["Infantry"] };

const setList = (list) => {
  mocks.mobileList = { ...mocks.mobileList, lists: [list] };
};

describe("ListEditCard", () => {
  let modalRoot;

  beforeEach(() => {
    setList({ cards: [] });
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
    document.body.style.overflow = "";
  });

  it("keeps the detachment picker when the current detachment has no enhancement for the unit", () => {
    render(<ListEditCard isVisible={true} setIsVisible={vi.fn()} card={overlord} />);

    expect(screen.getByText("Cryptek Conclave")).toBeInTheDocument();
    expect(screen.queryByText("Veil of Darkness")).not.toBeInTheDocument();
  });

  it("hides the detachment picker and uses the roster detachments once the list has them", () => {
    setList({ cards: [overlord], detachments: [{ name: { en: "Awakened Dynasty" } }] });

    render(<ListEditCard isVisible={true} setIsVisible={vi.fn()} card={overlord} />);

    expect(screen.queryByText("Cryptek Conclave")).not.toBeInTheDocument();
    expect(screen.getByText("Veil of Darkness")).toBeInTheDocument();
  });

  it("checks attachments against the roster detachments", () => {
    setList({ cards: [abaddon, plainChosen], detachments: [{ name: { en: "Pactbound Zealots" } }] });

    render(<ListEditCard isVisible={true} setIsVisible={vi.fn()} card={abaddon} />);

    expect(screen.getByText("Attach to unit")).toBeInTheDocument();
    expect(screen.queryByText("Chosen")).not.toBeInTheDocument();
  });

  it("offers the squad when the roster detachment allows it", () => {
    setList({ cards: [abaddon, plainChosen], detachments: [{ name: { en: "Slaves to Darkness" } }] });

    render(<ListEditCard isVisible={true} setIsVisible={vi.fn()} card={abaddon} />);

    expect(screen.getByText("Chosen")).toBeInTheDocument();
  });
});
