import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// FactionSettingsModal resolves its portal target at import time, so the root
// has to exist before the module is evaluated.
vi.hoisted(() => {
  const root = document.createElement("div");
  root.setAttribute("id", "modal-root");
  document.body.appendChild(root);
});

const mockState = {
  dataSource: {},
  selectedFaction: {},
  settings: {},
  updateSettings: vi.fn(),
};

vi.mock("../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: mockState.dataSource, selectedFaction: mockState.selectedFaction }),
}));
vi.mock("../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: mockState.settings, updateSettings: mockState.updateSettings }),
}));

import { FactionSettingsModal } from "../FactionSettingsModal";

// The 11e datasource sets noDatasheetByRole/noSubfactionOptions, so the
// datasheets tab opens by default and shows no "Split datasheets by role" card.
const ELEVENTH_EDITION_DATASOURCE = {
  noDatasheetOptions: false,
  noDatasheetByRole: true,
  noStratagemOptions: false,
  noSubfactionOptions: true,
  noSecondaryOptions: true,
};

const openModal = () => fireEvent.click(document.querySelector(".faction-settings-trigger"));

describe("FactionSettingsModal", () => {
  beforeEach(() => {
    mockState.updateSettings = vi.fn();
    mockState.selectedFaction = { id: "orks", name: "Orks" };
  });

  it("offers the 40k display options on the 11th edition datasource", () => {
    mockState.dataSource = ELEVENTH_EDITION_DATASOURCE;
    mockState.settings = { selectedDataSource: "40k-11e" };

    render(<FactionSettingsModal />);
    openModal();

    expect(screen.getByText("Warhammer 11th edition options")).toBeInTheDocument();
    expect(screen.getByText("Group cards by role")).toBeInTheDocument();
    expect(screen.getByText("Show points in listview")).toBeInTheDocument();
    expect(screen.getByText("Show both sides on one page")).toBeInTheDocument();
  });

  it("hides the Legends and allied toggles on 11e, whose data ships neither", () => {
    mockState.dataSource = ELEVENTH_EDITION_DATASOURCE;
    mockState.settings = { selectedDataSource: "40k-11e" };

    render(<FactionSettingsModal />);
    openModal();

    expect(screen.queryByText("Add Legends datacards to factions")).not.toBeInTheDocument();
    expect(screen.queryByText("Add allied faction cards to factions")).not.toBeInTheDocument();
  });

  it("keeps the 10th edition datacard toggles", () => {
    mockState.dataSource = { ...ELEVENTH_EDITION_DATASOURCE };
    mockState.settings = { selectedDataSource: "40k-10e" };

    render(<FactionSettingsModal />);
    openModal();

    expect(screen.getByText("Warhammer 10th edition options")).toBeInTheDocument();
    expect(screen.getByText("Add Legends datacards to factions")).toBeInTheDocument();
  });

  it("toggles group-by-role through updateSettings", () => {
    mockState.dataSource = ELEVENTH_EDITION_DATASOURCE;
    mockState.settings = { selectedDataSource: "40k-11e" };

    render(<FactionSettingsModal />);
    openModal();
    fireEvent.click(screen.getByText("Group cards by role"));

    expect(mockState.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ selectedDataSource: "40k-11e", groupByRole: true }),
    );
  });

  it("offers detachment grouping on the stratagems tab", () => {
    mockState.dataSource = ELEVENTH_EDITION_DATASOURCE;
    mockState.settings = { selectedDataSource: "40k-11e" };

    render(<FactionSettingsModal />);
    openModal();
    fireEvent.click(screen.getByText("Stratagems"));

    fireEvent.click(screen.getByText("Group stratagems by detachment"));
    expect(mockState.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ groupStratagemsByDetachment: true }),
    );
  });

  it("does not offer the 40k options on Age of Sigmar", () => {
    mockState.dataSource = { noDatasheetOptions: true, noSubfactionOptions: true, noStratagemOptions: true };
    mockState.settings = { selectedDataSource: "aos" };

    render(<FactionSettingsModal />);
    openModal();

    expect(screen.queryByText("Group cards by role")).not.toBeInTheDocument();
    expect(screen.getByText("Show Legends warscrolls")).toBeInTheDocument();
  });
});
