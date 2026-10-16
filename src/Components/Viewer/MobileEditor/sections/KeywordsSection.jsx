import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTagInput } from "../shared/EditorTagInput";
import { EditorTextField } from "../shared/EditorTextField";
import { alignNameObjects, nameObjectLabel } from "../shared/nameObjects";
import { joinKeywords, splitKeywords, withModelKeywords } from "../../../../Helpers/unitKeywords.helpers";

export const KeywordsSection = ({ card, config, label, icon, updateField, updateFields }) => {
  const {
    keywordsPath,
    factionKeywordsPath,
    keywordsLabel,
    factionKeywordsLabel,
    // 11e keywords are language-keyed and reach the editor as `{ name }`
    // objects; factions stay plain strings (they are matched in English).
    keywordsAreObjects,
    factionKeywordsAreObjects,
    modelKeywordsPath,
  } = config;

  const models = modelKeywordsPath && Array.isArray(card[modelKeywordsPath]) ? card[modelKeywordsPath] : null;

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

  const renderSharedTags = () => {
    const shared = splitKeywords(card[keywordsPath], models, nameObjectLabel);
    return (
      <EditorTagInput
        label={`${keywordsLabel || "Keywords"} (all models)`}
        tags={shared.map(nameObjectLabel)}
        onChange={(tags) =>
          updateField(keywordsPath, joinKeywords(alignNameObjects(shared, tags), models, nameObjectLabel))
        }
        placeholder="Add keyword"
      />
    );
  };

  const saveModels = (next) => {
    const { keywords, modelKeywords } = withModelKeywords(card[keywordsPath], models, next, nameObjectLabel);
    updateFields({ [keywordsPath]: keywords, [modelKeywordsPath]: modelKeywords });
  };

  const updateModel = (index, changes) =>
    saveModels((models ?? []).map((model, i) => (i === index ? { ...model, ...changes } : model)));

  const renderModels = () => (
    <div style={{ marginTop: 16 }}>
      <label className="mobile-editor-field-label">Model keywords</label>
      {(models ?? []).map((model, index) => (
        <div key={index} className="mobile-editor-model-keywords" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <EditorTextField
                value={nameObjectLabel(model)}
                onChange={(value) => updateModel(index, { name: value })}
                placeholder={`Model ${index + 1}`}
              />
            </div>
            <button
              className="mobile-editor-weapon-delete"
              aria-label={`Remove ${nameObjectLabel(model)}`}
              onClick={() => saveModels(models.filter((_, i) => i !== index))}
              type="button"
              style={{ marginTop: 4 }}>
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
          <EditorTagInput
            tags={(model.keywords || []).map(nameObjectLabel)}
            onChange={(tags) => updateModel(index, { keywords: alignNameObjects(model.keywords || [], tags) })}
            placeholder="Add keyword"
          />
        </div>
      ))}
      <button
        className="mobile-editor-add-btn"
        onClick={() => saveModels([...(models ?? []), { name: `Model ${(models ?? []).length + 1}`, keywords: [] }])}
        type="button">
        <Plus size={14} aria-hidden="true" />
        <span>Add model</span>
      </button>
    </div>
  );

  return (
    <EditorAccordion title={label} icon={icon}>
      {keywordsPath &&
        (models
          ? renderSharedTags()
          : renderTags(keywordsPath, keywordsAreObjects, keywordsLabel || "Keywords", "Add keyword"))}
      {keywordsPath && modelKeywordsPath && renderModels()}
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
