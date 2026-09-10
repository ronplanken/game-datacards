import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileGwImporter } from "../MobileGwImporter";

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid"),
}));

vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return { ...actual, createPortal: (node) => node };
});

const mockCreateListWithCards = vi.fn();
vi.mock("../../useMobileList", () => ({
  useMobileList: () => ({ createListWithCards: mockCreateListWithCards }),
}));

// An 11th edition faction: detachments with a DP cost of their own, and
// datasheets priced per size tier.
vi.mock("../../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: {
      data: [
        {
          id: "SM",
          name: "Space Marines",
          detachments: [
            { id: "ironstorm", name: { en: "Ironstorm Spearhead" }, detachmentPoints: 2 },
            { id: "marshal", name: { en: "Marshal's Household" }, detachmentPoints: 1 },
            { id: "gladius", name: { en: "Gladius Task Force" }, detachmentPoints: 3 },
          ],
          enhancements: [
            { name: "Target Augury Web", cost: 10, detachment: "Ironstorm Spearhead" },
            { name: "Fervent Exemplars", cost: 15, detachment: "Marshal's Household" },
          ],
          datasheets: [
            {
              id: "ds-grimaldus",
              name: "Chaplain Grimaldus",
              source: "40k-11e",
              points: [{ models: "4", cost: "110" }],
              rangedWeapons: [],
              meleeWeapons: [],
            },
            {
              id: "ds-apothecary",
              name: "Apothecary",
              source: "40k-11e",
              points: [{ models: "1", cost: "40" }],
              rangedWeapons: [],
              meleeWeapons: [],
            },
            {
              id: "ds-brethren",
              name: "Sword Brethren Squad",
              source: "40k-11e",
              points: [
                { models: "5", cost: "130" },
                { models: "10", cost: "230" },
              ],
              rangedWeapons: [],
              meleeWeapons: [],
            },
            {
              id: "ds-techmarine",
              name: "Techmarine",
              source: "40k-11e",
              points: [{ models: "1", cost: "85" }],
              rangedWeapons: [],
              meleeWeapons: [],
            },
            {
              id: "ds-infiltrator",
              name: "Infiltrator Squad",
              source: "40k-11e",
              points: [{ models: "5", cost: "110" }],
              rangedWeapons: [],
              meleeWeapons: [],
            },
          ],
        },
      ],
    },
  }),
}));

vi.mock("../../../Toast/message", () => ({
  message: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// An 11th edition export: a detachment line naming two detachments with their
// combined DP, a force disposition, a battle size, and an attached-units block.
const IRONSTORM_EXPORT = `Ironstorm + MH (1,990 Points)

Space Marines
Black Templars
Ironstorm Spearhead and Marshal's Household (3 Detachment Points)
Priority Assets
Strike Force (2,000 Points)

ATTACHED UNITS

Attached unit 1

Chaplain Grimaldus (110 Points)
  • Attached as: Leader (Character)
  • 1x Chaplain Grimaldus
     • Warlord
     ◦ 1x Artificer crozius
  • 3x Cenobyte Servitor
     ◦ 3x Close combat weapon

Apothecary (40 Points)
  • Attached as: Support (Character)
  • 1x Absolvor bolt pistol

Sword Brethren Squad (245 Points)
  • Attached as: Bodyguard ()
  • Enhancements: Fervent Exemplars (Upgrade)
  • 9x Sword Brother
     ◦ 9x Master-crafted power weapon

CHARACTERS

Techmarine (85 Points)
  • 1x Servo-arm

OTHER DATASHEETS

Infiltrator Squad (110 Points)
  • 1x Infiltrator Sergeant
     ◦ 1x Bolt pistol
  • 4x Infiltrator
     ◦ 4x Bolt pistol

Exported with App Version: v2.1.0 (3), Data Version: v895`;

// Walk the wizard: paste, review, confirm, import.
const importList = (text) => {
  render(<MobileGwImporter isOpen={true} onClose={vi.fn()} />);
  fireEvent.change(screen.getByPlaceholderText(/Blood Angels/), { target: { value: text } });
  fireEvent.click(screen.getByText("Continue"));
  fireEvent.click(screen.getByText("Continue"));
  fireEvent.click(screen.getByText(/^Import \d+ Unit/));
  return mockCreateListWithCards.mock.calls[0];
};

describe("MobileGwImporter - 11th edition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!document.getElementById("modal-root")) {
      const root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
  });

  it("shows every unit of the export, attached block included", () => {
    render(<MobileGwImporter isOpen={true} onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Blood Angels/), { target: { value: IRONSTORM_EXPORT } });
    fireEvent.click(screen.getByText("Continue"));

    // The name the export used and the datasheet it matched both show, so each
    // unit appears twice on the review step.
    for (const name of ["Chaplain Grimaldus", "Sword Brethren Squad", "Techmarine", "Infiltrator Squad"]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it("creates the list with the battle size and both detachments the export names", () => {
    const [, , options] = importList(IRONSTORM_EXPORT);
    expect(options.battleSize).toBe("strikeForce");
    expect(options.detachments.map((d) => d.id)).toEqual(["ironstorm", "marshal"]);
    expect(options.factionId).toBe("SM");
  });

  it("names the list after the export", () => {
    const [name] = importList(IRONSTORM_EXPORT);
    expect(name).toBe("Ironstorm + MH");
  });

  it("imports every unit, matched to its datasheet", () => {
    const [, cards] = importList(IRONSTORM_EXPORT);
    expect(cards.map((c) => c.card.name)).toEqual([
      "Chaplain Grimaldus",
      "Apothecary",
      "Sword Brethren Squad",
      "Techmarine",
      "Infiltrator Squad",
    ]);
  });

  it("puts each unit on one of its datasheet's own size tiers", () => {
    const [, cards] = importList(IRONSTORM_EXPORT);
    const brethren = cards.find((c) => c.card.name === "Sword Brethren Squad");
    // 245 pts less the 15 pt enhancement is the 10-model tier at 230.
    expect(brethren.points).toEqual({ models: "10", cost: "230" });
    const grimaldus = cards.find((c) => c.card.name === "Chaplain Grimaldus");
    expect(grimaldus.points).toEqual({ models: "4", cost: "110" });
  });

  it("carries the warlord and the enhancements through", () => {
    const [, cards] = importList(IRONSTORM_EXPORT);
    const grimaldus = cards.find((c) => c.card.name === "Chaplain Grimaldus");
    expect(grimaldus.isWarlord).toBe(true);
    const brethren = cards.find((c) => c.card.name === "Sword Brethren Squad");
    expect(brethren.enhancement).toMatchObject({ name: "Fervent Exemplars", cost: 15 });
  });

  it("takes no roster from an export that states none", () => {
    const [, , options] = importList(`Plain List (100 Points)

Space Marines

CHARACTERS

Techmarine (85 Points)
  • 1x Servo-arm`);
    expect(options.battleSize).toBeNull();
    expect(options.detachments).toEqual([]);
  });
});
