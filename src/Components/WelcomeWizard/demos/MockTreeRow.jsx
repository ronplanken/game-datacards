import React from "react";
import { ChevronRight, Folder, Cloud } from "lucide-react";
import "./MockComponents.css";

/**
 * Static mock of a tree-view category row with a sync cloud icon.
 *
 * @param {Object} props
 * @param {boolean} [props.compact] - Use compact sizing for mobile
 */
export const MockTreeRow = ({ compact }) => {
  return (
    <div className={compact ? "mock--compact" : undefined}>
      <div className="mock-tree-row">
        <span className="mock-tree-chevron">
          <ChevronRight />
        </span>
        <span className="mock-tree-folder">
          <Folder />
        </span>
        <span className="mock-tree-name">My Army</span>
        <span className="mock-tree-sync mock-tree-sync--highlight">
          <Cloud />
          <span className="mock-tree-sync-label">Tap to sync</span>
        </span>
      </div>
    </div>
  );
};
