import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTagInput } from "../shared/EditorTagInput";
import { alignNameObjects, nameObjectLabel } from "../shared/nameObjects";

export const KeywordsSection = ({ card, config, label, icon, updateField }) => {
  const {
    keywordsPath,
    factionKeywordsPath,
    keywordsLabel,
    factionKeywordsLabel,
    // 11e keywords are language-keyed and reach the editor as `{ name }`
    // objects; factions stay plain strings (they are matched in English).
    keywordsAreObjects,
    factionKeywordsAreObjects,
  } = config;

  const renderTags = (path, isObjectShape, tagLabel, placeholder) => {
    const items = card[path] || [];
    return (
      <EditorTagInput
        label={tagLabel}
        tags={isObjectShape ? items.map(nameObjectLabel) : items}
        onChange={(tags) => updateField(path, isObjectShape ? alignNameObjects(items, tags) : tags)}
        placeholder={placeholder}
      />
    );
  };

  return (
    <EditorAccordion title={label} icon={icon}>
      {keywordsPath && renderTags(keywordsPath, keywordsAreObjects, keywordsLabel || "Keywords", "Add keyword")}
      {factionKeywordsPath && (
        <div style={{ marginTop: keywordsPath ? 16 : 0 }}>
          {renderTags(
            factionKeywordsPath,
            factionKeywordsAreObjects,
            factionKeywordsLabel || "Faction Keywords",
            "Add faction keyword",
          )}
        </div>
      )}
    </EditorAccordion>
  );
};
