import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { PostCreateBanner } from "../PostCreateBanner";

vi.mock("lucide-react", () => ({
  CheckCircle2: (props) => <svg data-testid="icon-check" {...props} />,
  X: (props) => <svg data-testid="icon-x" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Settings: (props) => <svg data-testid="icon-settings" {...props} />,
  HelpCircle: (props) => <svg data-testid="icon-help" {...props} />,
}));

const renderBanner = (props = {}) =>
  render(
    <MemoryRouter>
      <PostCreateBanner {...defaultProps} {...props} />
    </MemoryRouter>,
  );

const defaultProps = {
  datasourceName: "My Datasource",
  onDismiss: vi.fn(),
  onAddCardType: vi.fn(),
  onSelectDatasource: vi.fn(),
};

describe("PostCreateBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders datasource name", () => {
    renderBanner();
    expect(screen.getByText(/My Datasource/)).toBeInTheDocument();
  });

  it("renders next steps text", () => {
    renderBanner();
    expect(screen.getByText("Here are some things to try next:")).toBeInTheDocument();
  });

  it("calls onDismiss when close button clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onDismiss = vi.fn();
    renderBanner({ onDismiss });
    await user.click(screen.getByLabelText("Dismiss"));
    // Wait for exit animation timeout
    act(() => vi.advanceTimersByTime(200));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses after 15 seconds", () => {
    const onDismiss = vi.fn();
    renderBanner({ onDismiss });
    act(() => vi.advanceTimersByTime(15000));
    // Exit animation timeout
    act(() => vi.advanceTimersByTime(200));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("calls onAddCardType when action clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onAddCardType = vi.fn();
    renderBanner({ onAddCardType });
    await user.click(screen.getByText("Add another card type"));
    expect(onAddCardType).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectDatasource when action clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSelectDatasource = vi.fn();
    renderBanner({ onSelectDatasource });
    await user.click(screen.getByText("Edit datasource settings"));
    expect(onSelectDatasource).toHaveBeenCalledTimes(1);
  });

  it("renders help link pointing to new help route", () => {
    renderBanner();
    const link = screen.getByText("Read the docs");
    expect(link.closest("a")).toHaveAttribute("href", "/help/datasource-editor/getting-started");
  });
});
