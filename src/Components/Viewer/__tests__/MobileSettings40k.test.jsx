import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MobileSettings40k } from "../MobileSettings40k";

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
