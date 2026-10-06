import React from "react";
import { X, Monitor, Cloud, Copy } from "lucide-react";
import "./MockComponents.css";

/**
 * Static mock of the sync conflict resolution modal.
 * Matches the actual SyncConflictModal layout: header with close button,
 * two version comparison cards (Local vs Cloud), and a footer with
 * Keep Both (secondary) + Keep Local / Keep Cloud (primary) buttons.
 *
 * @param {Object} props
 * @param {boolean} [props.compact] - Use compact sizing for mobile (stacks buttons vertically)
 */
export const MockConflictDialog = ({ compact }) => {
  return (
    <div className={compact ? "mock--compact" : undefined}>
      <div className="mock-conflict-dialog">
        <div className="mock-conflict-header">
          <span className="mock-conflict-title">Sync Conflict</span>
          <div className="mock-conflict-close">
            <X />
          </div>
        </div>

        <div className="mock-conflict-body">
          <div className="mock-conflict-description">
            <strong>&ldquo;My Army&rdquo;</strong> was modified on another device. Choose which version to keep.
          </div>

          <div className="mock-conflict-comparison">
            <div className="mock-conflict-version mock-conflict-version--local">
              <div className="mock-conflict-version-header">
                <Monitor />
                <span>Local Version</span>
              </div>
              <div className="mock-conflict-version-details">
                <div className="mock-conflict-detail">
                  <span className="mock-conflict-label">Version:</span>
                  <span className="mock-conflict-value">3</span>
                </div>
                <div className="mock-conflict-detail">
                  <span className="mock-conflict-label">Cards:</span>
                  <span className="mock-conflict-value">12</span>
                </div>
                <div className="mock-conflict-detail">
                  <span className="mock-conflict-label">Modified:</span>
                  <span className="mock-conflict-value">This device</span>
                </div>
              </div>
            </div>

            <div className="mock-conflict-vs">VS</div>

            <div className="mock-conflict-version mock-conflict-version--cloud">
              <div className="mock-conflict-version-header">
                <Cloud />
                <span>Cloud Version</span>
              </div>
              <div className="mock-conflict-version-details">
                <div className="mock-conflict-detail">
                  <span className="mock-conflict-label">Version:</span>
                  <span className="mock-conflict-value">4</span>
                </div>
                <div className="mock-conflict-detail">
                  <span className="mock-conflict-label">Cards:</span>
                  <span className="mock-conflict-value">14</span>
                </div>
                <div className="mock-conflict-detail">
                  <span className="mock-conflict-label">Modified:</span>
                  <span className="mock-conflict-value">Feb 22, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mock-conflict-footer">
          <div className="mock-conflict-btn mock-conflict-btn--secondary">
            <Copy />
            <span>Keep Both</span>
          </div>
          <div className="mock-conflict-footer-main">
            <div className="mock-conflict-btn mock-conflict-btn--primary">
              <Monitor />
              <span>Keep Local</span>
            </div>
            <div className="mock-conflict-btn mock-conflict-btn--primary">
              <Cloud />
              <span>Keep Cloud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
