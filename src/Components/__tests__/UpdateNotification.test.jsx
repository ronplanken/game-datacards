import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { UpdateNotification } from "../UpdateNotification";

const mockDismissBanner = vi.fn();
const mockReload = vi.fn();
let mockShowBanner = false;

vi.mock("../../Hooks/useUpdateCheck", () => ({
  useUpdateCheck: () => ({
    updateKind: mockShowBanner ? "minor" : "none",
    latestVersion: mockShowBanner ? "3.11.0" : null,
    showBanner: mockShowBanner,
    dismissBanner: mockDismissBanner,
    reload: mockReload,
  }),
}));

describe("UpdateNotification", () => {
  afterEach(() => {
    mockShowBanner = false;
    vi.clearAllMocks();
  });

  it("renders nothing when no feature release is available", () => {
    mockShowBanner = false;
    const { container } = render(<UpdateNotification />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the banner for a feature release", () => {
    mockShowBanner = true;
    render(<UpdateNotification />);
    expect(screen.getByText("A new version is available")).toBeInTheDocument();
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  it("calls reload when Update is clicked", () => {
    mockShowBanner = true;
    render(<UpdateNotification />);
    fireEvent.click(screen.getByText("Update"));
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("calls dismissBanner when X is clicked", () => {
    mockShowBanner = true;
    render(<UpdateNotification />);
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(mockDismissBanner).toHaveBeenCalledTimes(1);
  });

  it("has role=alert for accessibility", () => {
    mockShowBanner = true;
    render(<UpdateNotification />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
