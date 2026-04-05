import { render, screen } from "@testing-library/react";
import { IconLabel } from "../components/IconLabel";

describe("IconLabel", () => {
  it("renders icon and label", () => {
    const { container } = render(<IconLabel icon="Check" label="Unit" />);
    expect(container.querySelector(".help-icon-label-icon")).toBeInTheDocument();
    expect(screen.getByText("Unit")).toBeInTheDocument();
  });

  it("applies custom color via CSS variable", () => {
    const { container } = render(<IconLabel icon="Check" label="Unit" color="#52c41a" />);
    const el = container.querySelector(".help-icon-label");
    expect(el.style.getPropertyValue("--icon-label-color")).toBe("#52c41a");
  });

  it("renders label text with correct class", () => {
    const { container } = render(<IconLabel icon="Swords" label="Melee" />);
    expect(container.querySelector(".help-icon-label-text").textContent).toBe("Melee");
  });
});
