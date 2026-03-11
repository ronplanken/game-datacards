import React from "react";
import { BarChart3 } from "lucide-react";
import { Section } from "../components";

/**
 * Editor for unit stat field definitions.
 * Allows add/remove/reorder stat fields and toggling allowMultipleProfiles.
 */
export const StatsSchemaEditor = ({ schema, onChange }) => {
  const stats = schema?.stats;
  if (!stats) return null;

  return (
    <Section title="Stats" icon={BarChart3} defaultOpen={true}>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Fields</span>
        <span className="props-metadata-value">{stats.fields?.length || 0}</span>
      </div>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Multi-profile</span>
        <span className="props-metadata-value">{stats.allowMultipleProfiles ? "Yes" : "No"}</span>
      </div>
    </Section>
  );
};
