import React, { useState } from "react";
import { Swords, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Section, CompactInput } from "../components";

const COLUMN_TYPES = ["string", "richtext", "enum", "boolean"];

/**
 * Editor for weapon type definitions.
 * Tabbed interface per weapon type with editable column list per tab,
 * add/remove weapon types, hasKeywords/hasProfiles toggles.
 */
export const WeaponsSchemaEditor = ({ schema, onChange }) => {
  const weaponTypes = schema?.weaponTypes;
  if (!weaponTypes) return null;

  const types = weaponTypes.types || [];
  const [activeTab, setActiveTab] = useState(0);

  const updateWeaponTypes = (updatedTypes) => {
    onChange({ ...schema, weaponTypes: { ...weaponTypes, types: updatedTypes } });
  };

  const updateType = (index, updates) => {
    const updated = types.map((t, i) => (i === index ? { ...t, ...updates } : t));
    updateWeaponTypes(updated);
  };

  const addWeaponType = () => {
    const nextNum = types.length + 1;
    const newType = {
      key: `weapon_type_${nextNum}`,
      label: `Weapon Type ${nextNum}`,
      hasKeywords: false,
      hasProfiles: false,
      columns: [],
    };
    updateWeaponTypes([...types, newType]);
    setActiveTab(types.length);
  };

  const removeWeaponType = (index) => {
    const updated = types.filter((_, i) => i !== index);
    updateWeaponTypes(updated);
    if (activeTab >= updated.length) {
      setActiveTab(Math.max(0, updated.length - 1));
    }
  };

  // Column operations for the active weapon type
  const updateColumn = (typeIndex, colIndex, key, value) => {
    const columns = types[typeIndex].columns || [];
    const updatedCols = columns.map((c, i) => (i === colIndex ? { ...c, [key]: value } : c));
    updateType(typeIndex, { columns: updatedCols });
  };

  const addColumn = (typeIndex) => {
    const columns = types[typeIndex].columns || [];
    const nextNum = columns.length + 1;
    const newCol = {
      key: `col_${nextNum}`,
      label: `Column ${nextNum}`,
      type: "string",
      required: false,
    };
    updateType(typeIndex, { columns: [...columns, newCol] });
  };

  const removeColumn = (typeIndex, colIndex) => {
    const columns = types[typeIndex].columns || [];
    updateType(typeIndex, { columns: columns.filter((_, i) => i !== colIndex) });
  };

  const moveColumn = (typeIndex, colIndex, direction) => {
    const columns = [...(types[typeIndex].columns || [])];
    const targetIndex = colIndex + direction;
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    const temp = columns[colIndex];
    columns[colIndex] = columns[targetIndex];
    columns[targetIndex] = temp;
    updateType(typeIndex, { columns });
  };

  const activeType = types[activeTab];

  return (
    <Section title="Weapon Types" icon={Swords} defaultOpen={true}>
      {types.length > 0 && (
        <div className="props-weapon-tabs" role="tablist" aria-label="Weapon types">
          {types.map((wt, index) => (
            <button
              key={wt.key + "-" + index}
              role="tab"
              aria-selected={activeTab === index}
              className={`props-weapon-tab${activeTab === index ? " active" : ""}`}
              onClick={() => setActiveTab(index)}>
              <span className="props-weapon-tab-label">{wt.label}</span>
              <span
                className="props-weapon-tab-remove"
                role="button"
                aria-label={`Remove ${wt.label}`}
                title={`Remove ${wt.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeWeaponType(index);
                }}>
                <Trash2 size={10} />
              </span>
            </button>
          ))}
        </div>
      )}

      {activeType && (
        <div className="props-weapon-tab-content" role="tabpanel" aria-label={`${activeType.label} settings`}>
          <CompactInput
            label="Key"
            type="text"
            value={activeType.key}
            onChange={(val) => updateType(activeTab, { key: val })}
          />
          <CompactInput
            label="Label"
            type="text"
            value={activeType.label}
            onChange={(val) => updateType(activeTab, { label: val })}
          />

          <label className="props-checkbox">
            <input
              type="checkbox"
              checked={!!activeType.hasKeywords}
              onChange={() => updateType(activeTab, { hasKeywords: !activeType.hasKeywords })}
            />
            <span>Has keywords</span>
          </label>
          <label className="props-checkbox">
            <input
              type="checkbox"
              checked={!!activeType.hasProfiles}
              onChange={() => updateType(activeTab, { hasProfiles: !activeType.hasProfiles })}
            />
            <span>Has profiles</span>
          </label>

          <div className="props-field-list-header">
            <span className="props-field-list-title">Columns</span>
          </div>

          <div className="props-field-list">
            {(activeType.columns || []).map((col, colIndex) => (
              <div key={col.key + "-" + colIndex} className="props-field-item">
                <div className="props-field-item-inputs">
                  <CompactInput
                    label="Key"
                    type="text"
                    value={col.key}
                    onChange={(val) => updateColumn(activeTab, colIndex, "key", val)}
                  />
                  <CompactInput
                    label="Label"
                    type="text"
                    value={col.label}
                    onChange={(val) => updateColumn(activeTab, colIndex, "label", val)}
                  />
                  <div className="props-compact-input">
                    <span className="props-compact-label">Type</span>
                    <select
                      className="props-compact-field"
                      value={col.type}
                      onChange={(e) => updateColumn(activeTab, colIndex, "type", e.target.value)}
                      aria-label="Column type">
                      {COLUMN_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="props-checkbox">
                    <input
                      type="checkbox"
                      checked={!!col.required}
                      onChange={() => updateColumn(activeTab, colIndex, "required", !col.required)}
                    />
                    <span>Required</span>
                  </label>
                </div>
                <div className="props-field-item-actions">
                  <button
                    className="designer-layer-action-btn"
                    onClick={() => moveColumn(activeTab, colIndex, -1)}
                    disabled={colIndex === 0}
                    aria-label={`Move ${col.label} up`}
                    title="Move up">
                    <ChevronUp size={14} />
                  </button>
                  <button
                    className="designer-layer-action-btn"
                    onClick={() => moveColumn(activeTab, colIndex, 1)}
                    disabled={colIndex === (activeType.columns || []).length - 1}
                    aria-label={`Move ${col.label} down`}
                    title="Move down">
                    <ChevronDown size={14} />
                  </button>
                  <button
                    className="designer-layer-action-btn danger"
                    onClick={() => removeColumn(activeTab, colIndex)}
                    aria-label={`Remove ${col.label}`}
                    title="Remove column">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="designer-btn designer-btn-sm" onClick={() => addColumn(activeTab)} aria-label="Add column">
            <Plus size={14} />
            Add Column
          </button>
        </div>
      )}

      <button className="designer-btn designer-btn-sm" onClick={addWeaponType} aria-label="Add weapon type">
        <Plus size={14} />
        Add Weapon Type
      </button>
    </Section>
  );
};
