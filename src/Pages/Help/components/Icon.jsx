import React from "react";
import * as helpIcons from "./helpIcons";

export const Icon = ({ name, size = 16 }) => {
  const LucideIcon = helpIcons[name];
  if (!LucideIcon) return null;
  return (
    <span className="help-icon-inline">
      <LucideIcon size={size} />
    </span>
  );
};
