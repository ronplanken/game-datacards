import React from "react";

export const Step = ({ title, children }) => (
  <li className="help-step">
    {title && <strong className="help-step-title">{title}</strong>}
    {children && <div className="help-step-content">{children}</div>}
  </li>
);

export const StepList = ({ children }) => <ol className="help-step-list">{children}</ol>;
