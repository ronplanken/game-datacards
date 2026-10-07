import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ErrorDetails } from "../ErrorDetails";
import { setErrorContextCard } from "../../../Helpers/errorReport.helpers";

describe("ErrorDetails", () => {
  beforeEach(() => {
    setErrorContextCard(null);
    localStorage.setItem("settings", JSON.stringify({ selectedDataSource: "40k-11e", language: "en" }));
  });

  it("shows the debug fields for the error", () => {
    setErrorContextCard({ name: "Crusader Squad", cardType: "DataCard", source: "40k-11e" });
    render(<ErrorDetails error={new Error("boom")} />);

    expect(screen.getByText("Datasource")).toBeInTheDocument();
    expect(screen.getByText("40k-11e")).toBeInTheDocument();
    expect(screen.getByText("Crusader Squad, type DataCard, source 40k-11e")).toBeInTheDocument();
    expect(screen.getByText("Route")).toBeInTheDocument();
  });

  it("includes the component stack passed in after the boundary catches", () => {
    const error = new Error("boom");
    const { rerender, container } = render(<ErrorDetails error={error} />);
    expect(container.querySelector("pre").textContent).not.toContain("Component stack:");

    rerender(<ErrorDetails error={error} componentStack={"\n    at UnitCard"} />);
    expect(container.querySelector("pre").textContent).toContain("Component stack:\n    at UnitCard");
  });

  it("copies the report to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    render(<ErrorDetails error={new Error("boom")} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument());
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain("Error: boom");
    expect(writeText.mock.calls[0][0]).toContain("Datasource: 40k-11e");
  });

  it("tells the user when copying fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });

    render(<ErrorDetails error={new Error("boom")} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copy failed, select the text below" })).toBeInTheDocument(),
    );
  });
});
