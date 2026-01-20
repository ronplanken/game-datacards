import React from "react";
import { Database } from "lucide-react";

/**
 * StepCustomDatasources - Custom Datasources feature step for v3.1.0
 *
 * Highlights the new datasource management capabilities including
 * URL imports, export functionality, auto-sync, and GW app integration.
 *
 * @returns {JSX.Element} Custom Datasources feature step content
 */
export const StepCustomDatasources = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Database size={28} />
      </div>
      <h2 className="wnw-feature-title">Custom Datasources</h2>
    </div>
    <p className="wnw-feature-description">
      Import and manage custom datasources from URLs or files. Keep your datasource updated with the automatic update
      checks.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Import from URL</strong>
          <p>Load custom datasources directly from external URLs</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Export as Datasource</strong>
          <p>Share your custom card categories as datasource files for others to enjoy and use</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Auto Update</strong>
          <p>Datasources check for updates automatically</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>40K GW App Import</strong>
          <p>Import army lists from the official GW app</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepCustomDatasources;
