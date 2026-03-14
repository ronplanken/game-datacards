import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileGameSystemSelector } from "../MobileGameSystemSelector";

// Mock the logo import
vi.mock("../../../Images/logo.png", () => ({ default: "logo.png" }));

// Mock the config
vi.mock("../mobileDatasourceConfig", () => ({
  SELECTOR_SYSTEMS: [
    { id: "40k-10e", name: "Warhammer 40,000", meta: "10th Edition", cssClass: "gss-option-40k" },
    { id: "aos", name: "Age of Sigmar", meta: "4th Edition", cssClass: "gss-option-aos" },
  ],
}));

describe("MobileGameSystemSelector", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders built-in options from SELECTOR_SYSTEMS", () => {
    render(<MobileGameSystemSelector onSelect={mockOnSelect} />);
    expect(screen.getByText("Warhammer 40,000")).toBeTruthy();
    expect(screen.getByText("Age of Sigmar")).toBeTruthy();
    expect(screen.getByText("10th Edition")).toBeTruthy();
    expect(screen.getByText("4th Edition")).toBeTruthy();
  });

  it("calls onSelect with correct ID when built-in is clicked", () => {
    render(<MobileGameSystemSelector onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByText("Warhammer 40,000"));
    expect(mockOnSelect).toHaveBeenCalledWith("40k-10e");
  });

  it("hides custom sections when arrays are empty", () => {
    render(<MobileGameSystemSelector onSelect={mockOnSelect} />);
    expect(screen.queryByText("Your Datasources")).toBeNull();
    expect(screen.queryByText("Subscribed")).toBeNull();
  });

  it("renders custom datasources in Your Datasources section", () => {
    const customDatasources = [{ id: "custom-123", name: "My Custom DS", sourceType: "local" }];
    const datasourceColours = { "custom-123": "#ff0000" };
    render(
      <MobileGameSystemSelector
        onSelect={mockOnSelect}
        customDatasources={customDatasources}
        datasourceColours={datasourceColours}
      />,
    );
    expect(screen.getByText("Your Datasources")).toBeTruthy();
    expect(screen.getByText("My Custom DS")).toBeTruthy();
  });

  it("renders local datasources in Your Datasources section", () => {
    const localDatasources = [{ uuid: "local-uuid", name: "Local Datasource", colours: { banner: "#00ff00" } }];
    render(<MobileGameSystemSelector onSelect={mockOnSelect} localDatasources={localDatasources} />);
    expect(screen.getByText("Your Datasources")).toBeTruthy();
    expect(screen.getByText("Local Datasource")).toBeTruthy();
  });

  it("calls onSelect with local-ds- prefix for local datasources", () => {
    const localDatasources = [{ uuid: "local-uuid", name: "Local Datasource", colours: { banner: "#00ff00" } }];
    render(<MobileGameSystemSelector onSelect={mockOnSelect} localDatasources={localDatasources} />);
    fireEvent.click(screen.getByText("Local Datasource"));
    expect(mockOnSelect).toHaveBeenCalledWith("local-ds-local-uuid");
  });

  it("renders subscribed datasources in Subscribed section", () => {
    const subscribedDatasources = [{ id: "subscribed-abc", name: "Sub DS", isSubscribed: true }];
    const datasourceColours = { "subscribed-abc": "#0000ff" };
    render(
      <MobileGameSystemSelector
        onSelect={mockOnSelect}
        subscribedDatasources={subscribedDatasources}
        datasourceColours={datasourceColours}
      />,
    );
    expect(screen.getByText("Subscribed")).toBeTruthy();
    expect(screen.getByText("Sub DS")).toBeTruthy();
  });

  it("calls onSelect with correct ID for subscribed datasource", () => {
    const subscribedDatasources = [{ id: "subscribed-abc", name: "Sub DS", isSubscribed: true }];
    render(<MobileGameSystemSelector onSelect={mockOnSelect} subscribedDatasources={subscribedDatasources} />);
    fireEvent.click(screen.getByText("Sub DS"));
    expect(mockOnSelect).toHaveBeenCalledWith("subscribed-abc");
  });

  it("separates subscribed from owned in custom datasources", () => {
    const customDatasources = [
      { id: "custom-1", name: "Owned DS", sourceType: "local" },
      { id: "subscribed-2", name: "Subscribed DS", isSubscribed: true },
    ];
    const subscribedDatasources = [{ id: "subscribed-2", name: "Subscribed DS", isSubscribed: true }];
    const datasourceColours = { "custom-1": "#ff0000", "subscribed-2": "#0000ff" };
    render(
      <MobileGameSystemSelector
        onSelect={mockOnSelect}
        customDatasources={customDatasources}
        subscribedDatasources={subscribedDatasources}
        datasourceColours={datasourceColours}
      />,
    );
    expect(screen.getByText("Your Datasources")).toBeTruthy();
    expect(screen.getByText("Owned DS")).toBeTruthy();
    expect(screen.getByText("Subscribed")).toBeTruthy();
    expect(screen.getByText("Subscribed DS")).toBeTruthy();
  });
});
