import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getMessages } from "../../Helpers/external.helpers";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { BottomSheet } from "./Mobile/BottomSheet";
import "./MobileNotifications.css";

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

export const MobileNotifications = ({ isVisible, setIsVisible }) => {
  const [messages, setMessages] = useState([]);
  const [lastMessageId, setLastMessageId] = useState(0);
  const { settings, updateSettings } = useSettingsStorage();

  useEffect(() => {
    if (isVisible) {
      getMessages().then((data) => {
        if (data) {
          setMessages(data.messages || []);
          setLastMessageId(data.lastMessageId || 0);
        }
      });
    }
  }, [isVisible]);

  const unreadCount = messages.filter((m) => m.id > settings.serviceMessage).length;

  const markAllRead = () => {
    updateSettings({ ...settings, serviceMessage: lastMessageId });
  };

  return (
    <BottomSheet isOpen={isVisible} onClose={() => setIsVisible(false)} title="Notifications">
      <div className="mobile-notifications">
        {unreadCount > 0 && (
          <div className="mobile-notifications-header">
            <button className="mobile-notifications-mark-read" onClick={markAllRead}>
              Mark all as read
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="mobile-notifications-empty">
            <Bell size={32} strokeWidth={1.5} />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="mobile-notifications-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mobile-notification-item ${
                  msg.id > settings.serviceMessage ? "mobile-notification-item--unread" : ""
                }`}>
                <div className="mobile-notification-item-header">
                  <span className="mobile-notification-item-title">{msg.title}</span>
                  {msg.severity && (
                    <span
                      className={`mobile-notification-item-severity mobile-notification-item-severity--${msg.severity}`}>
                      {msg.severity}
                    </span>
                  )}
                  {msg.id > settings.serviceMessage && <span className="mobile-notification-item-badge">New</span>}
                </div>
                <p className="mobile-notification-item-body">{msg.body}</p>
                <div className="mobile-notification-item-meta">
                  {msg.author && <span className="mobile-notification-item-author">{msg.author}</span>}
                  {msg.timestamp && (
                    <span className="mobile-notification-item-time">{formatTimestamp(msg.timestamp)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
