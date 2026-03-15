import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "../components/ConfirmDialog";

vi.mock("lucide-react", () => ({
  AlertTriangle: (props) => <svg data-testid="icon-alert-triangle" {...props} />,
}));

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    title: "Delete Item",
    message: "Are you sure?",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onConfirm.mockClear();
    defaultProps.onCancel.mockClear();
  });

  it("renders nothing when open is false", () => {
    const { container } = render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders dialog when open is true", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("renders alert icon", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByTestId("icon-alert-triangle")).toBeInTheDocument();
  });

  it("renders default button labels", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders custom button labels", () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Remove" cancelLabel="Keep" />);
    expect(screen.getByText("Remove")).toBeInTheDocument();
    expect(screen.getByText("Keep")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    await user.click(screen.getByText("Delete"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    await user.click(screen.getByText("Cancel"));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when overlay clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    await user.click(screen.getByRole("dialog"));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not call onCancel when dialog content clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    await user.click(screen.getByText("Are you sure?"));
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel on Escape key", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    await user.keyboard("{Escape}");
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("has aria-modal attribute", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });
});
