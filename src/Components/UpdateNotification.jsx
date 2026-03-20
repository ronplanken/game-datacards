import React from "react";
import { useUpdateChecker } from "../Hooks/useUpdateChecker";
import "./UpdateNotification.css";

export const UpdateNotification = () => {
  const { updateAvailable, dismiss, reload } = useUpdateChecker();

  if (!updateAvailable) return null;

  return (
    <div className="update-notification" role="alert">
      <span className="update-notification__message">
        <svg className="update-notification__icon" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5ZM8 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
        </svg>
        A new version is available
      </span>
      <button className="update-notification__refresh" onClick={reload}>
        Refresh
      </button>
      <button className="update-notification__dismiss" onClick={dismiss} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
};
