import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HelpSidebar } from "../components/HelpSidebar";

vi.mock("lucide-react", () => ({
  ArrowLeft: (props) => <svg data-testid="icon-arrow-left" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
  Database: (props) => <svg data-testid="icon-database" {...props} />,
  PenTool: (props) => <svg data-testid="icon-pen-tool" {...props} />,
  CreditCard: (props) => <svg data-testid="icon-credit-card" {...props} />,
  Cloud: (props) => <svg data-testid="icon-cloud" {...props} />,
  Wrench: (props) => <svg data-testid="icon-wrench" {...props} />,
  Search: (props) => <svg data-testid="icon-search" {...props} />,
}));

const renderSidebar = (path = "/help") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <HelpSidebar isOpen={false} onClose={vi.fn()} />
    </MemoryRouter>,
  );

describe("HelpSidebar", () => {
  it("renders all category headers", () => {
    renderSidebar();
    expect(screen.getByText("Datasource Editor")).toBeInTheDocument();
    expect(screen.getByText("Card Designer")).toBeInTheDocument();
    expect(screen.getByText("Subscriptions")).toBeInTheDocument();
    expect(screen.getByText("Cloud Sync")).toBeInTheDocument();
    expect(screen.getByText("Troubleshooting")).toBeInTheDocument();
  });

  it("auto-expands category containing current page", () => {
    renderSidebar("/help/cloud-sync/how-sync-works");
    expect(screen.getByText("Resolving Conflicts")).toBeInTheDocument();
  });

  it("does not expand unrelated categories by default", () => {
    renderSidebar("/help/datasource-editor/getting-started");
    expect(screen.queryByText("Printing")).not.toBeInTheDocument();
  });

  it("expands category on click", async () => {
    const user = userEvent.setup();
    renderSidebar("/help");
    expect(screen.queryByText("Common Issues")).not.toBeInTheDocument();
    await user.click(screen.getByText("Troubleshooting"));
    expect(screen.getByText("Common Issues")).toBeInTheDocument();
  });

  it("filters sections by search query", async () => {
    const user = userEvent.setup();
    renderSidebar("/help");
    await user.click(screen.getByText("Troubleshooting"));
    const input = screen.getByPlaceholderText("Search docs...");
    await user.type(input, "printing");
    expect(screen.getByText("Printing")).toBeInTheDocument();
    expect(screen.queryByText("Template Presets")).not.toBeInTheDocument();
  });

  it("renders back to app button", () => {
    renderSidebar();
    expect(screen.getByText("Back to App")).toBeInTheDocument();
  });

  it("shows empty state when search has no results", async () => {
    const user = userEvent.setup();
    renderSidebar("/help");
    const input = screen.getByPlaceholderText("Search docs...");
    await user.type(input, "xyznonexistent");
    expect(screen.getByText("No articles match your search.")).toBeInTheDocument();
  });
});
