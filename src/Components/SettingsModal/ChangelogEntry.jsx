import React from "react";
import { ChevronDown } from "lucide-react";
import "./ChangelogEntry.css";

export const ChangelogEntry = ({ version, date, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={`changelog-entry ${!isExpanded ? "collapsed" : ""}`}>
      <div className="changelog-entry-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="changelog-version">{version}</span>
        <span className="changelog-date">{date}</span>
        <ChevronDown size={14} className="changelog-expand-icon" />
      </div>
      {isExpanded && <div className="changelog-entry-content">{children}</div>}
    </div>
  );
};
