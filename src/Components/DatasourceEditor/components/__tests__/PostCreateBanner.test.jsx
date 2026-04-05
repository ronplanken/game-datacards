import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostCreateBanner } from "../PostCreateBanner";

vi.mock("lucide-react", () => ({
  CheckCircle2: (props) => <svg data-testid="icon-check" {...props} />,
  X: (props) => <svg data-testid="icon-x" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Settings: (props) => <svg data-testid="icon-settings" {...props} />,
  HelpCircle: (props) => <svg data-testid="icon-help" {...props} />,
}));

describe("PostCreateBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    datasourceName: "My Datasource",
    onDismiss: vi.fn(),
    onAddCardType: vi.fn(),
    onSelectDatasource: vi.fn(),
  };

  it("renders datasource name", () => {
    render(<PostCreateBanner {...defaultProps} />);
    expect(screen.getByText(/My Datasource/)).toBeInTheDocument();
  });

  it("renders next steps text", () => {
    render(<PostCreateBanner {...defaultProps} />);
    expect(screen.getByText("Here are some things to try next:")).toBeInTheDocument();
  });

  it("calls onDismiss when close button clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onDismiss = vi.fn();
    render(<PostCreateBanner {...defaultProps} onDismiss={onDismiss} />);
    await user.click(screen.getByLabelText("Dismiss"));
    // Wait for exit animation timeout
    act(() => vi.advanceTimersByTime(200));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses after 15 seconds", () => {
    const onDismiss = vi.fn();
    render(<PostCreateBanner {...defaultProps} onDismiss={onDismiss} />);
    act(() => vi.advanceTimersByTime(15000));
    // Exit animation timeout
    act(() => vi.advanceTimersByTime(200));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("calls onAddCardType when action clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onAddCardType = vi.fn();
    render(<PostCreateBanner {...defaultProps} onAddCardType={onAddCardType} />);
    await user.click(screen.getByText("Add another card type"));
    expect(onAddCardType).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectDatasource when action clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSelectDatasource = vi.fn();
    render(<PostCreateBanner {...defaultProps} onSelectDatasource={onSelectDatasource} />);
    await user.click(screen.getByText("Edit datasource settings"));
    expect(onSelectDatasource).toHaveBeenCalledTimes(1);
  });

  it("renders help link pointing to new help route", () => {
    render(<PostCreateBanner {...defaultProps} />);
    const link = screen.getByText("Read the guide");
    expect(link.closest("a")).toHaveAttribute("href", "/help/datasource-editor/getting-started");
  });
});
