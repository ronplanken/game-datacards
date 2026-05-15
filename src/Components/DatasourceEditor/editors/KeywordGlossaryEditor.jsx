import React from "react";
import { nanoid } from "nanoid";
import { Bold, BookOpen, Brackets, CaseUpper, Download, Eye, Link, MoreHorizontal, Trash2 } from "lucide-react";
import { IconKey, IconTag, IconTemplate } from "@tabler/icons-react";
import { Dropdown, Menu, Select } from "antd";
import { Section, CompactInput, CollapsibleFieldItem } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "./editorUtils";
import {
  getDefaultKeywordGlossary,
  resolveKeywordStyle,
  VALID_GLOSSARY_DISPLAY_MODES,
  VALID_GLOSSARY_SCOPES,
} from "../../../Helpers/customSchema.helpers";

const MATCH_TYPE_TOOLTIP =
  "Match type — exact matches the full keyword, prefix matches the start, parameterized matches the keyword plus a value";

const MATCH_TYPE_OPTIONS = [
  { value: "exact", label: "Exact" },
  { value: "prefix", label: "Prefix" },
  { value: "parameterized", label: "Parameterized" },
];

const DISPLAY_MODE_OPTIONS = [
  { value: "explanation", label: "Explanation row" },
  { value: "tooltip", label: "Hover tooltip" },
];

const DISPLAY_MODE_TOOLTIP =
  "Weapons only — explanation shows a description row below the weapon profile, tooltip shows the description on hover over the inline keyword tag.";

// Per-keyword presentation. Modelled as dropdowns (not toggles) so extra
// casings/bracket shapes/weights can be added later without a data migration.
const STYLE_CONTROLS = [
  {
    field: "casing",
    icon: CaseUpper,
    tooltip: "Casing — how the keyword text is capitalised",
    options: [
      { value: "uppercase", label: "Uppercase" },
      { value: "normal", label: "Normal" },
    ],
  },
  {
    field: "brackets",
    icon: Brackets,
    tooltip: "Brackets — wrap the keyword in square brackets or leave it bare",
    options: [
      { value: "square", label: "Square [ ]" },
      { value: "none", label: "None" },
    ],
  },
  {
    field: "weight",
    icon: Bold,
    tooltip: "Weight — render the keyword bold or at normal weight",
    options: [
      { value: "bold", label: "Bold" },
      { value: "normal", label: "Normal" },
    ],
  },
];

const BASE_SYSTEM_DEFAULTS_LABELS = {
  "40k-10e": "Import 40K 10e defaults",
};

const isValidDisplayMode = (value) => VALID_GLOSSARY_DISPLAY_MODES.includes(value);

const SCOPE_LABELS = {
  weapons: "Weapons",
  abilities: "Abilities",
  "unit-keywords": "Unit keywords",
  rules: "Rules",
  stratagems: "Stratagems",
  enhancements: "Enhancements",
};

const SCOPE_OPTIONS = VALID_GLOSSARY_SCOPES.map((scope) => ({
  value: scope,
  label: SCOPE_LABELS[scope] || scope,
}));

const slugify = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || nanoid(6);

/**
 * A single, collapsible keyword glossary entry.
 *
 * Collapsing keeps the editor scannable when many keywords are defined — the
 * header shows the keyword name so the full list reads as an overview.
 */
