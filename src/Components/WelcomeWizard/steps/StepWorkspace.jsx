import React from "react";
import { FolderTree, Pencil } from "lucide-react";
import { TreeViewDemo } from "../demos/TreeViewDemo";
import { CardEditorDemo } from "../demos/CardEditorDemo";

/**
 * Workspace step with interactive tree and editor demos
 */
export const StepWorkspace = ({ treeData, cardData, onToggleTree, onUpdateCard }) => {
  return (
    <div className="wz-step-workspace">
      <h2 className="wz-step-title">Your Workspace</h2>
      <p className="wz-step-description">
        Organize your cards in categories and customize them with the editor. Try dragging items and editing the card
        below!
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

        {/* Card Editor Panel */}
        <div className="wz-workspace-panel">
          <div className="wz-workspace-panel-header">
            <Pencil size={16} />
            <h3 className="wz-workspace-panel-title">Card Editor</h3>
            <span className="wz-workspace-panel-hint">Try editing!</span>
          </div>
          <div className="wz-workspace-panel-content">
            <CardEditorDemo cardData={cardData} onUpdate={onUpdateCard} />
          </div>
        </div>
      </div>
    </div>
  );
};
