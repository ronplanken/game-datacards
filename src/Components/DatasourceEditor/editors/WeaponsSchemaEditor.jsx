import React, { useState } from "react";
import { nanoid } from "nanoid";
import { Swords, Plus, X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  IconKey,
  IconTag,
  IconCategory,
  IconList,
  IconTags,
  IconLayersSubtract,
  IconLayoutRows,
  IconEye,
  IconPalette,
  IconActivityHeartbeat,
  IconLink,
  IconHierarchy,
  IconTypography,
} from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "./editorUtils";

const COLUMN_TYPES = [
  { value: "string", label: "Text" },
  { value: "enum", label: "Enum" },
  { value: "boolean", label: "Boolean" },
];

const PHASE_STYLE_OPTIONS = [
  { value: "", label: "None" },
  { value: "movement", label: "Movement" },
  { value: "assault", label: "Assault" },
  { value: "combat", label: "Combat" },
  { value: "special", label: "Special" },
];

const PROFILE_RELATION_OPTIONS = [
  { value: "equal", label: "Equal (siblings)" },
  { value: "parent-child", label: "Parent → Child" },
];

/**
 * Editor for weapon type definitions.
 * Connected-tab interface per weapon type with editable column list per tab,
 * inline "+" tab to add weapon types, X to close tabs,
 * hasKeywords/hasProfiles toggles.
 */
