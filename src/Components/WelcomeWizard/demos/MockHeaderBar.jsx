import React from "react";
import { Bell, Cloud, LogIn, Settings } from "lucide-react";
import "./MockComponents.css";

/**
 * Static mock of the app header bar with icon buttons.
 * Highlights either the "sync" (cloud) or "account" (sign-in button) element.
 *
 * @param {Object} props
 * @param {"sync"|"account"} props.highlight - Which element to highlight
 * @param {boolean} [props.compact] - Use compact sizing for mobile
 */
export const MockHeaderBar = ({ highlight, compact }) => {
  const icons = [
    { key: "bell", Icon: Bell },
    { key: "sync", Icon: Cloud, label: "Sync Status" },
    { key: "settings", Icon: Settings },
  ];

  const isAccountHighlighted = highlight === "account";

  return (
    <div className={compact ? "mock--compact" : undefined}>
      <div className="mock-header-bar">
        <div className="mock-header-logo" />
        <span className="mock-header-title">Game Datacards</span>
        {icons.map(({ key, Icon, label }) => (
          <div
            key={key}
            className={`mock-header-icon-btn${highlight === key ? " mock-header-icon-btn--highlight" : ""}`}>
            {highlight === key && label && <span className="mock-header-tooltip">{label}</span>}
            <Icon />
          </div>
        ))}
        <div className={`mock-header-signin${isAccountHighlighted ? " mock-header-signin--highlight" : ""}`}>
          {isAccountHighlighted && <span className="mock-header-tooltip">Account</span>}
          <LogIn />
          <span>Sign In</span>
        </div>
      </div>
    </div>
  );
};
