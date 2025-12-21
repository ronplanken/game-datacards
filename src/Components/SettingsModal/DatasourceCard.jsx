import React from "react";
import { Toggle } from "./Toggle";
import "./DatasourceCard.css";

export const DatasourceCard = ({ title, isActive, onToggle, disabled, onCheckUpdate, isCheckingUpdate, children }) => (
  <div className={`datasource-card ${isActive ? "active" : ""}`}>
    <div className="datasource-card-header">
      <span className="datasource-card-title">{title}</span>
      <div className="datasource-card-actions">
        {isActive && onCheckUpdate && (
          <button className="datasource-update-btn" onClick={onCheckUpdate} disabled={isCheckingUpdate}>
            {isCheckingUpdate && <span className="loading-spinner" />}
            Check for updates
          </button>
        )}
        <Toggle checked={isActive} onChange={onToggle} disabled={disabled} />
      </div>
    </div>
    {children}
  </div>
);
