import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasourceSelector } from "../DatasourceSelector";

const state = { settings: {}, dataSource: {} };

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: state.settings, updateSettings: vi.fn() }),
}));
vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: state.dataSource, checkForUpdate: vi.fn() }),
}));
vi.mock("../../../Hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({ communityBrowserEnabled: false }),
}));

const v946 = { version: 946, url: "https://example.test/sha946/11th/gdc" };

describe("DatasourceSelector data version badge", () => {
  beforeEach(() => {
    state.settings = { selectedDataSource: "40k-11e", customDatasources: [] };
    state.dataSource = { data: [], compatibleDataVersion: 963 };
  });

  it("shows the latest data version on the selector button", () => {
    render(<DatasourceSelector />);
    const badge = screen.getByLabelText("Data version 963 (latest)");
    expect(badge.textContent).toBe("963");
    expect(badge.className).not.toContain("ds-version-badge--pinned");
  });

  it("marks a pinned data version", () => {
    state.settings = { ...state.settings, dataVersion11e: v946 };
    render(<DatasourceSelector />);
    const badge = screen.getByLabelText("Pinned to data version 946");
    expect(badge.textContent).toBe("946");
    expect(badge.className).toContain("ds-version-badge--pinned");
  });

  it("shows the badge on the 11th edition row in the dropdown", () => {
    render(<DatasourceSelector />);
    fireEvent.click(screen.getByRole("button", { name: /40k 11th Edition/ }));
    const row = screen
      .getAllByRole("button", { name: /40k 11th Edition/ })
      .find((b) => b.className.includes("ds-dropdown-item"));
    expect(row.querySelector(".ds-version-badge").textContent).toBe("963");
  });

  it("shows no badge on the button for other datasources", () => {
    state.settings = { selectedDataSource: "40k-10e", customDatasources: [] };
    state.dataSource = { data: [] };
    render(<DatasourceSelector />);
    expect(screen.queryByLabelText(/data version/i)).toBeNull();
  });
});
