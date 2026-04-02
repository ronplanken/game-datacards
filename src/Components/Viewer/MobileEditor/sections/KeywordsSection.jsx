import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTagInput } from "../shared/EditorTagInput";

export const KeywordsSection = ({ card, config, label, icon, updateField }) => {
  const { keywordsPath, factionKeywordsPath } = config;

  return (
    <EditorAccordion title={label} icon={icon}>
      {keywordsPath && (
        <EditorTagInput
          label="Keywords"
          tags={card[keywordsPath] || []}
          onChange={(tags) => updateField(keywordsPath, tags)}
          placeholder="Add keyword"
        />
      )}
      {factionKeywordsPath && (
        <div style={{ marginTop: keywordsPath ? 16 : 0 }}>
          <EditorTagInput
            label="Faction Keywords"
            tags={card[factionKeywordsPath] || []}
            onChange={(tags) => updateField(factionKeywordsPath, tags)}
            placeholder="Add faction keyword"
          />
        </div>
      )}
    </EditorAccordion>
  );
};
