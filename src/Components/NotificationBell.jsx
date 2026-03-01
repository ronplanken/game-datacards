import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getMessages } from "../Helpers/external.helpers";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import "./NotificationBell.css";

// Format timestamp to relative time
const formatTimestamp = (timestamp) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastMessageId, setLastMessageId] = useState(0);
  const { settings, updateSettings } = useSettingsStorage();
  const containerRef = useRef(null);

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

  const unreadCount = messages.filter((m) => m.id > settings.serviceMessage).length;

  const markAllRead = () => {
    updateSettings({ ...settings, serviceMessage: lastMessageId });
    setIsOpen(false);
  };

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button
        className={`app-header-icon-btn notification-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="notification-mark-read-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notification-dropdown-body">
            {messages.length === 0 ? (
              <div className="notification-empty">
                <Bell size={32} strokeWidth={1.5} />
                <p>No notifications</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`notification-item ${
                    msg.id > settings.serviceMessage ? "notification-item--unread" : ""
                  }`}>
                  <div className="notification-item-header">
                    <span className="notification-item-title">{msg.title}</span>
                    {msg.severity && (
                      <span className={`notification-item-severity notification-item-severity--${msg.severity}`}>
                        {msg.severity}
                      </span>
                    )}
                    {msg.id > settings.serviceMessage && <span className="notification-item-badge">New</span>}
                  </div>
                  <p className="notification-item-body">{msg.body}</p>
                  <div className="notification-item-meta">
                    {msg.author && <span className="notification-item-author">{msg.author}</span>}
                    {msg.timestamp && <span className="notification-item-time">{formatTimestamp(msg.timestamp)}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
