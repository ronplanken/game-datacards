import React from "react";
import * as helpIcons from "./helpIcons";

export const IconLabel = ({ icon, label, color }) => {
  const LucideIcon = helpIcons[icon];
  return (
    <span className="help-icon-label" style={color ? { "--icon-label-color": color } : undefined}>
      {LucideIcon && (
        <span className="help-icon-label-icon">
          <LucideIcon size={14} />
        </span>
      )}
      <span className="help-icon-label-text">{label}</span>
    </span>
  );
};
