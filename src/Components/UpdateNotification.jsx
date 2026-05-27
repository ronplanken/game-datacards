import React from "react";
import { useUpdateCheck } from "../Hooks/useUpdateCheck";
import "./UpdateNotification.css";

// The loud reload banner, reserved for feature (minor/major) releases. Patch
// releases surface quietly in the notification bell instead — see
// getUpdateNotification in Helpers/notifications.js.
export const UpdateNotification = () => {
  const { showBanner, dismissBanner, reload } = useUpdateCheck();

  if (!showBanner) return null;

  return (
    <div className="update-notification" role="alert">
      <span className="update-notification__message">
        <span className="update-notification__dot" />A new version is available
      </span>
      <button className="update-notification__refresh" onClick={reload}>
        Update
      </button>
      <button className="update-notification__dismiss" onClick={dismissBanner} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
};
