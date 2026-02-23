import React from "react";
import { Bell, Cloud, Settings, UserCircle } from "lucide-react";
import "./MockComponents.css";

/**
 * Static mock of the app header bar with icon buttons.
 * Highlights either the "sync" (cloud) or "account" (user) icon.
 *
 * @param {Object} props
 * @param {"sync"|"account"} props.highlight - Which icon to highlight
 * @param {boolean} [props.compact] - Use compact sizing for mobile
 */
export const MockHeaderBar = ({ highlight, compact }) => {
  const icons = [
    { key: "bell", Icon: Bell },
    { key: "sync", Icon: Cloud, label: "Sync Status" },
    { key: "settings", Icon: Settings },
    { key: "account", Icon: UserCircle, label: "Account" },
  ];

  return (
    <div className={compact ? "mock--compact" : undefined}>
      <div className="mock-header-bar">
        <div className="mock-header-logo" />
        <span className="mock-header-title">Game Datacards</span>
        {icons.map(({ key, Icon, label }) => (
          <div
            key={key}
            className={`mock-header-icon-btn${highlight === key ? " mock-header-icon-btn--highlight" : ""}`}>
            <Icon />
            {highlight === key && label && <span className="mock-header-icon-label">{label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
