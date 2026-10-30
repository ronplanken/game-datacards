import React from "react";
import { Link2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { IconKey, IconTag, IconAlignLeft } from "@tabler/icons-react";
import { Section, CompactInput, CollapsibleFieldItem } from "../components";
import { ensureIds } from "./editorUtils";
import { createUnitLinkGroup } from "../../../Helpers/unitLinks.helpers";

export const UnitLinksSchemaEditor = ({ schema, onChange }) => {
  const groups = ensureIds(schema?.unitLinks?.groups);

  const updateGroups = (updatedGroups) => {
    onChange({
      ...schema,
      unitLinks: { ...(schema?.unitLinks || {}), groups: updatedGroups },
    });
  };

  const updateGroup = (index, key, value) => {
    updateGroups(groups.map((g, i) => (i === index ? { ...g, [key]: value } : g)));
  };

  const addGroup = () => {
    updateGroups([...groups, ensureIds([createUnitLinkGroup(groups)])[0]]);
  };

  const removeGroup = (index) => {
    updateGroups(groups.filter((_, i) => i !== index));
  };

  const moveGroup = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= groups.length) return;
    const updated = [...groups];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    updateGroups(updated);
  };

  return (
    <Section title="Unit Links" icon={Link2} defaultOpen={true} onAdd={addGroup} addLabel="Add link group">
      <div className="props-field-list">
        {groups.length === 0 && (
          <div className="props-field-list-empty">
            No link groups yet. Add one to link this card to other units, for example as Leader or Support.
          </div>
        )}
        {groups.map((group, index) => (
          <CollapsibleFieldItem
            key={group._id}
            title={group.label || group.key || "Untitled group"}
            actions={
              <>
                <button
                  className="designer-layer-action-btn"
                  onClick={() => moveGroup(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${group.label} up`}
                  title="Move up">
                  <ChevronUp size={14} />
                </button>
                <button
                  className="designer-layer-action-btn"
                  onClick={() => moveGroup(index, 1)}
                  disabled={index === groups.length - 1}
                  aria-label={`Move ${group.label} down`}
                  title="Move down">
                  <ChevronDown size={14} />
                </button>
                <button
                  className="designer-layer-action-btn danger"
                  onClick={() => removeGroup(index)}
                  aria-label={`Remove ${group.label}`}
                  title="Remove link group">
                  <Trash2 size={14} />
                </button>
              </>
            }>
            <CompactInput
              label={<IconKey size={10} stroke={1.5} />}
              ariaLabel="Key"
              tooltip="Key"
              type="text"
              value={group.key}
              onChange={(val) => updateGroup(index, "key", val)}
            />
            <CompactInput
              label={<IconTag size={10} stroke={1.5} />}
              ariaLabel="Label"
              tooltip="Label"
              type="text"
              value={group.label}
              onChange={(val) => updateGroup(index, "label", val)}
            />
            <CompactInput
              label={<IconAlignLeft size={10} stroke={1.5} />}
              ariaLabel="Description"
              tooltip="Description"
              type="text"
              value={group.description || ""}
              placeholder="e.g. This unit can lead the following units:"
              onChange={(val) => updateGroup(index, "description", val)}
            />
          </CollapsibleFieldItem>
        ))}
      </div>
    </Section>
  );
};
