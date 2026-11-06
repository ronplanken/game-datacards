import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorSelectField } from "../shared/EditorSelectField";
import { useDataSourceStorage } from "../../../../Hooks/useDataSourceStorage";
import {
  collectLinkableUnitCards,
  getUnitLinkEntries,
  pickNextLinkableCard,
  setUnitLinkEntries,
} from "../../../../Helpers/unitLinks.helpers";

const FREE_TEXT_VALUE = "__free_text__";

export const UnitLinksSection = ({ card, config, label, icon, replaceCard }) => {
  const { groupKey, description } = config;
  const { dataSource } = useDataSourceStorage();
  const entries = getUnitLinkEntries(card, groupKey);

  const linkableCards = useMemo(
    () => collectLinkableUnitCards(dataSource?.data, dataSource?.schema, card?.id),
    [dataSource, card?.id],
  );

  const options = useMemo(
    () => [
      ...linkableCards.map((c) => ({ value: c.id, label: `${c.name} (${c.factionName})` })),
      { value: FREE_TEXT_VALUE, label: "Other (type a name)" },
    ],
    [linkableCards],
  );

  const writeEntries = (next) => replaceCard(setUnitLinkEntries(card, groupKey, next));

  const handleSelect = (index, value) => {
    const next = [...entries];
    if (value === FREE_TEXT_VALUE) {
      next[index] = { name: next[index]?.name || "" };
    } else {
      const target = linkableCards.find((c) => c.id === value);
      next[index] = { cardId: value, name: target?.name || "" };
    }
    writeEntries(next);
  };

  const handleNameChange = (index, value) => {
    const next = [...entries];
    next[index] = { name: value };
    writeEntries(next);
  };

  const handleAdd = () => {
    const first = pickNextLinkableCard(linkableCards, entries);
    writeEntries([...entries, first ? { cardId: first.id, name: first.name } : { name: "" }]);
  };

  const handleRemove = (index) => {
    writeEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={entries.length}>
      {description && <p className="mobile-editor-field-label">{description}</p>}
      {entries.map((entry, index) => {
        const isLinked = !!entry.cardId && linkableCards.some((c) => c.id === entry.cardId);
        return (
          <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <EditorSelectField
                value={isLinked ? entry.cardId : FREE_TEXT_VALUE}
                onChange={(value) => handleSelect(index, value)}
                options={options}
              />
              {!isLinked && (
                <EditorTextField
                  value={entry.name}
                  onChange={(value) => handleNameChange(index, value)}
                  placeholder={`Unit ${index + 1}`}
                />
              )}
            </div>
            <button
              className="mobile-editor-weapon-delete"
              onClick={() => handleRemove(index)}
              type="button"
              aria-label="Remove unit">
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
      <button className="mobile-editor-add-btn" onClick={handleAdd} type="button">
        <Plus size={14} />
        <span>Add unit</span>
      </button>
    </EditorAccordion>
  );
};
