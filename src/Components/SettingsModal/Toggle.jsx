import React from "react";
import "./Toggle.css";

export const Toggle = ({ checked, onChange, disabled }) => (
  <div
    className={`custom-toggle ${checked ? "active" : ""} ${disabled ? "disabled" : ""}`}
    onClick={(e) => {
      e.stopPropagation();
      !disabled && onChange(!checked);
    }}>
    <div className="custom-toggle-knob" />
  </div>
);
