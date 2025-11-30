import React from "react";
import "./Toggle.css";

export const Toggle = ({ checked, onChange, disabled }) => (
  <div
    className={`custom-toggle ${checked ? "active" : ""} ${disabled ? "disabled" : ""}`}
    onClick={() => !disabled && onChange()}>
    <div className="custom-toggle-knob" />
  </div>
);
