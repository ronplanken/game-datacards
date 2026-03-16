import React from "react";
import { Database, Info, Palette } from "lucide-react";
import { IconTag, IconNumber, IconUser, IconPalette } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { DEFAULT_DATASOURCE_COLOURS } from "../../../Helpers/customSchema.helpers";

const BASE_SYSTEM_LABELS = {
  "40k-10e": "Warhammer 40K 10th Edition",
  aos: "Age of Sigmar",
  blank: "Blank / Custom",
};

/**
 * Editor for datasource-level metadata: name, version, author, colours.
 * BaseSystem is displayed as read-only since it determines the schema presets.
 */
export const DatasourceMetadataEditor = ({ datasource, onUpdateDatasource }) => {
  if (!datasource) return null;

  const handleChange = (field, value) => {
    if (!onUpdateDatasource) return;
    const updated = { ...datasource, [field]: value };
    if (field === "name") {
      updated.data = datasource.data?.map((faction) => ({
        ...faction,
        name: value,
      }));
    }
    onUpdateDatasource(updated);
  };

  const handleColourChange = (colourKey, value) => {
    if (!onUpdateDatasource) return;
    const currentColours = datasource.schema?.colours || {};
    const updatedColours = { ...currentColours, [colourKey]: value };
    onUpdateDatasource({
      ...datasource,
      schema: { ...datasource.schema, colours: updatedColours },
      data: datasource.data?.map((faction) => ({
        ...faction,
        colours: { ...faction.colours, [colourKey]: value },
      })),
    });
  };

  const headerColour = datasource.schema?.colours?.header || DEFAULT_DATASOURCE_COLOURS.header;
  const bannerColour = datasource.schema?.colours?.banner || DEFAULT_DATASOURCE_COLOURS.banner;

  const baseSystemLabel =
    BASE_SYSTEM_LABELS[datasource.schema?.baseSystem] || datasource.schema?.baseSystem || "Custom";

  return (
    <div className="props-body">
      <Section title="Datasource Info" icon={Database} defaultOpen={true}>
        <CompactInput
          label={<IconTag size={10} stroke={1.5} />}
          ariaLabel="Name"
          tooltip="Name"
          type="text"
          value={datasource.name || ""}
          onChange={(val) => handleChange("name", val)}
        />
        <CompactInput
          label={<IconNumber size={10} stroke={1.5} />}
          ariaLabel="Version"
          tooltip="Version"
          type="text"
          value={datasource.version || ""}
          onChange={(val) => handleChange("version", val)}
        />
        <CompactInput
          label={<IconUser size={10} stroke={1.5} />}
          ariaLabel="Author"
          tooltip="Author"
          type="text"
          value={datasource.author || ""}
          onChange={(val) => handleChange("author", val)}
        />
      </Section>
      <Section title="Colours" icon={Palette} defaultOpen={true}>
        <CompactInput
          label={<IconPalette size={10} stroke={1.5} />}
          ariaLabel="Main colour"
          tooltip="Main colour"
          type="color"
          value={headerColour}
          onChange={(val) => handleColourChange("header", val)}
        />
        <CompactInput
          label={<IconPalette size={10} stroke={1.5} />}
          ariaLabel="Accent colour"
          tooltip="Accent colour"
          type="color"
          value={bannerColour}
          onChange={(val) => handleColourChange("banner", val)}
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
