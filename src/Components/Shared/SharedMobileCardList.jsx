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

export const SharedMobileCardList = ({ cards, selectedIndex, onSelectCard }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="shared-mobile-list">
        <div style={{ padding: "24px", textAlign: "center", color: "var(--bs-text-muted)" }}>No cards available</div>
      </div>
    );
  }

  return (
    <div className="shared-mobile-list">
      {cards.map((card, index) => (
        <button
          key={card.uuid || card.id || index}
          className={classNames("shared-mobile-list-item", {
            selected: index === selectedIndex,
          })}
          onClick={() => onSelectCard(index)}>
          <span className="shared-mobile-list-item-index">{index + 1}</span>
          <div className="shared-mobile-list-item-content">
            <div className="shared-mobile-list-item-name">{card.name}</div>
            <div className="shared-mobile-list-item-type">{getCardTypeLabel(card)}</div>
          </div>
        </button>
      ))}
    </div>
  );
};
