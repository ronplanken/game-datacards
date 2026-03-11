import React from "react";
import { Database, Info } from "lucide-react";
import { Section, CompactInput } from "../components";

const BASE_SYSTEM_LABELS = {
  "40k-10e": "Warhammer 40K 10th Edition",
  aos: "Age of Sigmar",
  blank: "Blank / Custom",
};

/**
 * Editor for datasource-level metadata: name, version, author.
 * BaseSystem is displayed as read-only since it determines the schema presets.
 */
export const DatasourceMetadataEditor = ({ datasource, onUpdateDatasource }) => {
  if (!datasource) return null;

  const handleChange = (field, value) => {
    if (!onUpdateDatasource) return;
    onUpdateDatasource({ ...datasource, [field]: value });
  };

  const baseSystemLabel =
    BASE_SYSTEM_LABELS[datasource.schema?.baseSystem] || datasource.schema?.baseSystem || "Custom";

  return (
    <div className="props-body">
      <Section title="Datasource Info" icon={Database} defaultOpen={true}>
        <CompactInput
          label="Name"
          type="text"
          value={datasource.name || ""}
          onChange={(val) => handleChange("name", val)}
        />
        <CompactInput
          label="Version"
          type="text"
          value={datasource.version || ""}
          onChange={(val) => handleChange("version", val)}
        />
        <CompactInput
          label="Author"
          type="text"
          value={datasource.author || ""}
          onChange={(val) => handleChange("author", val)}
        />
      </Section>
      <Section title="System" icon={Info} defaultOpen={true}>
        <div className="props-metadata-row">
          <span className="props-metadata-label">Base System</span>
          <span className="props-metadata-value">{baseSystemLabel}</span>
        </div>
      </Section>
    </div>
  );
};
