import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock CSS
vi.mock("../DatasourceSelector.css", () => ({}));

// Mock compare-versions
vi.mock("compare-versions", () => ({
  compare: () => false,
}));

// Mock moment
vi.mock("moment", () => {
  const m = () => ({ diff: () => 0 });
  m.default = m;
  return { default: m };
});

// Mock useDataSourceStorage
const mockCheckForUpdate = vi.fn().mockResolvedValue(undefined);
vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: { version: "1.0.0", lastCheckedForUpdate: null },
    checkForUpdate: mockCheckForUpdate,
  }),
}));

// Mock useSettingsStorage
let mockSettings = { selectedDataSource: "basic", customDatasources: [] };
const mockUpdateSettings = vi.fn();
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({
    settings: mockSettings,
    updateSettings: mockUpdateSettings,
  }),
}));

// Mock useFeatureFlags
vi.mock("../../../Hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({
    communityBrowserEnabled: true,
  }),
}));

// Mock Premium
vi.mock("../../../Premium", () => ({
  CustomDatasourceModal: () => null,
  CommunityBrowserModal: () => null,
}));

import { DatasourceSelector } from "../DatasourceSelector";

describe("DatasourceSelector", () => {
  beforeEach(() => {
    mockSettings = { selectedDataSource: "basic", customDatasources: [] };
    mockUpdateSettings.mockReset();
    mockCheckForUpdate.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders selector button with current datasource name", () => {
    render(<DatasourceSelector />);
    const btn = document.querySelector(".ds-selector-btn");
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toContain("Basic Cards");
  });

  it("renders selector button for 40k datasource", () => {
    mockSettings = { ...mockSettings, selectedDataSource: "40k-10e" };
    render(<DatasourceSelector />);
    const btn = document.querySelector(".ds-selector-btn");
    expect(btn.textContent).toContain("40k 10th Edition");
  });

  it("does not render dropdown when closed", () => {
    render(<DatasourceSelector />);
    const dropdown = document.querySelector(".ds-dropdown");
    expect(dropdown).toBeNull();
  });

  it("renders dropdown portal on click with dark-dropdown class", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    const btn = document.querySelector(".ds-selector-btn");
    await user.click(btn);

    const dropdown = document.querySelector(".ds-dropdown");
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveClass("dark-dropdown");
    expect(dropdown).toHaveClass("ds-dropdown--open");
  });

  it("shows all built-in datasources in dropdown", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    const btn = document.querySelector(".ds-selector-btn");
    await user.click(btn);

    const dropdown = document.querySelector(".ds-dropdown");
    expect(dropdown.textContent).toContain("Basic Cards");
    expect(dropdown.textContent).toContain("40k 10th Edition");
    expect(dropdown.textContent).toContain("40k Combat Patrol");
    expect(dropdown.textContent).toContain("Wahapedia 9th Edition");
    expect(dropdown.textContent).toContain("Necromunda");
    expect(dropdown.textContent).toContain("Age of Sigmar");
  });

  it("shows selected state for current datasource", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    const btn = document.querySelector(".ds-selector-btn");
    await user.click(btn);

    const items = document.querySelectorAll(".ds-dropdown-item.selected");
    expect(items.length).toBe(1);
  });

  it("selects a different datasource on click", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    const btn = document.querySelector(".ds-selector-btn");
    await user.click(btn);

    await user.click(screen.getByText("Necromunda"));

    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ selectedDataSource: "necromunda" }));
  });

  it("shows Check for updates button for built-in datasources", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    await user.click(document.querySelector(".ds-selector-btn"));

    expect(screen.getByText("Check for updates")).toBeInTheDocument();
  });

  it("shows Browse Community button when enabled", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    await user.click(document.querySelector(".ds-selector-btn"));

    expect(screen.getByText("Browse Community")).toBeInTheDocument();
  });

  it("shows Add external datasource button", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    await user.click(document.querySelector(".ds-selector-btn"));

    expect(screen.getByText("Add external datasource")).toBeInTheDocument();
  });

  it("shows subscribed datasources section when present", async () => {
    mockSettings = {
      selectedDataSource: "basic",
      customDatasources: [{ id: "sub-1", name: "Subscribed DS", isSubscribed: true }],
    };
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    await user.click(document.querySelector(".ds-selector-btn"));

    expect(screen.getByText("Subscribed")).toBeInTheDocument();
    expect(screen.getByText("Subscribed DS")).toBeInTheDocument();
  });

  it("shows custom datasources section when present", async () => {
    mockSettings = {
      selectedDataSource: "basic",
      customDatasources: [{ id: "custom-1", name: "My Custom DS", isSubscribed: false, sourceType: "local" }],
    };
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    await user.click(document.querySelector(".ds-selector-btn"));

    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByText("My Custom DS")).toBeInTheDocument();
  });

  it("closes dropdown on Escape key", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    await user.click(document.querySelector(".ds-selector-btn"));
    expect(document.querySelector(".ds-dropdown")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(document.querySelector(".ds-dropdown")).toBeNull();
  });

  it("rotates chevron when open", async () => {
    const user = userEvent.setup();
    render(<DatasourceSelector />);

    const chevron = document.querySelector(".ds-selector-chevron");
    expect(chevron).not.toHaveClass("rotated");

    await user.click(document.querySelector(".ds-selector-btn"));

    expect(chevron).toHaveClass("rotated");
  });
});
