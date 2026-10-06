import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DesignerBetaModal } from "../DesignerBetaModal";

describe("DesignerBetaModal", () => {
  let modalRoot;

  beforeEach(() => {
    vi.useFakeTimers();
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.removeChild(modalRoot);
  });

  it("renders the beta disclaimer when visible", () => {
    render(<DesignerBetaModal visible={true} onAccept={vi.fn()} onDecline={vi.fn()} />);
    expect(screen.getByText("Card Designer")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("does not render content when not visible", () => {
    render(<DesignerBetaModal visible={false} onAccept={vi.fn()} onDecline={vi.fn()} />);
    expect(screen.queryByText("Card Designer")).not.toBeInTheDocument();
  });

  it("calls onAccept after exit animation when accept button is clicked", () => {
    const onAccept = vi.fn();
    render(<DesignerBetaModal visible={true} onAccept={onAccept} onDecline={vi.fn()} />);
    fireEvent.click(screen.getByText("I understand, let's go"));
    expect(onAccept).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onDecline after exit animation when decline button is clicked", () => {
    const onDecline = vi.fn();
    render(<DesignerBetaModal visible={true} onAccept={vi.fn()} onDecline={onDecline} />);
    fireEvent.click(screen.getByText("Go back"));
    expect(onDecline).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it("displays the disclaimer body text", () => {
    render(<DesignerBetaModal visible={true} onAccept={vi.fn()} onDecline={vi.fn()} />);
    expect(
      screen.getByText(/The Card Designer is an early feature that's still actively being developed/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Templates you create during the beta are not guaranteed to remain compatible/),
    ).toBeInTheDocument();
    expect(screen.getByText(/provided as-is and that template compatibility may change/)).toBeInTheDocument();
  });
});
