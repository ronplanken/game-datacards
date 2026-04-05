import { render, screen } from "@testing-library/react";
import { OnboardingLeftPanel } from "../OnboardingLeftPanel";

vi.mock("lucide-react", () => ({
  Database: (props) => <svg data-testid="icon-database" {...props} />,
}));

describe("OnboardingLeftPanel", () => {
  it("renders heading", () => {
    render(<OnboardingLeftPanel />);
    expect(screen.getByText("Custom Datasources")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<OnboardingLeftPanel />);
    expect(screen.getByText(/Build your own card formats with custom fields, stats, and layouts/)).toBeInTheDocument();
  });

  it("renders database icon", () => {
    render(<OnboardingLeftPanel />);
    expect(screen.getByTestId("icon-database")).toBeInTheDocument();
  });
});
