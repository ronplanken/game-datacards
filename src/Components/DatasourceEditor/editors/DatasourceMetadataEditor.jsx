import React from "react";
import { Database } from "lucide-react";
import { Section } from "../components";

/**
 * Editor for datasource-level metadata: name, version, author.
 * BaseSystem is displayed as read-only.
 */
export const DatasourceMetadataEditor = ({ datasource, onUpdateDatasource }) => {
  if (!datasource) return null;

  return (
    <div className="props-body">
      <Section title="Datasource Info" icon={Database} defaultOpen={true}>
        <div className="props-metadata-row">
          <span className="props-metadata-label">Name</span>
          <span className="props-metadata-value">{datasource.name}</span>
        </div>
        <div className="props-metadata-row">
          <span className="props-metadata-label">Version</span>
          <span className="props-metadata-value">{datasource.version}</span>
        </div>
        <div className="props-metadata-row">
          <span className="props-metadata-label">Author</span>
          <span className="props-metadata-value">{datasource.author || "\u2014"}</span>
        </div>
        <div className="props-metadata-row">
          <span className="props-metadata-label">Base System</span>
          <span className="props-metadata-value">{datasource.schema?.baseSystem || "custom"}</span>
        </div>
      </Section>
    </div>
  );
};
