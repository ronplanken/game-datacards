import React from "react";
import { GitMerge, Upload, Download, Copy } from "lucide-react";
import "./MockComponents.css";

/**
 * Static mock of the sync conflict resolution modal.
 * Shows three resolution options: Keep Local, Keep Cloud, Keep Both.
 *
 * @param {Object} props
 * @param {boolean} [props.compact] - Use compact sizing for mobile (stacks buttons vertically)
 */
export const MockConflictDialog = ({ compact }) => {
  return (
    <div className={compact ? "mock--compact" : undefined}>
      <div className="mock-conflict-dialog">
        <div className="mock-conflict-header">
          <GitMerge />
          <span className="mock-conflict-title">Sync Conflict</span>
        </div>
        <div className="mock-conflict-body">Changes detected on another device</div>
        <div className="mock-conflict-actions">
          <div className="mock-conflict-btn mock-conflict-btn--local">
            <Upload />
            <span>Keep Local</span>
          </div>
          <div className="mock-conflict-btn mock-conflict-btn--cloud">
            <Download />
            <span>Keep Cloud</span>
          </div>
          <div className="mock-conflict-btn mock-conflict-btn--both">
            <Copy />
            <span>Keep Both</span>
          </div>
        </div>
      </div>
    </div>
  );
};
