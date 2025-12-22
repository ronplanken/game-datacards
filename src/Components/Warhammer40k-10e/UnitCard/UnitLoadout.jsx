import { Link } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { confirmDialog } from "../../ConfirmChangesModal";

// Helper to normalize entry to object format (handles legacy string format)
const normalizeEntry = (entry) => {
  if (typeof entry === "string") {
    return { type: "official", name: entry };
  }
  return entry;
};

export const UnitLoadout = ({ unit }) => {
  const { dataSource } = useDataSourceStorage();
  const { cardStorage, setActiveCard, setActiveCategory, cardUpdated, saveActiveCard } = useCardStorage();
  const unitFaction = dataSource?.data?.find((faction) => faction.id === unit?.faction_id);
  const unitLoadouts = unit?.loadout?.split(".").filter((val) => val);

  // Function to select a custom card by UUID
  const selectCardByUuid = (uuid) => {
    for (const category of cardStorage?.categories || []) {
      const card = category.cards?.find((c) => c.uuid === uuid);
      if (card) {
        setActiveCard(card);
        setActiveCategory(category);
        return true;
      }
    }
    return false;
  };

  // Render a leader/led-by entry
  const renderEntry = (entry, index, keyPrefix) => {
    const normalized = normalizeEntry(entry);

    if (normalized.type === "custom") {
      // Check if the card still exists
      const cardExists = cardStorage?.categories?.some((cat) => cat.cards?.some((c) => c.uuid === normalized.uuid));

      return (
        <div key={`${keyPrefix}-${normalized.uuid || index}`}>
          ■
          <span
            className="value"
            style={{
              cursor: cardExists ? "pointer" : "not-allowed",
              color: cardExists ? undefined : "#999",
              textDecoration: cardExists ? "none" : "line-through",
            }}
            onClick={() => {
              if (cardExists) {
                if (cardUpdated) {
                  confirmDialog({
                    title: "You have unsaved changes",
                    content: "Do you want to save before switching?",
                    handleSave: () => {
                      saveActiveCard();
                      selectCardByUuid(normalized.uuid);
                    },
                    handleDiscard: () => {
                      selectCardByUuid(normalized.uuid);
                    },
                    handleCancel: () => {},
                  });
                } else {
                  selectCardByUuid(normalized.uuid);
                }
              }
            }}>
            {normalized.name}
            {!cardExists && " (deleted)"}
          </span>
        </div>
      );
    }

    // Official type - link to viewer
    return (
      <div key={`${keyPrefix}-${normalized.name}-${index}`}>
        ■
        <Link
          to={`/viewer/${unitFaction?.name?.toLowerCase().replaceAll(" ", "-")}/${normalized.name
            .replaceAll(" ", "-")
            .toLowerCase()}`}>
          <span className="value">{normalized.name}</span>
        </Link>
      </div>
    );
  };

  return (
    <div className="extra">
      <div className="composition_container">
        {unit.showComposition !== false && (
          <>
            <div className="heading">
              <div className="title">Unit Composition</div>
            </div>

            {unit?.composition?.map((composition, index) => {
              return (
                <div className="composition" key={`composition-${composition}`}>
                  <span className="description">{composition}</span>
                </div>
              );
            })}
          </>
        )}
        {unit.showLoadout !== false && (
          <>
            {unitLoadouts?.map((loadout, index) => {
              const line = loadout?.split(":");
              if (line?.length > 1) {
                return (
                  <div className="loadout" key={`loadout-${line[0]}`}>
                    <span className="name">{line[0]}</span>
                    <span className="description">{line[1]}.</span>
                  </div>
                );
              }
              return (
                <div className="loadout" key={`loadout-${loadout}`}>
                  <span className="description">{loadout}</span>
                </div>
              );
            })}
          </>
        )}
        {unit.leads && (
          <>
            <div className="heading">
              <div className="title">Leader</div>
            </div>
            <div className="leader">
              <span className="description">This unit can lead the following units:</span>
              {unit?.leads?.units?.map((entry, index) => renderEntry(entry, index, "leader"))}
              {unit?.leads?.extra && <span className="description">{unit?.leads?.extra}</span>}
            </div>
          </>
        )}
        {unit?.leadBy && unit?.leadBy?.length > 0 && (
          <>
            <div className="heading">
              <div className="title">Led by</div>
            </div>
            <div className="ledBy">
              <span className="description">This unit can be led by the following units:</span>
              {unit?.leadBy?.map((entry, index) => renderEntry(entry, index, "ledby"))}
            </div>
          </>
        )}
        {unit.transport && (
          <>
            <div className="heading">
              <div className="title">Transport</div>
            </div>
            <div className="transport">
              <span className="description">{unit.transport}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
