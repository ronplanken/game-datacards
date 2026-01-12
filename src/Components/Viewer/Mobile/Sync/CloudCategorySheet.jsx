import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomSheet } from "../BottomSheet";
import "./MobileSync.css";

// Game system badge component
const GameSystemBadge = ({ system }) => {
  const labels = {
    "40k": "40K",
    aos: "AoS",
    necro: "Necro",
    custom: "Custom",
  };

  return <span className={`cloud-category-badge cloud-category-badge--${system}`}>{labels[system] || "Custom"}</span>;
};

// Single card row component
const CardRow = ({ card, onTap }) => {
  // Get card type label
  const getCardTypeLabel = (card) => {
    if (card.cardType === "stratagem") return "Stratagem";
    if (card.cardType === "secondary") return "Secondary";
    if (card.variant) return card.variant;
    return "Unit";
  };

  return (
    <button className="cloud-category-card" onClick={() => onTap(card)} type="button">
      <div className="cloud-category-card-info">
        <span className="cloud-category-card-name">{card.name}</span>
        <span className="cloud-category-card-type">{getCardTypeLabel(card)}</span>
      </div>
      <ChevronRight size={18} className="cloud-category-card-arrow" />
    </button>
  );
};

export const CloudCategorySheet = ({ isVisible, setIsVisible, category }) => {
  const navigate = useNavigate();

  const handleClose = () => setIsVisible(false);

  const handleCardTap = (card) => {
    // Navigate to card viewer with card data in state
    // This works similar to how list cards navigate
    handleClose();

    // Build navigation path using faction name from card
    // Format: /mobile/{faction}/{unit}
    const factionName = (card.faction_id || card.factionName || "cloud").toLowerCase().replaceAll(" ", "-");
    const cardName = card.name.toLowerCase().replaceAll(" ", "-");

    // Navigate with card data in state so ViewerMobile can use it directly
    navigate(`/mobile/${factionName}/${cardName}`, {
      state: {
        cloudCard: card,
        categoryName: category?.name,
      },
    });
  };

  if (!category) return null;

  const cards = category.cards || [];

  return (
    <BottomSheet isOpen={isVisible} onClose={handleClose} title={category.name} maxHeight="80vh" dark>
      <div className="cloud-category-sheet">
        {/* Header info */}
        <div className="cloud-category-header">
          <GameSystemBadge system={category.gameSystem} />
          <span className="cloud-category-count">
            {cards.length} card{cards.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Cards list */}
        {cards.length === 0 ? (
          <div className="cloud-category-empty">
            <p>This category is empty</p>
          </div>
        ) : (
          <div className="cloud-category-cards">
            {cards.map((card, index) => (
              <CardRow key={card.uuid || card.id || index} card={card} onTap={handleCardTap} />
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
