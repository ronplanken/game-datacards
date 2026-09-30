import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MobileSettings40k } from "../MobileSettings40k";

const mockVersions = { versions: [], isLoading: false, error: null };
vi.mock("../../../Hooks/use11eDataVersions", () => ({
  use11eDataVersions: () => mockVersions,
}));

describe("MobileSettings40k card language picker", () => {
  it("shows the language select for the 11th edition datasource", () => {
    const { getByLabelText } = render(
      <MobileSettings40k settings={{ selectedDataSource: "40k-11e", language: "de" }} updateSettings={vi.fn()} />,
    );
    const select = getByLabelText("Card language");
    expect(select.value).toBe("de");
    expect(select.querySelectorAll("option").length).toBeGreaterThanOrEqual(8);
  });

  it("hides the language select for 10th edition", () => {
    const { queryByLabelText } = render(
      <MobileSettings40k settings={{ selectedDataSource: "40k-10e" }} updateSettings={vi.fn()} />,
    );
    expect(queryByLabelText("Card language")).toBeNull();
  });

  it("updates the language setting on change", () => {
    const updateSettings = vi.fn();
    const { getByLabelText } = render(
      <MobileSettings40k
        settings={{ selectedDataSource: "40k-11e", language: "en" }}
        updateSettings={updateSettings}
      />,
    );
    fireEvent.change(getByLabelText("Card language"), { target: { value: "fr" } });
    expect(updateSettings).toHaveBeenCalledWith({ selectedDataSource: "40k-11e", language: "fr" });
  });
});

describe("MobileSettings40k data version picker", () => {
  const v946 = { version: 946, url: "https://example.test/sha946/11th/gdc" };

  it("shows Latest by default for the 11th edition datasource", () => {
    mockVersions.versions = [v946];
    const { getByLabelText } = render(
      <MobileSettings40k settings={{ selectedDataSource: "40k-11e" }} updateSettings={vi.fn()} />,
    );
    const select = getByLabelText("Data version");
    expect(select.value).toBe("latest");
    expect([...select.querySelectorAll("option")].map((o) => o.value)).toEqual(["latest", "946"]);
  });

  it("shows a disabled hint when older versions cannot be loaded", () => {
    mockVersions.versions = [];
    mockVersions.error = new Error("offline");
    const { getByLabelText } = render(
      <MobileSettings40k settings={{ selectedDataSource: "40k-11e" }} updateSettings={vi.fn()} />,
    );
    const hint = [...getByLabelText("Data version").querySelectorAll("option")].find(
      (o) => o.textContent === "Older versions unavailable",
    );
    expect(hint.disabled).toBe(true);
    mockVersions.error = null;
  });

  it("hides the data version select for 10th edition", () => {
    const { queryByLabelText } = render(
      <MobileSettings40k settings={{ selectedDataSource: "40k-10e" }} updateSettings={vi.fn()} />,
    );
    expect(queryByLabelText("Data version")).toBeNull();
  });

  it("stores the selected version and clears it again for Latest", () => {
    mockVersions.versions = [v946];
    const updateSettings = vi.fn();
    const { getByLabelText, rerender } = render(
      <MobileSettings40k settings={{ selectedDataSource: "40k-11e" }} updateSettings={updateSettings} />,
    );
    fireEvent.change(getByLabelText("Data version"), { target: { value: "946" } });
    expect(updateSettings).toHaveBeenLastCalledWith({ selectedDataSource: "40k-11e", dataVersion11e: v946 });

    rerender(
      <MobileSettings40k
        settings={{ selectedDataSource: "40k-11e", dataVersion11e: v946 }}
        updateSettings={updateSettings}
      />,
    );
    expect(getByLabelText("Data version").value).toBe("946");
    fireEvent.change(getByLabelText("Data version"), { target: { value: "latest" } });
    expect(updateSettings).toHaveBeenLastCalledWith({ selectedDataSource: "40k-11e", dataVersion11e: null });
  });
});
