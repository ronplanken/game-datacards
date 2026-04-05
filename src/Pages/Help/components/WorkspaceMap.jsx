import React from "react";

export const WorkspaceMap = ({ zones }) => (
  <div className="help-workspace-map">
    {zones.map((zone, i) => (
      <div
        key={i}
        className="help-workspace-zone"
        style={{
          gridArea: zone.area,
          ...(zone.accent ? { borderColor: "var(--ws-accent, #1677ff)" } : {}),
        }}>
        <span className="help-workspace-zone-label">{zone.label}</span>
        {zone.description && <span className="help-workspace-zone-desc">{zone.description}</span>}
      </div>
    ))}
  </div>
);