export const WeaponsSchemaEditor = ({ schema, onChange, baseSystem }) => {
  const weaponTypes = schema?.weaponTypes;
  if (!weaponTypes) return null;

  const types = ensureIds(weaponTypes.types);
  const [activeTab, setActiveTab] = useState(0);
  const abilityCategoryOptions = (schema?.abilities?.categories || []).map((c) => ({ value: c.key, label: c.label }));
  const showPhaseFields = baseSystem === "starcraft-tcg";

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
      _id: nanoid(),
      key: `weapon_type_${nextNum}`,
      label: `Weapon Type ${nextNum}`,
      hasKeywords: false,
      hasProfiles: false,
      profileRelation: "equal",
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
      _id: nanoid(),
      key: `col_${nextNum}`,
      label: `Column ${nextNum}`,
      type: "string",
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

  const rawActiveType = types[activeTab];
  const activeType = rawActiveType ? { ...rawActiveType, columns: ensureIds(rawActiveType.columns) } : undefined;

  return (
    <Section title="Weapon Types" icon={Swords} defaultOpen={true}>
      {types.length === 0 && (
        <div className="props-field-list-empty">
          No weapon types yet
          <button
            className="designer-btn designer-btn-sm"
            onClick={addWeaponType}
            aria-label="Add weapon type"
            style={{ marginTop: 8 }}>
            <Plus size={14} />
            Add Weapon Type
          </button>
        </div>
      )}
      {types.length > 0 && (
        <div className="props-weapon-tabs" role="tablist" aria-label="Weapon types">
          {types.map((wt, index) => (
            <button
              key={wt._id}
              role="tab"
              aria-selected={activeTab === index}
              className={`props-weapon-tab${activeTab === index ? " active" : ""}`}
              onClick={() => setActiveTab(index)}>
              <span className="props-weapon-tab-label">{wt.label}</span>
              <span
                className="props-weapon-tab-close"
                role="button"
                aria-label={`Remove ${wt.label}`}
                title={`Remove ${wt.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeWeaponType(index);
                }}>
                <X size={10} />
              </span>
            </button>
          ))}
          <button
            className="props-weapon-tab-add"
            onClick={addWeaponType}
            aria-label="Add weapon type"
            title="Add weapon type">
            <Plus size={14} />
          </button>
        </div>
      )}

      {activeType && (
        <div className="props-weapon-tab-content" role="tabpanel" aria-label={`${activeType.label} settings`}>
          <CompactInput
            label={<IconKey size={10} stroke={1.5} />}
            ariaLabel="Key"
            tooltip="Key"
            type="text"
            value={activeType.key}
            onChange={(val) => updateType(activeTab, { key: val })}
          />
          <CompactInput
            label={<IconTag size={10} stroke={1.5} />}
            ariaLabel="Label"
            tooltip="Label"
            type="text"
            value={activeType.label}
            onChange={(val) => updateType(activeTab, { label: val })}
          />

          <CompactInput
            label={<IconTags size={10} stroke={1.5} />}
            ariaLabel="Weapon keywords"
            tooltip="Enable weapon keywords"
            type="toggle"
            value={!!activeType.hasKeywords}
            onChange={(val) => updateType(activeTab, { hasKeywords: val })}
          />
          <CompactInput
            label={<IconLayersSubtract size={10} stroke={1.5} />}
            ariaLabel="Multiple profiles"
            tooltip="Multiple profiles — let a weapon carry more than one stat profile"
            type="toggle"
            value={!!activeType.hasProfiles}
            onChange={(val) => updateType(activeTab, { hasProfiles: val })}
          />

          {activeType.hasProfiles && (
            <div className="props-tree-children">
              <div className="props-tree-child">
                <div className="props-compact-input">
                  <Tooltip content="Profile relation — how multiple profiles relate to each other" placement="top">
                    <span className="props-compact-label">
                      <IconHierarchy size={10} stroke={1.5} />
                    </span>
                  </Tooltip>
                  <select
                    className="props-compact-field"
                    value={activeType.profileRelation || "equal"}
                    onChange={(e) =>
                      updateType(activeTab, {
                        profileRelation: e.target.value === "equal" ? undefined : e.target.value,
                      })
                    }
                    aria-label="Profile relation">
                    {PROFILE_RELATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {activeType.profileRelation === "parent-child" && (
                <div className="props-tree-child">
                  <CompactInput
                    label={<IconTypography size={10} stroke={1.5} />}
                    ariaLabel="Child label"
                    tooltip="Label used for child / upgrade profiles (e.g. Upgrade)"
                    type="text"
                    value={activeType.profileChildLabel || ""}
                    onChange={(val) => updateType(activeTab, { profileChildLabel: val || undefined })}
                    placeholder="sub-profile"
                  />
                </div>
              )}
            </div>
          )}

          {showPhaseFields && (
            <div className="props-compact-row-2col">
              <div className="props-compact-input">
                <Tooltip content="Phase style — drives the section heading icon" placement="top">
                  <span className="props-compact-label">
                    <IconActivityHeartbeat size={10} stroke={1.5} />
                  </span>
                </Tooltip>
                <select
                  className="props-compact-field"
                  value={activeType.phaseStyle || ""}
                  onChange={(e) =>
                    updateType(activeTab, { phaseStyle: e.target.value === "" ? undefined : e.target.value })
                  }
                  aria-label="Phase style">
                  {PHASE_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="props-compact-input">
                <Tooltip content="Render this ability category alongside this weapon block" placement="top">
                  <span className="props-compact-label">
                    <IconLink size={10} stroke={1.5} />
                  </span>
                </Tooltip>
                <select
                  className="props-compact-field"
                  value={activeType.linkedAbilityCategory || ""}
                  onChange={(e) =>
                    updateType(activeTab, {
                      linkedAbilityCategory: e.target.value === "" ? undefined : e.target.value,
                    })
                  }
                  aria-label="Linked ability category">
                  <option value="">None</option>
                  {abilityCategoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="props-field-list-header">
            <span className="props-field-list-title">Columns</span>
          </div>

          <div className="props-field-list">
            {(activeType.columns || []).length === 0 && <div className="props-field-list-empty">No columns yet</div>}
            {(activeType.columns || []).map((col, colIndex) => (
              <div key={col._id} className="props-field-item">
                <div className="props-field-item-inputs">
                  <CompactInput
                    label={<IconKey size={10} stroke={1.5} />}
                    ariaLabel="Key"
                    tooltip="Key"
                    type="text"
                    value={col.key}
                    onChange={(val) => updateColumn(activeTab, colIndex, "key", val)}
                  />
                  <CompactInput
                    label={<IconTag size={10} stroke={1.5} />}
                    ariaLabel="Label"
                    tooltip="Label"
                    type="text"
                    value={col.label}
                    onChange={(val) => updateColumn(activeTab, colIndex, "label", val)}
                  />
                  <div className="props-compact-input">
                    <Tooltip content="Type" placement="top">
                      <span className="props-compact-label">
                        <IconCategory size={10} stroke={1.5} />
                      </span>
                    </Tooltip>
                    <select
                      className="props-compact-field"
                      value={col.type}
                      onChange={(e) => updateColumn(activeTab, colIndex, "type", e.target.value)}
                      aria-label="Column type">
                      {COLUMN_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="props-compact-input">
                    <Tooltip content="Display" placement="top">
                      <span className="props-compact-label">
                        <IconLayoutRows size={10} stroke={1.5} />
                      </span>
                    </Tooltip>
                    <select
                      className="props-compact-field"
                      value={col.display || "column"}
                      onChange={(e) =>
                        updateColumn(
                          activeTab,
                          colIndex,
                          "display",
                          e.target.value === "column" ? undefined : e.target.value,
                        )
                      }
                      aria-label="Column display">
                      <option value="column">Column</option>
                      <option value="row">Row</option>
                    </select>
                  </div>
                  {col.display === "row" && (
                    <div className="props-tree-children">
                      <div className="props-tree-child">
                        <CompactInput
                          label={<IconEye size={10} stroke={1.5} />}
                          ariaLabel="Display label"
                          tooltip="Show label before row values"
                          type="toggle"
                          value={col.displayLabel !== false}
                          onChange={(val) => updateColumn(activeTab, colIndex, "displayLabel", val ? undefined : false)}
                        />
                      </div>
                      <div className="props-tree-child">
                        <div className="props-compact-input">
                          <Tooltip content="Visual style" placement="top">
                            <span className="props-compact-label">
                              <IconPalette size={10} stroke={1.5} />
                            </span>
                          </Tooltip>
                          <select
                            className="props-compact-field"
                            value={col.visual || "text"}
                            onChange={(e) =>
                              updateColumn(
                                activeTab,
                                colIndex,
                                "visual",
                                e.target.value === "text" ? undefined : e.target.value,
                              )
                            }
                            aria-label="Visual style">
                            <option value="text">Text</option>
                            <option value="badge">Badge</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  {col.type === "enum" && (
                    <CompactInput
                      label={<IconList size={10} stroke={1.5} />}
                      ariaLabel="Options"
                      tooltip="Options (comma-separated)"
                      type="text"
                      value={(col.options || []).join(", ")}
                      onChange={(val) =>
                        updateColumn(
                          activeTab,
                          colIndex,
                          "options",
                          val.split(",").map((s) => s.trim()),
                        )
                      }
                      onBlur={(val) =>
                        updateColumn(
                          activeTab,
                          colIndex,
                          "options",
                          val
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  )}
                  {col.type === "boolean" && (
                    <>
                      <CompactInput
                        label="On"
                        ariaLabel="On value"
                        tooltip="Display value when true"
                        type="text"
                        value={col.onValue || ""}
                        onChange={(val) => updateColumn(activeTab, colIndex, "onValue", val || undefined)}
                      />
                      <CompactInput
                        label="Off"
                        ariaLabel="Off value"
                        tooltip="Display value when false"
                        type="text"
                        value={col.offValue || ""}
                        onChange={(val) => updateColumn(activeTab, colIndex, "offValue", val || undefined)}
                      />
                    </>
                  )}
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

          <button
            className="designer-btn designer-btn-sm designer-btn-dashed"
            onClick={() => addColumn(activeTab)}
            aria-label="Add column">
            <Plus size={14} />
            Add Column
          </button>
        </div>
      )}
    </Section>
  );
};
