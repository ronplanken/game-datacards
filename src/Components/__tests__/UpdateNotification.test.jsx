import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { UpdateNotification } from "../UpdateNotification";

const mockDismiss = vi.fn();
const mockReload = vi.fn();
let mockUpdateAvailable = false;

vi.mock("../../Hooks/useUpdateChecker", () => ({
  useUpdateChecker: () => ({
    updateAvailable: mockUpdateAvailable,
    latestVersion: mockUpdateAvailable ? "3.6.0" : null,
    dismiss: mockDismiss,
    reload: mockReload,
  }),
}));

describe("UpdateNotification", () => {
  afterEach(() => {
    mockUpdateAvailable = false;
    vi.clearAllMocks();
  });

  it("renders nothing when no update is available", () => {
    mockUpdateAvailable = false;
    const { container } = render(<UpdateNotification />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the banner when an update is available", () => {
    mockUpdateAvailable = true;
    render(<UpdateNotification />);
    expect(screen.getByText("A new version is available")).toBeInTheDocument();
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("calls reload when Refresh is clicked", () => {
    mockUpdateAvailable = true;
    render(<UpdateNotification />);
    fireEvent.click(screen.getByText("Refresh"));
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("calls dismiss when X is clicked", () => {
    mockUpdateAvailable = true;
    render(<UpdateNotification />);
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("has role=alert for accessibility", () => {
    mockUpdateAvailable = true;
    render(<UpdateNotification />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
