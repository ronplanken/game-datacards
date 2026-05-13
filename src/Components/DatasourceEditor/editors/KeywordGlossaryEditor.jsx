import React from "react";
import { nanoid } from "nanoid";
import { BookOpen, RotateCcw, Trash2 } from "lucide-react";
import { IconKey, IconTag, IconTemplate } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "./editorUtils";
import { getDefaultKeywordGlossary, VALID_GLOSSARY_SCOPES } from "../../../Helpers/customSchema.helpers";

const MATCH_TYPE_TOOLTIP = "Match type — exact matches the full keyword, prefix matches the start";

const MATCH_TYPE_OPTIONS = [
  { value: "exact", label: "Exact" },
  { value: "prefix", label: "Prefix" },
];

const SCOPE_LABELS = {
  weapons: "Weapons",
  abilities: "Abilities",
  "unit-keywords": "Unit keywords",
  rules: "Rules",
  stratagems: "Stratagems",
  enhancements: "Enhancements",
};

const slugify = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || nanoid(6);

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

  const writeEntries = (next) => {
    const cleaned = next.map(({ _id, ...rest }) => rest);
    onChange({ ...schema, keywordGlossary: cleaned });
  };

  const updateEntry = (index, key, value) => {
    const next = entries.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry));
    writeEntries(next);
  };

  const toggleScope = (index, scope) => {
    const entry = entries[index];
    const current = Array.isArray(entry.appliesTo) ? entry.appliesTo : [];
    // Don't allow unchecking the last remaining scope — schema validator
    // requires appliesTo to be non-empty, and silently producing an
    // invalid entry would only surface much later at save/export time.
    if (current.includes(scope) && current.length === 1) return;
    const nextScopes = current.includes(scope) ? current.filter((s) => s !== scope) : [...current, scope];
    updateEntry(index, "appliesTo", nextScopes);
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

  return (
    <Section title="Keyword Glossary" icon={BookOpen} defaultOpen={false} onAdd={addEntry} addLabel="Add keyword">
      {seedAvailable && (
        <div className="props-field-list-toolbar">
          <button
            type="button"
            className="designer-layer-action-btn"
            onClick={restoreDefaults}
            aria-label="Restore default keyword glossary"
            title={`Restore the built-in ${baseSystem} keyword set`}>
            <RotateCcw size={12} />
            <span>Restore defaults</span>
          </button>
        </div>
      )}
      <div className="props-field-list">
        {entries.length === 0 && (
          <div className="props-field-list-empty">
            No keyword definitions yet. Add an entry to render an explanation line wherever the keyword is used.
          </div>
        )}
        {entries.map((entry, index) => {
          const scopes = Array.isArray(entry.appliesTo) ? entry.appliesTo : [];
          return (
            <div key={entry._id} className="props-field-item">
              <div className="props-field-item-inputs">
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
                <fieldset
                  className="props-field-item-scopes"
                  aria-label={`Applies to scopes for ${entry.name || "keyword"}`}>
                  <legend className="props-compact-label">Applies to</legend>
                  {VALID_GLOSSARY_SCOPES.map((scope) => {
                    const checked = scopes.includes(scope);
                    const isOnlyScope = checked && scopes.length === 1;
                    return (
                      <label
                        key={scope}
                        className={`props-field-item-scope-chip${isOnlyScope ? " is-locked" : ""}`}
                        title={isOnlyScope ? "An entry must apply to at least one scope" : undefined}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isOnlyScope}
                          onChange={() => toggleScope(index, scope)}
                          aria-label={SCOPE_LABELS[scope] || scope}
                        />
                        <span>{SCOPE_LABELS[scope] || scope}</span>
                      </label>
                    );
                  })}
                </fieldset>
                <label className="props-field-item-textarea-label" htmlFor={`glossary-desc-${entry._id}`}>
                  <span className="props-compact-label">Description</span>
                  <textarea
                    id={`glossary-desc-${entry._id}`}
                    className="props-compact-field props-compact-textarea"
                    rows={3}
                    value={entry.description || ""}
                    onChange={(e) => updateEntry(index, "description", e.target.value)}
                    placeholder="The bearer can only shoot with this weapon once per battle."
                    aria-label="Keyword description"
                  />
                </label>
              </div>
              <div className="props-field-item-actions">
                <button
                  className="designer-layer-action-btn danger"
                  onClick={() => removeEntry(index)}
                  aria-label={`Remove ${entry.name || "keyword"}`}
                  title="Remove keyword">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
};
