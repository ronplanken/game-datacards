import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorNumberField } from "../shared/EditorNumberField";
import { EditorTextField } from "../shared/EditorTextField";

export const StatsSection = ({ card, config, label, icon, updateField, replaceCard }) => {
  const { fields, allowMultipleProfiles, dataPath, flatObject } = config;

  if (flatObject) {
    return (
      <FlatStatsSection
        card={card}
        fields={fields}
        label={label}
        icon={icon}
        dataPath={dataPath}
        updateField={updateField}
      />
    );
  }

  const stats = card[dataPath] || [];
  if (!Array.isArray(stats)) return null;

  const handleStatChange = (profileIndex, fieldKey, value) => {
    updateField(`${dataPath}.${profileIndex}.${fieldKey}`, value);
  };

  const handleAddProfile = () => {
    const blank = { active: true, name: "New Profile" };
    fields.forEach((f) => (blank[f.key] = ""));
    replaceCard({ ...card, [dataPath]: [...stats, blank] });
  };

  const handleRemoveProfile = (index) => {
    replaceCard({ ...card, [dataPath]: stats.filter((_, i) => i !== index) });
  };

  const handleProfileNameChange = (index, value) => {
    updateField(`${dataPath}.${index}.name`, value);
  };

  // Single profile: show inline grid
  if (stats.length <= 1) {
    return (
      <EditorAccordion
        title={label}
        icon={icon}
        actions={
          allowMultipleProfiles ? (
            <button className="mobile-editor-add-btn" onClick={handleAddProfile} type="button">
              <Plus size={14} />
            </button>
          ) : null
        }>
        {stats.length > 0 && (
          <div className="mobile-editor-stat-grid">
            {fields.map((field) => (
              <EditorNumberField
                key={field.key}
                label={field.label}
                value={stats[0]?.[field.key]}
                onChange={(value) => handleStatChange(0, field.key, value)}
              />
            ))}
          </div>
        )}
      </EditorAccordion>
    );
  }

  // Multiple profiles: accordion per profile
  return (
    <EditorAccordion
      title={label}
      icon={icon}
      badge={stats.length}
      actions={
        allowMultipleProfiles ? (
          <button className="mobile-editor-add-btn" onClick={handleAddProfile} type="button">
            <Plus size={14} />
          </button>
        ) : null
      }>
      {stats.map((profile, index) => (
        <div key={index} style={{ marginBottom: index < stats.length - 1 ? 16 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <EditorTextField
              value={profile.name}
              onChange={(value) => handleProfileNameChange(index, value)}
              placeholder="Profile name"
              className="mobile-editor-ability-name-input"
            />
            {allowMultipleProfiles && stats.length > 1 && (
              <button className="mobile-editor-weapon-delete" onClick={() => handleRemoveProfile(index)} type="button">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="mobile-editor-stat-grid">
            {fields.map((field) => (
              <EditorNumberField
                key={field.key}
                label={field.label}
                value={profile[field.key]}
                onChange={(value) => handleStatChange(index, field.key, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </EditorAccordion>
  );
};

// AoS stats are flat objects, not arrays
const FlatStatsSection = ({ card, fields, label, icon, dataPath, updateField }) => {
  const stats = card[dataPath] || {};

  return (
    <EditorAccordion title={label} icon={icon}>
      <div className="mobile-editor-stat-grid">
        {fields.map((field) => (
          <EditorNumberField
            key={field.key}
            label={field.label}
            value={stats[field.key]}
            onChange={(value) => updateField(`${dataPath}.${field.key}`, value)}
          />
        ))}
      </div>
    </EditorAccordion>
  );
};
