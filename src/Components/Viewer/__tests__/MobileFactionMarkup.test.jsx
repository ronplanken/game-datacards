import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileFaction } from "../MobileFaction";
import { RuleCard } from "../../Warhammer40k-11e/RuleCard";

const state = vi.hoisted(() => ({ settings: {}, faction: {} }));
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: state.settings, updateSettings: vi.fn() }),
}));
vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ selectedFaction: state.faction, dataSource: { data: [state.faction] } }),
}));
vi.mock("../../../Hooks/useCombinedDatasheets", () => ({ useCombinedDatasheets: () => ({ datasheets: [] }) }));
vi.mock("../../Icons/FactionIcon", () => ({ FactionIcon: () => null }));
vi.mock("react-fitty", () => ({ ReactFitty: ({ children }) => <>{children}</> }));
vi.mock("../Mobile/BottomSheet", () => ({ BottomSheet: () => null }));

// English excerpts from the Ork codex bug report, plus the translated <bi> form.
const boss = "At the start of the battle round, if a model with this ability is your <k>Warlord</k>, gain 1CP.";
const energies =
  "<k>Orks Psyker</k> units with this ability have a <b>psyker level</b> of 1 or higher.\nExample: <b><i>psychic level 1</i></b> ability.";
const rule = (name, text, type = "text") => ({
  name,
  ruleType: "army",
  source: "40k-11e",
  faction_id: "ORK",
  cardType: "rule",
  rules: [{ order: 1, type, text: { en: text, de: "<k>Psioniker</k> mit <bi>Psionikerstufe 3</bi>." } }],
});

beforeEach(() => {
  state.settings = { selectedDataSource: "40k-11e", language: "en" };
  state.faction = {
    id: "ORK",
    name: "Orks",
    detachments: ["War Horde"],
    rules: {
      army: [rule("Da Boss", boss), rule("Unstable energies", energies)],
      detachment: [{ detachment: "War Horde", rules: [rule("Detachment ability", energies, "accordion")] }],
    },
  };
});

describe("Ork rule markup on desktop", () => {
  it("renders the reported English keywords, bold and italic text in rule cards", () => {
    const { container } = render(
      <>
        <RuleCard rule={rule("Da Boss", boss)} />
        <RuleCard rule={rule("Unstable energies", energies)} />
      </>,
    );
    expect(container.querySelector(".gdc-keyword")).toHaveTextContent("Warlord");
    expect(container.querySelector("b")).toHaveTextContent("psyker level");
    expect(container.querySelector("b i")).toHaveTextContent("psychic level 1");
    expect(container.textContent).not.toMatch(/<\/?(?:k|b|i)>/);
  });

  it("renders combined bold and italic markup in translated rule cards", () => {
    state.settings.language = "de";
    const { container } = render(<RuleCard rule={rule("Unstable energies", energies)} />);
    expect(container.querySelector("strong em, b i")).toHaveTextContent("Psionikerstufe 3");
  });
});

describe("Ork rule markup on mobile", () => {
  it("formats army rules and detachment accordions with the 11e style scope", () => {
    const { container } = render(<MobileFaction />);
    for (const name of ["Da Boss", "Unstable energies", "Detachment ability"]) {
      fireEvent.click(screen.getByRole("button", { name }));
    }
    expect(container.querySelector(".data-40k-11e .gdc-keyword")).toHaveTextContent("Warlord");
    expect(container.querySelectorAll("b i")).toHaveLength(2);
    expect(container.querySelector(".rule-accordion-item .gdc-keyword")).toHaveTextContent("Orks Psyker");
    expect(container.textContent).not.toMatch(/<\/?(?:k|b|i)>/);
  });

  it("resolves translated markup and falls back to English for missing translations", () => {
    state.settings.language = "de";
    delete state.faction.rules.army[0].rules[0].text.de;
    const { container } = render(<MobileFaction />);
    fireEvent.click(screen.getByRole("button", { name: "Da Boss" }));
    fireEvent.click(screen.getByRole("button", { name: "Unstable energies" }));
    expect(container.querySelector(".gdc-keyword")).toHaveTextContent("Warlord");
    expect(container.querySelector("strong em, b i")).toHaveTextContent("Psionikerstufe 3");
  });

  it("renders HTML lists and single line breaks in new rules", () => {
    state.faction.rules.army = [
      rule("Da Boss", "First line.\nSecond line.\n\n<ul><li><k>Orks</k> only</li><li>Another option</li></ul>"),
    ];
    const { container } = render(<MobileFaction />);
    fireEvent.click(screen.getByRole("button", { name: "Da Boss" }));
    expect(container.querySelectorAll(".rule-content li")).toHaveLength(2);
    expect(container.querySelectorAll(".rule-content br")).toHaveLength(1);
    expect(container.querySelector("li .gdc-keyword")).toHaveTextContent("Orks");
  });

  it("preserves Markdown and paragraph breaks for existing 10e rules", () => {
    state.settings.selectedDataSource = "40k-10e";
    state.faction.rules.army = [{ name: "Waaagh!", rules: [{ type: "text", text: "**ORKS**\nSecond paragraph." }] }];
    state.faction.rules.detachment = [];
    const { container } = render(<MobileFaction />);
    fireEvent.click(screen.getByRole("button", { name: "Waaagh!" }));
    expect(container.querySelector("strong")).toHaveTextContent("ORKS");
    expect(container.querySelectorAll(".rule-text p")).toHaveLength(2);
  });
});
