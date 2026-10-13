import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NameSection } from "../sections/NameSection";

const fields = [
  { key: "showRoleInName", label: "Show role in name", type: "boolean", default: true },
  { key: "era", label: "Era", type: "enum", options: ["Early", "Late"] },
];

describe("mobile name section extra fields", () => {
  it("shows the default when the card has no value and saves the toggled value", () => {
    const updateField = vi.fn();
    const { container } = render(
      <NameSection
        card={{ name: "Jagdpanzer IV" }}
        config={{ fields }}
        updateField={updateField}
        replaceCard={vi.fn()}
      />,
    );

    expect(screen.getByText("Show role in name")).toBeTruthy();
    const toggle = container.querySelector(".mobile-editor-toggle");
    expect(toggle.className).toContain("active");

    fireEvent.click(toggle);
    expect(updateField).toHaveBeenCalledWith("showRoleInName", false);
  });

  it("uses the value stored on the card", () => {
    const { container } = render(
      <NameSection
        card={{ name: "Jagdpanzer IV", showRoleInName: false }}
        config={{ fields }}
        updateField={vi.fn()}
        replaceCard={vi.fn()}
      />,
    );
    expect(container.querySelector(".mobile-editor-toggle").className).not.toContain("active");
  });
});
