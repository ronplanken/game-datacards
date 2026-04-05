import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingCenterPanel } from "../OnboardingCenterPanel";

vi.mock("lucide-react", () => ({
  Settings: (props) => <svg data-testid="icon-settings" {...props} />,
  PenLine: (props) => <svg data-testid="icon-penline" {...props} />,
  Printer: (props) => <svg data-testid="icon-printer" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
}));

describe("OnboardingCenterPanel", () => {
  it("renders heading", () => {
    render(<OnboardingCenterPanel onNewDatasource={vi.fn()} />);
    expect(screen.getByText("How It Works")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<OnboardingCenterPanel onNewDatasource={vi.fn()} />);
    expect(screen.getByText("Three steps to custom game cards")).toBeInTheDocument();
  });

  it("renders three step cards with correct titles", () => {
    render(<OnboardingCenterPanel onNewDatasource={vi.fn()} />);
    expect(screen.getByText("Define a Schema")).toBeInTheDocument();
    expect(screen.getByText("Add Cards")).toBeInTheDocument();
    expect(screen.getByText("Print & Share")).toBeInTheDocument();
  });

  it("renders step numbers", () => {
    render(<OnboardingCenterPanel onNewDatasource={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders Get Started CTA", () => {
    render(<OnboardingCenterPanel onNewDatasource={vi.fn()} />);
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("calls onNewDatasource when CTA clicked", async () => {
    const user = userEvent.setup();
    const onNewDatasource = vi.fn();
    render(<OnboardingCenterPanel onNewDatasource={onNewDatasource} />);
    await user.click(screen.getByText("Get Started"));
    expect(onNewDatasource).toHaveBeenCalledTimes(1);
  });

  it("renders help link pointing to new help route", () => {
    render(<OnboardingCenterPanel onNewDatasource={vi.fn()} />);
    const link = screen.getByText("Read the full guide");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/help/datasource-editor/getting-started");
  });
});
