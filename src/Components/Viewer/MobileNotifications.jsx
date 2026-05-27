import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getMessages } from "../../Helpers/external.helpers";
import {
  buildNotificationItems,
  formatTimestamp,
  getUpdateNotification,
  isNotificationUnread,
  markUpdateRead,
} from "../../Helpers/notifications";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useUpdateCheck } from "../../Hooks/useUpdateCheck";
import { BottomSheet } from "./Mobile/BottomSheet";
import "./MobileNotifications.css";

export const MobileNotifications = ({ isVisible, setIsVisible }) => {
  const [messages, setMessages] = useState([]);
  const [lastMessageId, setLastMessageId] = useState(0);
  const { settings, updateSettings } = useSettingsStorage();
  const { updateKind, latestVersion, reload } = useUpdateCheck();
  const currentVersion = import.meta.env.VITE_VERSION;

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

  // Remote messages, bundled release notes, and the client update nudge share one
  // feed, newest first. The `source` selects the right unread cursor (id,
  // last-read version, or the session update flag).
  const updateItem = getUpdateNotification(updateKind);
  const items = buildNotificationItems(messages, updateItem);

  const isActiveUnread = (item) => isNotificationUnread(item, settings, latestVersion);
  const unreadCount = items.filter(isActiveUnread).length;

  const markAllRead = () => {
    updateSettings({ ...settings, serviceMessage: lastMessageId, lastReadReleaseVersion: currentVersion });
    if (updateItem) markUpdateRead(latestVersion);
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

        {items.length === 0 ? (
          <div className="mobile-notifications-empty">
            <Bell size={32} strokeWidth={1.5} />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="mobile-notifications-list">
            {items.map((msg) => (
              <div
                key={msg.key}
                className={`mobile-notification-item ${isActiveUnread(msg) ? "mobile-notification-item--unread" : ""}`}>
                <div className="mobile-notification-item-header">
                  <span className="mobile-notification-item-title">{msg.title}</span>
                  {msg.severity && (
                    <span
                      className={`mobile-notification-item-severity mobile-notification-item-severity--${msg.severity}`}>
                      {msg.severity}
                    </span>
                  )}
                  {isActiveUnread(msg) && <span className="mobile-notification-item-badge">New</span>}
                </div>
                <p className="mobile-notification-item-body">{msg.body}</p>
                {msg.source === "update" && (
                  <button className="mobile-notification-item-action" onClick={reload}>
                    Reload
                  </button>
                )}
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
