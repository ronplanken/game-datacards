import classNames from "classnames";
import "./Shared.css";

const getCardTypeLabel = (card) => {
  const source = card.source || "40k";

  switch (source) {
    case "40k-10e":
      if (card.cardType === "stratagem") return "Stratagem";
      if (card.cardType === "enhancement") return "Enhancement";
      if (card.cardType === "rule") return "Rule";
      return "Datasheet";

    case "aos":
      if (card.cardType === "spell") return "Spell";
      return "Warscroll";

    case "necromunda":
      if (card.cardType === "stratagem") return "Tactic";
      if (card.cardType === "vehicle") return "Vehicle";
      return "Fighter";

    case "40k":
    case "basic":
      if (card.cardType === "stratagem") return "Stratagem";
      if (card.cardType === "secondary") return "Secondary";
      if (card.cardType === "psychic") return "Psychic";
      return "Datasheet";

    default:
      return "Card";
  }
};

export const SharedCardList = ({ cards, selectedIndex, onSelectCard }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="shared-sidebar">
        <div className="shared-sidebar-header">
          <span className="shared-sidebar-title">Cards</span>
          <span className="shared-card-count">0</span>
        </div>
        <div className="shared-card-list">
          <div className="shared-no-card" style={{ padding: "24px", fontSize: "13px" }}>
            No cards available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-sidebar">
      <div className="shared-sidebar-header">
        <span className="shared-sidebar-title">Cards</span>
        <span className="shared-card-count">{cards.length}</span>
      </div>

      <div className="shared-card-list">
        {cards.map((card, index) => (
          <div
            key={card.uuid || card.id || index}
            className={classNames("shared-list-item", {
              selected: index === selectedIndex,
            })}
            onClick={() => onSelectCard(index)}>
            <span className="shared-list-item-index">{index + 1}</span>
            <div className="shared-list-item-content">
              <div className="shared-list-item-name">{card.name}</div>
              <div className="shared-list-item-type">{getCardTypeLabel(card)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
