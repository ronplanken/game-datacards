import { render } from "@testing-library/react";
import { Icon } from "../components/Icon";

describe("Icon", () => {
  it("renders a known icon inline", () => {
    // "Check" is exported from helpIcons.js
    const { container } = render(<Icon name="Check" />);
    expect(container.querySelector(".help-icon-inline")).toBeInTheDocument();
    // Should contain an svg element
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders with correct class name", () => {
    const { container } = render(<Icon name="Plus" />);
    expect(container.querySelector(".help-icon-inline")).toBeInTheDocument();
  });
});
