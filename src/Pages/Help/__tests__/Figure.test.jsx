import { render, screen } from "@testing-library/react";
import { Figure } from "../components/Figure";

describe("Figure", () => {
  it("renders image with src and alt", () => {
    render(<Figure src="/images/help/test.png" alt="Test screenshot" />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("/images/help/test.png");
    expect(img.getAttribute("alt")).toBe("Test screenshot");
  });

  it("renders caption when provided", () => {
    render(<Figure src="/test.png" alt="Test" caption="The datasource editor workspace" />);
    expect(screen.getByText("The datasource editor workspace")).toBeInTheDocument();
  });

  it("renders without caption when not provided", () => {
    const { container } = render(<Figure src="/test.png" alt="Test" />);
    expect(container.querySelector(".help-figure-caption")).toBeNull();
  });

  it("uses caption as alt fallback", () => {
    render(<Figure src="/test.png" caption="Fallback alt" />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("alt")).toBe("Fallback alt");
  });
});
