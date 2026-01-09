import React from "react";
import { FileJson, Smartphone, Image, Download, Upload, Printer, FileBox, LayoutGrid } from "lucide-react";
import { DATA_TABS } from "../constants";

const TAB_ICONS = {
  import: Upload,
  export: Download,
  print: Printer,
};

const ITEM_ICONS = {
  "JSON Files": FileJson,
  "GW App Format": Smartphone,
  JSON: FileJson,
  "GW App": Smartphone,
  "PNG Images": Image,
  Datasource: FileBox,
  "Paper Sizes": LayoutGrid,
  Orientation: LayoutGrid,
  Layout: LayoutGrid,
};

/**
 * Data portability step with tabs for import/export/print
 */
export const StepDataPortability = ({ activeTab, onTabChange }) => {
  const currentTab = DATA_TABS.find((tab) => tab.id === activeTab) || DATA_TABS[0];

  return (
    <div className="wz-step-data-portability">
      <h2 className="wz-step-title">Import, Export & Print</h2>
      <p className="wz-step-description">
        Your cards are portable. Import from other sources, export to share, or print for game day.
      </p>

      {/* Tab buttons */}
      <div className="wz-tabs">
        {DATA_TABS.map((tab) => {
          const IconComponent = TAB_ICONS[tab.id];
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              className={`wz-tab ${isActive ? "wz-tab--active" : ""}`}
              onClick={() => onTabChange(tab.id)}>
              {IconComponent && <IconComponent size={14} style={{ marginRight: 6 }} />}
              {tab.title}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="wz-tab-content">
        <div className="wz-data-list">
          {currentTab.items.map((item, index) => {
            const ItemIcon = ITEM_ICONS[item.label] || FileJson;

            return (
              <div key={index} className="wz-data-item">
                <div className="wz-data-item-icon">
                  <ItemIcon />
                </div>
                <div className="wz-data-item-content">
                  <h4 className="wz-data-item-label">{item.label}</h4>
                  <p className="wz-data-item-desc">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
