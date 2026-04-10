import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { OnboardingCenterPanel } from "../OnboardingCenterPanel";

vi.mock("lucide-react", () => ({
  Settings: (props) => <svg data-testid="icon-settings" {...props} />,
  PenLine: (props) => <svg data-testid="icon-penline" {...props} />,
  Printer: (props) => <svg data-testid="icon-printer" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
}));

const renderPanel = (props = {}) =>
  render(
    <MemoryRouter>
      <OnboardingCenterPanel onNewDatasource={vi.fn()} {...props} />
    </MemoryRouter>,
  );

describe("OnboardingCenterPanel", () => {
  it("renders heading", () => {
    renderPanel();
    expect(screen.getByText("How It Works")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    renderPanel();
    expect(screen.getByText("Three steps to custom game cards")).toBeInTheDocument();
  });

  it("renders three step cards with correct titles", () => {
    renderPanel();
    expect(screen.getByText("Define a Schema")).toBeInTheDocument();
    expect(screen.getByText("Add Cards")).toBeInTheDocument();
    expect(screen.getByText("Print & Share")).toBeInTheDocument();
  });

  it("renders step numbers", () => {
    renderPanel();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders Create a Datasource CTA", () => {
    renderPanel();
    expect(screen.getByText("Create a Datasource")).toBeInTheDocument();
  });

  it("calls onNewDatasource when CTA clicked", async () => {
    const user = userEvent.setup();
    const onNewDatasource = vi.fn();
    renderPanel({ onNewDatasource });
    await user.click(screen.getByText("Create a Datasource"));
    expect(onNewDatasource).toHaveBeenCalledTimes(1);
  });

  it("renders help link pointing to new help route", () => {
    renderPanel();
    const link = screen.getByText("Read the docs");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/help/datasource-editor/getting-started");
  });
});
