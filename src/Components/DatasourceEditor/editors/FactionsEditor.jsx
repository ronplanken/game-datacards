import React, { useState } from "react";
import { Users, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { IconKey, IconTag, IconPalette } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { DEFAULT_DATASOURCE_COLOURS } from "../../../Helpers/customSchema.helpers";
import { FACTION_CARD_COLLECTION_KEYS, generateIdFromName } from "../../../Helpers/customDatasource.helpers";

const slugify = (text) => generateIdFromName(text) || "faction";

const ensureUniqueId = (baseId, existingIds) => {
  if (!existingIds.includes(baseId)) return baseId;
  let i = 2;
  while (existingIds.includes(`${baseId}-${i}`)) i++;
  return `${baseId}-${i}`;
};

const cardCount = (faction) => FACTION_CARD_COLLECTION_KEYS.reduce((sum, key) => sum + (faction[key]?.length || 0), 0);

/**
 * Editor for the datasource's factions list.
 *
 * Each faction has an `id`, `name`, `colours` (`header` / `banner` / `accent`)
 * and an array of card collections (datasheets, stratagems, enhancements,
 * rules) keyed by faction. The editor styles each faction as a self-contained
 * card block matching the Stats schema editor: vertically-stacked CompactInputs
 * on the left, reorder/delete actions on the right.
 *
 * Deleting a faction also removes all of its cards — when the faction has any,
 * the trash button switches to an inline confirm pair (Delete / Cancel)
 * instead of acting immediately.
 */
export const FactionsEditor = ({ datasource, onUpdateDatasource }) => {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  if (!datasource) return null;

  const factions = datasource.data || [];
  const schemaColours = datasource.schema?.colours || DEFAULT_DATASOURCE_COLOURS;

  const updateFactions = (next) => {
    onUpdateDatasource?.({ ...datasource, data: next });
  };

  const updateFaction = (id, updates) => {
    updateFactions(factions.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const updateFactionId = (oldId, rawValue) => {
    const target = slugify(rawValue);
    if (!target || target === oldId) return;
    const otherIds = factions.filter((f) => f.id !== oldId).map((f) => f.id);
    if (otherIds.includes(target)) return;
    updateFactions(
      factions.map((f) => {
        if (f.id !== oldId) return f;
        const updated = { ...f, id: target };
        const updateRefs = (arr) =>
          arr ? arr.map((card) => (card.faction_id === oldId ? { ...card, faction_id: target } : card)) : arr;
        FACTION_CARD_COLLECTION_KEYS.forEach((key) => {
          if (f[key]) updated[key] = updateRefs(f[key]);
        });
        return updated;
      }),
    );
  };

  const updateFactionColour = (id, key, value) => {
    const target = factions.find((f) => f.id === id);
    if (!target) return;
    updateFaction(id, { colours: { ...(target.colours || {}), [key]: value } });
  };

  const moveFaction = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= factions.length) return;
    const updated = [...factions];
    const tmp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = tmp;
    updateFactions(updated);
  };

  const addFaction = () => {
    const existingIds = factions.map((f) => f.id);
    const baseName = `Faction ${factions.length + 1}`;
    const id = ensureUniqueId(slugify(baseName), existingIds);
    const newFaction = {
      id,
      name: baseName,
      colours: {
        header: schemaColours.header || DEFAULT_DATASOURCE_COLOURS.header,
        banner: schemaColours.banner || DEFAULT_DATASOURCE_COLOURS.banner,
        accent: schemaColours.accent || schemaColours.banner || DEFAULT_DATASOURCE_COLOURS.banner,
      },
    };
    updateFactions([...factions, newFaction]);
  };

  const removeFaction = (id) => {
    updateFactions(factions.filter((f) => f.id !== id));
    setPendingDeleteId(null);
  };

  const requestDelete = (faction) => {
    if (cardCount(faction) === 0) {
      removeFaction(faction.id);
      return;
    }
    setPendingDeleteId(faction.id);
  };

  return (
    <Section title="Factions" icon={Users} defaultOpen={true} onAdd={addFaction} addLabel="Add faction">
      <div className="props-field-list">
        {factions.length === 0 && <div className="props-field-list-empty">No factions yet</div>}
        {factions.map((faction, index) => {
          const isPending = pendingDeleteId === faction.id;
          const count = cardCount(faction);
          const headerColour = faction.colours?.header || schemaColours.header;
          const bannerColour = faction.colours?.banner || schemaColours.banner;
          const accentColour = faction.colours?.accent || faction.colours?.banner || schemaColours.banner;
          return (
            <div key={faction.id} className="props-field-item">
              <div className="props-field-item-inputs">
                <CompactInput
                  label={<IconKey size={10} stroke={1.5} />}
                  ariaLabel="Faction ID"
                  tooltip="Faction id (used internally)"
                  type="text"
                  value={faction.id}
                  onBlur={(val) => updateFactionId(faction.id, val)}
                />
                <CompactInput
                  label={<IconTag size={10} stroke={1.5} />}
                  ariaLabel="Faction name"
                  tooltip="Faction name"
                  type="text"
                  value={faction.name || ""}
                  onChange={(val) => updateFaction(faction.id, { name: val })}
                />
                <CompactInput
                  label={<IconPalette size={10} stroke={1.5} />}
                  ariaLabel="Faction header colour"
                  tooltip="Header colour"
                  type="color"
                  value={headerColour}
                  onChange={(val) => updateFactionColour(faction.id, "header", val)}
                />
                <CompactInput
                  label={<IconPalette size={10} stroke={1.5} />}
                  ariaLabel="Faction banner colour"
                  tooltip="Banner colour"
                  type="color"
                  value={bannerColour}
                  onChange={(val) => updateFactionColour(faction.id, "banner", val)}
                />
                <CompactInput
                  label={<IconPalette size={10} stroke={1.5} />}
                  ariaLabel="Faction accent colour"
                  tooltip="Accent colour"
                  type="color"
                  value={accentColour}
                  onChange={(val) => updateFactionColour(faction.id, "accent", val)}
                />
                {isPending && (
                  <div className="props-faction-confirm-row">
                    <span className="props-faction-confirm-text">
                      Delete with {count} card{count !== 1 ? "s" : ""}?
                    </span>
                    <button
                      type="button"
                      className="designer-btn designer-btn-sm props-faction-confirm-delete"
                      onClick={() => removeFaction(faction.id)}
                      aria-label="Confirm delete faction">
                      Delete
                    </button>
                    <button
                      type="button"
                      className="designer-btn designer-btn-sm"
                      onClick={() => setPendingDeleteId(null)}
                      aria-label="Cancel delete">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="props-field-item-actions">
                <button
                  className="designer-layer-action-btn"
                  onClick={() => moveFaction(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${faction.name} up`}
                  title="Move up">
                  <ChevronUp size={14} />
                </button>
                <button
                  className="designer-layer-action-btn"
                  onClick={() => moveFaction(index, 1)}
                  disabled={index === factions.length - 1}
                  aria-label={`Move ${faction.name} down`}
                  title="Move down">
                  <ChevronDown size={14} />
                </button>
                <button
                  className="designer-layer-action-btn danger"
                  onClick={() => requestDelete(faction)}
                  aria-label={`Remove ${faction.name}`}
                  title={count > 0 ? "Remove faction (also removes its cards)" : "Remove faction"}>
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
