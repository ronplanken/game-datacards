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
      <p className="wz-step-description">Organize your cards in categories. Try dragging items in the tree below!</p>

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
              Select any card from your categories to open the full editor. You can customize all aspects of your cards
              including stats, weapons, abilities, and more.
            </p>

            <p className="wz-editor-note">
              Cards in your categories can be fully customized. The editor shows different options based on the card
              type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