const GlossaryEntry = ({ entry, index, updateEntry, updateKeyAndName, setAppliesTo, updateStyle, removeEntry }) => {
  const scopes = Array.isArray(entry.appliesTo) ? entry.appliesTo : [];
  const resolvedStyle = resolveKeywordStyle(entry);

  return (
    <CollapsibleFieldItem
      title={entry.name || "Untitled keyword"}
      actions={
        <button
          className="designer-layer-action-btn danger"
          onClick={() => removeEntry(index)}
          aria-label={`Remove ${entry.name || "keyword"}`}
          title="Remove keyword">
          <Trash2 size={14} />
        </button>
      }>
      <CompactInput
        label={<IconTag size={10} stroke={1.5} />}
        ariaLabel="Keyword name"
        tooltip="Keyword name as it appears on cards (e.g. 'One Shot' or 'Anti-')"
        type="text"
        value={entry.name || ""}
        onChange={(val) => updateKeyAndName(index, val)}
      />
      <div className="props-compact-input">
        <Tooltip content={MATCH_TYPE_TOOLTIP} placement="top">
          <span className="props-compact-label">
            <IconTemplate size={10} stroke={1.5} />
          </span>
        </Tooltip>
        <select
          className="props-compact-field"
          value={entry.matchType || "exact"}
          onChange={(e) => updateEntry(index, "matchType", e.target.value)}
          aria-label="Match type">
          {MATCH_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <CompactInput
        label={<IconKey size={10} stroke={1.5} />}
        ariaLabel="Storage key"
        tooltip="Stable storage key (auto-generated from the name)"
        type="text"
        value={entry.key || ""}
        onChange={(val) => updateEntry(index, "key", val)}
      />
      <div className="props-compact-input props-compact-input--auto props-glossary-scopes-input">
        <Tooltip content="Applies to — render scopes that may use this keyword" placement="top">
          <span className="props-compact-label">
            <Link size={12} />
          </span>
        </Tooltip>
        <Select
          mode="multiple"
          size="small"
          bordered={false}
          showArrow
          value={scopes}
          options={SCOPE_OPTIONS}
          placeholder="Select scopes"
          onChange={(val) => setAppliesTo(index, val)}
          className="props-glossary-scopes-select"
          aria-label={`Applies to scopes for ${entry.name || "keyword"}`}
        />
      </div>
      {scopes.includes("weapons") && (
        <div className="props-compact-input">
          <Tooltip content={DISPLAY_MODE_TOOLTIP} placement="top">
            <span className="props-compact-label">
              <Eye size={10} />
            </span>
          </Tooltip>
          <select
            className="props-compact-field"
            value={isValidDisplayMode(entry.displayMode) ? entry.displayMode : "explanation"}
            onChange={(e) => updateEntry(index, "displayMode", e.target.value)}
            aria-label={`Display mode for ${entry.name || "keyword"}`}>
            {DISPLAY_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <label className="props-glossary-description" htmlFor={`glossary-desc-${entry._id}`}>
        <span className="props-glossary-description-label">Description</span>
        <textarea
          id={`glossary-desc-${entry._id}`}
          className="props-glossary-description-field"
          rows={4}
          value={entry.description || ""}
          onChange={(e) => updateEntry(index, "description", e.target.value)}
          placeholder="The bearer can only shoot with this weapon once per battle."
          aria-label="Keyword description"
        />
      </label>
      <div className="props-glossary-group-label">Styling</div>
      {STYLE_CONTROLS.map(({ field, icon: Icon, tooltip, options }) => (
        <div className="props-compact-input" key={field}>
          <Tooltip content={tooltip} placement="top">
            <span className="props-compact-label">
              <Icon size={12} />
            </span>
          </Tooltip>
          <select
            className="props-compact-field"
            value={resolvedStyle[field]}
            onChange={(e) => updateStyle(index, field, e.target.value)}
            aria-label={`${field} style for ${entry.name || "keyword"}`}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </CollapsibleFieldItem>
  );
};

/**
 * Editor for the datasource-level keyword glossary.
 *
 * Each entry pairs a keyword tag with a description and declares which
 * render scopes (weapons, abilities, unit-keywords, …) may consume it.
 * Scoped renderers (e.g. Ds40kUnitWeapons for "weapons") expand matching
 * keywords into explanation rows in their section.
 *
 * @param {Object} props
 * @param {Object} props.schema - The datasource schema object
 * @param {Function} props.onChange - Receives the updated schema
 */
export const KeywordGlossaryEditor = ({ schema, onChange }) => {
  if (!schema) return null;

  const baseSystem = schema.baseSystem;
  const entries = ensureIds(schema.keywordGlossary || []);
  const seedAvailable = getDefaultKeywordGlossary(baseSystem).length > 0;
  const importLabel = BASE_SYSTEM_DEFAULTS_LABELS[baseSystem] || "Import defaults";

  // Persist _id so React keys stay stable across edits — stripping it here
  // caused inputs to remount (and lose focus) on every keystroke.
  const writeEntries = (next) => {
    onChange({ ...schema, keywordGlossary: next });
  };

  const updateEntry = (index, key, value) => {
    const next = entries.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry));
    writeEntries(next);
  };

  const setAppliesTo = (index, nextScopes) => {
    // Keep validator happy: an entry must always have at least one scope.
    if (!Array.isArray(nextScopes) || nextScopes.length === 0) return;
    updateEntry(index, "appliesTo", nextScopes);
  };

  const updateStyle = (index, styleKey, value) => {
    const current = entries[index];
    updateEntry(index, "style", { ...(current.style || {}), [styleKey]: value });
  };

  const updateKeyAndName = (index, name) => {
    const current = entries[index];
    const autoKey = !current.key || current.key === slugify(current.name);
    const next = entries.map((entry, i) =>
      i === index ? { ...entry, name, ...(autoKey ? { key: slugify(name) } : {}) } : entry,
    );
    writeEntries(next);
  };

  const addEntry = () => {
    const newEntry = {
      _id: nanoid(),
      key: `keyword_${entries.length + 1}`,
      name: "",
      description: "",
      matchType: "exact",
      appliesTo: ["weapons"],
      displayMode: "explanation",
    };
    writeEntries([...entries, newEntry]);
  };

  const removeEntry = (index) => {
    writeEntries(entries.filter((_, i) => i !== index));
  };

  const restoreDefaults = () => {
    const defaults = getDefaultKeywordGlossary(baseSystem).map((entry) => ({ ...entry, _id: nanoid() }));
    writeEntries(defaults);
  };

  const overflowMenu = seedAvailable ? (
    <Menu
      items={[
        {
          key: "restore-defaults",
          label: (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Download size={14} />
              {importLabel}
            </span>
          ),
          onClick: restoreDefaults,
        },
      ]}
    />
  ) : null;

  const headerActions = overflowMenu ? (
    <Dropdown overlay={overflowMenu} trigger={["click"]} placement="bottomRight">
      <button
        type="button"
        className="props-section-header-action"
        aria-label="Keyword glossary actions"
        title="More actions"
        onClick={(e) => e.stopPropagation()}>
        <MoreHorizontal size={14} />
      </button>
    </Dropdown>
  ) : null;

  return (
    <Section
      title="Keyword Glossary"
      icon={BookOpen}
      defaultOpen
      onAdd={addEntry}
      addLabel="Add keyword"
      headerActions={headerActions}>
      <div className="props-field-list">
        {entries.length === 0 && (
          <div className="props-field-list-empty">
            No keyword definitions yet. Add an entry to render an explanation line wherever the keyword is used.
          </div>
        )}
        {entries.map((entry, index) => (
          <GlossaryEntry
            key={entry._id}
            entry={entry}
            index={index}
            updateEntry={updateEntry}
            updateKeyAndName={updateKeyAndName}
            setAppliesTo={setAppliesTo}
            updateStyle={updateStyle}
            removeEntry={removeEntry}
          />
        ))}
      </div>
    </Section>
  );
};
