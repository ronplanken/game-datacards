import { render, screen } from "@testing-library/react";
import { Callout } from "../components/Callout";

vi.mock("lucide-react", () => ({
  Info: (props) => <svg data-testid="icon-info" {...props} />,
  Lightbulb: (props) => <svg data-testid="icon-lightbulb" {...props} />,
  AlertTriangle: (props) => <svg data-testid="icon-alert-triangle" {...props} />,
}));

describe("Callout", () => {
  it("renders tip variant with correct icon and label", () => {
    render(<Callout type="tip">Tip content</Callout>);
    expect(screen.getByTestId("icon-lightbulb")).toBeInTheDocument();
    expect(screen.getByText("Tip")).toBeInTheDocument();
    expect(screen.getByText("Tip content")).toBeInTheDocument();
  });

  it("renders info variant with correct icon and label", () => {
    render(<Callout type="info">Info content</Callout>);
    expect(screen.getByTestId("icon-info")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("Info content")).toBeInTheDocument();
  });

  it("renders warning variant with correct icon and label", () => {
    render(<Callout type="warning">Warning content</Callout>);
    expect(screen.getByTestId("icon-alert-triangle")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Warning content")).toBeInTheDocument();
  });

  it("defaults to info when no type is provided", () => {
    render(<Callout>Default content</Callout>);
    expect(screen.getByTestId("icon-info")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("applies correct CSS class for each type", () => {
    const { container } = render(<Callout type="warning">Content</Callout>);
    expect(container.querySelector(".help-callout-warning")).toBeInTheDocument();
  });

  it("uses role=alert for warning type", () => {
    render(<Callout type="warning">Warning content</Callout>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses role=note for tip and info types", () => {
    render(<Callout type="tip">Tip content</Callout>);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });
});
