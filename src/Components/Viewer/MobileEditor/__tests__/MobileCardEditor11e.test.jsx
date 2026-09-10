import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const updateCardData = vi.fn();
const settings = { language: "de", selectedDataSource: "40k-11e" };

vi.mock("../../useMobileList", () => ({
  useMobileList: () => ({ updateCardData }),
}));

vi.mock("../../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings }),
}));

import { MobileCardEditor } from "../MobileCardEditor";

// A card as the 11e datasource ships it: the top-level name resolved to a plain
// string by the loader, every body field language-keyed.
const card11e = () => ({
  uuid: "card-1",
  source: "40k-11e",
  cardType: "DataCard",
  name: "Intercessor Squad",
  stats: [{ name: { en: "Intercessor", de: "Intercessor DE" }, m: '6"', t: "4", sv: "3+", w: "2", ld: "6+", oc: "2" }],
  abilities: {
    core: [{ name: { en: 'Scouts 6"', de: 'Späher 6"' } }],
    faction: [],
    other: [{ name: { en: "Combat Squads", de: "Kampftrupps" }, description: { en: "Split", de: "Teilen" } }],
    wargear: [],
    special: [],
    invul: { value: "4+" },
  },
  rangedWeapons: [
    {
      profiles: [{ name: { en: "Bolt rifle", de: "Boltgewehr" }, range: "24", attacks: "2", keywords: ["Assault"] }],
      abilities: [{ name: { en: "Overcharge", de: "Überladen" }, description: { en: "Boom", de: "Bumm" } }],
    },
  ],
  keywords: [{ en: "Infantry", de: "Infanterie" }],
  factions: ["Adeptus Astartes"],
  loadout: { en: "Equipped with a bolt rifle", de: "Mit einem Boltgewehr" },
});

const renderEditor = (card, onClose = vi.fn()) => {
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
  const utils = render(
    <MobileCardEditor
      isOpen
      onClose={onClose}
      card={card}
      cardUuid={card.uuid}
      gameSystem="40k-11e"
      schema={null}
      factionColours={{ banner: "#000", header: "#111" }}
    />,
  );
  return { ...utils, onClose };
};

const lastSavedCard = () => updateCardData.mock.calls.at(-1)[1];

describe("MobileCardEditor with a 40k-11e card", () => {
  beforeEach(() => {
    updateCardData.mockClear();
    document.body.innerHTML = "";
  });

  it("shows the localized text for the active card language", () => {
    const { getByDisplayValue } = renderEditor(card11e());

    expect(getByDisplayValue("Intercessor Squad")).toBeTruthy();
    expect(getByDisplayValue("Mit einem Boltgewehr")).toBeTruthy();
  });

  it("writes an edit into the active language and keeps the others", () => {
    const { getByDisplayValue } = renderEditor(card11e());

    const loadout = getByDisplayValue("Mit einem Boltgewehr");
    act(() => {
      fireEvent.change(loadout, { target: { value: "Mit einem Plasmagewehr" } });
      fireEvent.blur(loadout);
    });

    const saved = lastSavedCard();
    expect(saved.loadout).toEqual({ en: "Equipped with a bolt rifle", de: "Mit einem Plasmagewehr" });
  });

  it("keeps a unit's name a plain string", () => {
    const { getByDisplayValue } = renderEditor(card11e());

    const name = getByDisplayValue("Intercessor Squad");
    act(() => {
      fireEvent.change(name, { target: { value: "Assault Squad" } });
      fireEvent.blur(name);
    });

    expect(lastSavedCard().name).toBe("Assault Squad");
  });

  it("never saves the language sidecar onto the card", () => {
    const { getByDisplayValue } = renderEditor(card11e());

    const loadout = getByDisplayValue("Mit einem Boltgewehr");
    act(() => {
      fireEvent.change(loadout, { target: { value: "Geändert" } });
      fireEvent.blur(loadout);
    });

    expect(JSON.stringify(lastSavedCard())).not.toContain("__i18n");
  });

  it("hands the merged card back on close", () => {
    const onClose = vi.fn();
    const { getByDisplayValue, container } = renderEditor(card11e(), onClose);

    const loadout = getByDisplayValue("Mit einem Boltgewehr");
    act(() => {
      fireEvent.change(loadout, { target: { value: "Geändert" } });
      fireEvent.blur(loadout);
    });
    fireEvent.click(document.querySelector(".mobile-editor-back"));

    expect(onClose).toHaveBeenCalledTimes(1);
    const closed = onClose.mock.calls[0][0];
    expect(closed.loadout).toEqual({ en: "Equipped with a bolt rifle", de: "Geändert" });
    expect(container).toBeTruthy();
  });

  it("edits a weapon profile through the drill-down", () => {
    const { getByText, getByDisplayValue } = renderEditor(card11e());

    fireEvent.click(getByText("Ranged Weapons"));
    fireEvent.click(getByText("Boltgewehr"));

    const profileName = getByDisplayValue("Boltgewehr");
    act(() => {
      fireEvent.change(profileName, { target: { value: "Schweres Boltgewehr" } });
      fireEvent.blur(profileName);
    });

    const saved = lastSavedCard();
    expect(saved.rangedWeapons[0].profiles[0].name).toEqual({ en: "Bolt rifle", de: "Schweres Boltgewehr" });
    expect(saved.rangedWeapons[0].profiles[0].keywords).toEqual(["Assault"]);
  });

  it("edits a weapon ability, which 11e weapons carry and 10e ones do not", () => {
    const { getByText, getByDisplayValue } = renderEditor(card11e());

    fireEvent.click(getByText("Ranged Weapons"));
    fireEvent.click(getByText("Boltgewehr"));

    expect(getByText("Weapon Abilities")).toBeTruthy();
    const description = getByDisplayValue("Bumm");
    act(() => {
      fireEvent.change(description, { target: { value: "Grosser Knall" } });
      fireEvent.blur(description);
    });

    expect(lastSavedCard().rangedWeapons[0].abilities[0].description).toEqual({
      en: "Boom",
      de: "Grosser Knall",
    });
  });

  it("does not offer the per-profile Active toggle that 11e has no field for", () => {
    const { getByText, queryByText } = renderEditor(card11e());

    fireEvent.click(getByText("Ranged Weapons"));
    fireEvent.click(getByText("Boltgewehr"));

    expect(queryByText("Active")).toBeNull();
  });

  it("leaves untouched fields exactly as the datasource shipped them", () => {
    const original = card11e();
    const onClose = vi.fn();
    renderEditor(original, onClose);

    fireEvent.click(document.querySelector(".mobile-editor-back"));

    expect(onClose.mock.calls[0][0]).toEqual(original);
  });
});
