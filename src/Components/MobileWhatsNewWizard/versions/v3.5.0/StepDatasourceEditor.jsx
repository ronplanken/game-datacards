import React from "react";
import { Database, LayoutDashboard, Layers, RefreshCw } from "lucide-react";

/**
 * StepDatasourceEditor - Single step for mobile v3.5.0 Datasource Editor
 *
 * @returns {JSX.Element} Datasource Editor announcement step content
 */
export const StepDatasourceEditor = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Database size={28} />
      </div>
      <h2 className="mwnw-features-title">Datasource Editor (Beta)</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <LayoutDashboard size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Build Custom Card Structures</span>
          <span className="mwnw-feature-item-desc">
            Define your own stats, weapons, abilities, and fields for any game system
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Layers size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Multiple Card Types</span>
          <span className="mwnw-feature-item-desc">
            Add units, rules, enhancements, and stratagems — each with its own field structure
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <RefreshCw size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Existing Datasources</span>
          <span className="mwnw-feature-item-desc">
            Previously imported datasources can be converted to categories or re-imported in the new editor
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepDatasourceEditor;
