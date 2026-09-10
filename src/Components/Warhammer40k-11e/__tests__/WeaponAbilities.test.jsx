import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// 11e weapons can carry their own abilities next to their profiles (Overcharge
// on a transmatter inverter, …). They used to be dropped on the floor: neither
// rendered on the card nor reachable in the editor.
let capturedCard;
const mockUpdateActiveCard = vi.fn((arg) => {
  capturedCard = typeof arg === "function" ? arg() : arg;
});
const mockActiveCard = { ref: {} };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "de" } }),
}));

vi.mock("../../CustomMarkdownEditor", () => ({
  CustomMarkdownEditor: ({ value, onChange }) => (
    <textarea className="md-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { UnitWeapon as UnitWeaponCard } from "../UnitCard/UnitWeapon";
import { UnitWeapon as UnitWeaponEditor } from "../UnitCardEditor/UnitWeapon";

const profile = { name: { en: "Transmatter inverter", de: "Transmaterie-Inverter" }, range: '12"', keywords: [] };
const weaponWithAbility = {
  profiles: [profile],
  abilities: [
    {
      name: { en: "Overcharge", de: "Überladung" },
      description: { en: "Each time this weapon is fired…", de: "Jedes Mal, wenn…" },
    },
  ],
};

describe("weapon abilities on the card", () => {
  it("renders the ability under the weapon's profiles", () => {
    const { getByText } = render(<UnitWeaponCard weapon={weaponWithAbility} />);

    expect(getByText("Überladung:")).toBeInTheDocument();
    expect(getByText("Jedes Mal, wenn…")).toBeInTheDocument();
  });

  it("renders the ability markup through the 11e engine", () => {
    const { container } = render(
      <UnitWeaponCard
        weapon={{ profiles: [profile], abilities: [{ name: { de: "A" }, description: { de: "<k>Psyker</k> only." } }] }}
      />,
    );

    expect(container.querySelector(".gdc-keyword").textContent).toBe("Psyker");
  });

  it("renders nothing extra for a weapon without abilities", () => {
    const { container } = render(<UnitWeaponCard weapon={{ profiles: [profile] }} />);

    expect(container.querySelector(".weapon-abilities")).toBeNull();
  });
});

describe("weapon abilities in the editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCard = undefined;
    mockActiveCard.ref = { rangedWeapons: [JSON.parse(JSON.stringify(weaponWithAbility))] };
  });

  it("shows the ability description in the active card language", () => {
    const { container } = render(
      <UnitWeaponEditor weapon={mockActiveCard.ref.rangedWeapons[0]} index={0} type="rangedWeapons" />,
    );

    const editors = [...container.querySelectorAll("textarea.md-editor")];
    expect(editors).toHaveLength(1);
    expect(editors[0].value).toBe("Jedes Mal, wenn…");
  });

  it("merges a description edit into the active language", () => {
    const { container } = render(
      <UnitWeaponEditor weapon={mockActiveCard.ref.rangedWeapons[0]} index={0} type="rangedWeapons" />,
    );

    fireEvent.change(container.querySelector("textarea.md-editor"), { target: { value: "Neu" } });

    expect(capturedCard.rangedWeapons[0].abilities[0].description).toEqual({
      en: "Each time this weapon is fired…",
      de: "Neu",
    });
  });

  it("adds a language-keyed ability to a weapon that had none", () => {
    mockActiveCard.ref = { rangedWeapons: [{ profiles: [profile] }] };
    const { getByText } = render(
      <UnitWeaponEditor weapon={mockActiveCard.ref.rangedWeapons[0]} index={0} type="rangedWeapons" />,
    );

    fireEvent.click(getByText("Add weapon ability"));

    expect(capturedCard.rangedWeapons[0].abilities).toEqual([
      { name: { de: "Weapon ability 1" }, description: { de: "" } },
    ]);
  });

  it("removes the abilities key again when the last one is deleted", () => {
    const { container } = render(
      <UnitWeaponEditor weapon={mockActiveCard.ref.rangedWeapons[0]} index={0} type="rangedWeapons" />,
    );

    // The ability card's delete button sits in its header extra.
    const abilityCard = [...container.querySelectorAll(".ant-card")].find((card) =>
      card.querySelector(".ant-card-head-title")?.textContent?.includes("Überladung"),
    );
    fireEvent.click(abilityCard.querySelector(".ant-card-extra button"));
    const confirm = [...document.querySelectorAll(".ant-popover button")].find((button) =>
      ["OK", "Yes"].includes(button.textContent.trim()),
    );
    fireEvent.click(confirm);

    expect(capturedCard.rangedWeapons[0]).not.toHaveProperty("abilities");
    expect(capturedCard.rangedWeapons[0].profiles).toHaveLength(1);
  });
});
