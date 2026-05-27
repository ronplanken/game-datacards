import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getMessages } from "../Helpers/external.helpers";
import {
  buildNotificationItems,
  formatTimestamp,
  getUpdateNotification,
  isNotificationUnread,
  markUpdateRead,
} from "../Helpers/notifications";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { useUpdateCheck } from "../Hooks/useUpdateCheck";
import "./NotificationBell.css";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastMessageId, setLastMessageId] = useState(0);
  const { settings, updateSettings } = useSettingsStorage();
  const { updateKind, latestVersion, reload } = useUpdateCheck();
  const containerRef = useRef(null);
  const currentVersion = import.meta.env.VITE_VERSION;

  // Fetch messages on mount
  useEffect(() => {
    getMessages().then((data) => {
      if (data) {
        setMessages(data.messages || []);
        setLastMessageId(data.lastMessageId || 0);
      }
    });
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Remote operational messages, bundled release notes, and the client update
  // nudge share one feed, newest first. Each carries a `source` so unread state
  // uses the right cursor (id, last-read version, or the session update flag).
  const updateItem = getUpdateNotification(updateKind);
  const items = buildNotificationItems(messages, updateItem);

  const isActiveUnread = (item) => isNotificationUnread(item, settings, latestVersion);
  const unreadCount = items.filter(isActiveUnread).length;

  const markAllRead = () => {
    updateSettings({ ...settings, serviceMessage: lastMessageId, lastReadReleaseVersion: currentVersion });
    if (updateItem) markUpdateRead(latestVersion);
    setIsOpen(false);
  };

  return (
    <div className="notification-bell-container dark-dropdown" ref={containerRef}>
      <button
        className={`app-header-icon-btn notification-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      <div className={`notification-dropdown ${isOpen ? "notification-dropdown--open" : ""}`}>
        <div className="notification-dropdown-header">
          <h4>Notifications</h4>
          {unreadCount > 0 && (
            <button className="notification-mark-read-btn" onClick={markAllRead}>
              Mark all read
            </button>
          )}
        </div>
        <div className="notification-dropdown-body">
          {items.length === 0 ? (
            <div className="notification-empty">
              <Bell size={32} strokeWidth={1.5} />
              <p>You&apos;re all caught up</p>
            </div>
          ) : (
            items.map((msg, index) => (
              <div
                key={msg.key}
                className={`notification-item ${
                  isActiveUnread(msg) ? "notification-item--unread" : ""
                } ${isOpen && index < 5 ? "notification-item--animate" : ""}`}>
                <div className="notification-item-header">
                  <span className="notification-item-title">{msg.title}</span>
                  {msg.severity && (
                    <span className={`notification-item-severity notification-item-severity--${msg.severity}`}>
                      {msg.severity}
                    </span>
                  )}
                  {isActiveUnread(msg) && <span className="notification-item-badge">New</span>}
                </div>
                <p className="notification-item-body">{msg.body}</p>
                {msg.source === "update" && (
                  <button className="notification-item-action" onClick={reload}>
                    Reload
                  </button>
                )}
                <div className="notification-item-meta">
                  {msg.author && <span className="notification-item-author">{msg.author}</span>}
                  {msg.timestamp && <span className="notification-item-time">{formatTimestamp(msg.timestamp)}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
