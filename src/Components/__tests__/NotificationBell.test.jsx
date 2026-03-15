import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock CSS
vi.mock("../NotificationBell.css", () => ({}));

// Mock external helpers
const mockGetMessages = vi.fn();
vi.mock("../../Helpers/external.helpers", () => ({
  getMessages: () => mockGetMessages(),
}));

// Mock useSettingsStorage
const mockUpdateSettings = vi.fn();
let mockSettings = { serviceMessage: 0 };
vi.mock("../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({
    settings: mockSettings,
    updateSettings: mockUpdateSettings,
  }),
}));

import { NotificationBell } from "../NotificationBell";

const mockMessages = {
  messages: [
    { id: 1, title: "First", body: "First message", severity: "info", author: "Admin", timestamp: 1700000000 },
    { id: 2, title: "Second", body: "Second message", severity: "warning", timestamp: 1700000100 },
    { id: 3, title: "Third", body: "Third message", severity: "error", timestamp: 1700000200 },
  ],
  lastMessageId: 3,
};

describe("NotificationBell", () => {
  beforeEach(() => {
    mockGetMessages.mockResolvedValue(mockMessages);
    mockUpdateSettings.mockReset();
    mockSettings = { serviceMessage: 0 };
  });

  afterEach(() => {
    cleanup();
  });

  it("renders bell button", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  it("shows unread badge when there are unread messages", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("does not show badge when all messages are read", async () => {
    mockSettings = { serviceMessage: 3 };
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });
  });

  it("opens dropdown with class toggle on click", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    // Dropdown should be hidden initially (no --open class)
    const dropdown = screen.getByText("Notifications").closest(".notification-dropdown");
    expect(dropdown).not.toHaveClass("notification-dropdown--open");

    const bellBtn = document.querySelector(".notification-bell-btn");
    await user.click(bellBtn);

    expect(dropdown).toHaveClass("notification-dropdown--open");
  });

  it("shows empty state with correct copy when no messages", async () => {
    mockGetMessages.mockResolvedValue({ messages: [], lastMessageId: 0 });
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("You\u0027re all caught up")).toBeInTheDocument();
    });
  });

  it("renders notification items with titles", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });
  });

  it("shows New badge on unread items", async () => {
    mockSettings = { serviceMessage: 1 };
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      const badges = screen.getAllByText("New");
      expect(badges).toHaveLength(2);
    });
  });

  it("shows severity badges", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("info")).toBeInTheDocument();
      expect(screen.getByText("warning")).toBeInTheDocument();
      expect(screen.getByText("error")).toBeInTheDocument();
    });
  });

  it("shows Mark all read button when there are unread messages", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Mark all read")).toBeInTheDocument();
    });
  });

  it("marks all read and closes dropdown", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Mark all read")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Mark all read"));

    expect(mockUpdateSettings).toHaveBeenCalledWith({ serviceMessage: 3 });
  });

  it("closes dropdown on Escape key", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    const dropdown = screen.getByText("Notifications").closest(".notification-dropdown");
    expect(dropdown).toHaveClass("notification-dropdown--open");

    await user.keyboard("{Escape}");

    expect(dropdown).not.toHaveClass("notification-dropdown--open");
  });

  it("adds stagger animation class to first 5 items when open", async () => {
    const manyMessages = {
      messages: Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        title: `Message ${i + 1}`,
        body: `Body ${i + 1}`,
      })),
      lastMessageId: 6,
    };
    mockGetMessages.mockResolvedValue(manyMessages);
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      const items = document.querySelectorAll(".notification-item--animate");
      expect(items.length).toBe(5);
    });
  });
});
