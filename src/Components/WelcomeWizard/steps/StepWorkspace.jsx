import React from "react";
import { FolderTree, Pencil } from "lucide-react";
import { TreeViewDemo } from "../demos/TreeViewDemo";

/**
 * Workspace step with interactive tree demo and brief editor description
 */
export const StepWorkspace = ({ treeData, onToggleTree }) => {
  return (
    <div className="wz-step-workspace">
      <h2 className="wz-step-title">Your Workspace</h2>
      <p className="wz-step-description">
        Organize your cards into categories and subcategories. You can drag items to reorder them.
      </p>

      <div className="wz-workspace">
        {/* Tree View Panel */}
        <div className="wz-workspace-panel">
          <div className="wz-workspace-panel-header">
            <FolderTree size={16} />
            <h3 className="wz-workspace-panel-title">Categories</h3>
            <span className="wz-workspace-panel-hint">Drag to reorder</span>
          </div>
          <div className="wz-workspace-panel-content">
            <TreeViewDemo treeData={treeData} onToggle={onToggleTree} />
          </div>
        </div>

        {/* Card Editor Brief Description */}
        <div className="wz-workspace-panel">
          <div className="wz-workspace-panel-header">
            <Pencil size={16} />
            <h3 className="wz-workspace-panel-title">Card Editor</h3>
          </div>
          <div className="wz-workspace-panel-content wz-editor-description">
            <p className="wz-editor-intro">
              Select any card from your categories to open the editor. Customize stats, weapons, abilities, images, and
              more.
            </p>

            <p className="wz-editor-note">The editor adapts to each card type, showing only the relevant options.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
