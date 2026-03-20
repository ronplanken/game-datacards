import React from "react";
import { useUpdateChecker } from "../Hooks/useUpdateChecker";
import "./UpdateNotification.css";

export const UpdateNotification = () => {
  const { updateAvailable, dismiss, reload } = useUpdateChecker();

  if (!updateAvailable) return null;

  return (
    <div className="update-notification" role="alert">
      <span className="update-notification__message">
        <span className="update-notification__dot" />A new version is available
      </span>
      <button className="update-notification__refresh" onClick={reload}>
        Update
      </button>
      <button className="update-notification__dismiss" onClick={dismiss} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
};
