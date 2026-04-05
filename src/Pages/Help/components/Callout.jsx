import React from "react";
import { Info, Lightbulb, AlertTriangle } from "lucide-react";

const icons = {
  tip: Lightbulb,
  info: Info,
  warning: AlertTriangle,
};

const labels = {
  tip: "Tip",
  info: "Info",
  warning: "Warning",
};

export const Callout = ({ type = "info", children }) => {
  const Icon = icons[type] || Info;
  return (
    <div className={`help-callout help-callout-${type}`}>
      <div className="help-callout-header">
        <Icon size={16} />
        <span>{labels[type] || "Info"}</span>
      </div>
      <div className="help-callout-body">{children}</div>
    </div>
  );
};
