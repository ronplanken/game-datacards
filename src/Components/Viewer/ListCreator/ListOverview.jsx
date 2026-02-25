import { useState } from "react";
import { Crown, Trash2, FileText, List, ChevronDown, Upload, ChevronRight, Cloud } from "lucide-react";
import { message } from "../../Toast/message";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useCloudCategories, ListSyncButton } from "../../../Premium";
import { useMobileList } from "../useMobileList";
import { capitalizeSentence } from "../../../Helpers/external.helpers";
import {
  categorize40kUnits,
  categorizeAoSUnits,
  format40kListText,
  formatAoSListText,
  sortCards,
  SECTIONS_40K,
  SECTIONS_AOS,
} from "../../../Helpers/listCategories.helpers";
import { BottomSheet } from "../Mobile/BottomSheet";
import { ListSelector } from "./ListSelector";
import { ListEditCard } from "./ListEditCard";
import { MobileGwImporter } from "../MobileImporter";
import "./ListOverview.css";

// Import action button (prominent, at top of content)
const ImportActionButton = ({ onClick }) => (
  <button className="list-overview-import-action" onClick={onClick} type="button">
    <Upload size={18} />
    <span>Import from GW App</span>
    <ChevronRight size={18} />
  </button>
);

// Game system badge for cloud categories
const GameSystemBadge = ({ system }) => {
  const labels = {
    "40k": "40K",
    aos: "AoS",
    necro: "Necro",
    custom: "Custom",
  };
  return (
    <span className={`list-overview-cloud-badge list-overview-cloud-badge--${system}`}>
      {labels[system] || "Custom"}
    </span>
  );
};

// Header with list selector, sync button, and copy button
const ListHeader = ({
  listName,
  onListSelectorClick,
  onCopyToClipboard,
  isCloudCategory,
  isSynced,
  gameSystem,
  syncButton,
}) => (
  <div className="list-overview-list-header">
    <button className="list-overview-name-selector" onClick={onListSelectorClick} type="button">
      {(isCloudCategory || isSynced) && <Cloud size={16} className="list-overview-cloud-icon" />}
      <span className="list-overview-name-text">{listName}</span>
      {isCloudCategory && <GameSystemBadge system={gameSystem} />}
      <ChevronDown size={16} />
    </button>
    <div className="list-overview-header-actions">
      {syncButton}
      <button className="list-overview-copy-button" onClick={onCopyToClipboard} type="button">
        <FileText size={18} />
      </button>
    </div>
  </div>
);

// Single list item component (local lists - with delete)
const ListItem = ({ item, onNavigate, onDelete, onEdit, isAoS }) => {
  const isUnconfigured = !item.unitSize;
  const totalCost = isAoS
    ? Number(item.unitSize?.cost) || 0
    : (Number(item.unitSize?.cost) || 0) + (Number(item.selectedEnhancement?.cost) || 0);

  return (
    <div className="list-overview-item">
      <div className="list-overview-item-main" onClick={() => onNavigate(item)}>
        <div className="list-overview-item-name">
          {item.isWarlord && <Crown size={14} fill="currentColor" />}
          <span>{item.name}</span>
        </div>
        {!isAoS && item.selectedEnhancement && (
          <div className="list-overview-item-enhancement">{capitalizeSentence(item.selectedEnhancement.name)}</div>
        )}
      </div>
      {isUnconfigured ? (
        <button className="list-overview-item-configure" onClick={() => onEdit(item)} type="button">
          Set
        </button>
      ) : (
        <div className="list-overview-item-points">
          {!isAoS && item.unitSize?.models > 1 ? `${item.unitSize.models}x ` : ""}
          {totalCost} pts
        </div>
      )}
      <button className="list-overview-item-delete" onClick={() => onDelete(item.uuid)}>
        <Trash2 size={18} />
      </button>
    </div>
  );
};

// Cloud category item (read-only - no delete button)
const CloudListItem = ({ card, onNavigate }) => (
  <div className="list-overview-item list-overview-item--cloud">
    <div className="list-overview-item-main" onClick={() => onNavigate(card)}>
      <div className="list-overview-item-name">
        <span>{card.name}</span>
      </div>
    </div>
    <ChevronRight size={18} className="list-overview-item-arrow" />
  </div>
);

// Section renderer component
const ListSection = ({ sectionKey, label, cards, onNavigate, onDelete, onEdit, isAoS }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <>
      <div className="list-overview-section">{label}</div>
      {sortCards(cards).map((item) => (
        <ListItem
          key={item.uuid}
          item={item}
          onNavigate={onNavigate}
          onDelete={onDelete}
          onEdit={onEdit}
          isAoS={isAoS}
        />
      ))}
    </>
  );
};

export const ListOverview = ({ isVisible, setIsVisible }) => {
  const { lists, selectedList, removeDatacard, selectedCloudCategoryId } = useMobileList();
  const { dataSource } = useDataSourceStorage();
  const { settings } = useSettingsStorage();
  const { categories: cloudCategories } = useCloudCategories();
  const navigate = useNavigate();
  const [isListSelectorVisible, setIsListSelectorVisible] = useState(false);
  const [isImporterVisible, setIsImporterVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Derive selected cloud category from the realtime-updated list
  const selectedCloudCategory = selectedCloudCategoryId
    ? cloudCategories.find((c) => c.uuid === selectedCloudCategoryId)
    : null;

  // Check if viewing a cloud category
  const isCloudCategory = !!selectedCloudCategory;

  // Detect game system
  const isAoS = settings.selectedDataSource === "aos";
  const is40k = settings.selectedDataSource === "40k-10e";

  // Get current list data (local or cloud)
  const currentList = lists[selectedList];
  const currentListName = isCloudCategory ? selectedCloudCategory.name : currentList?.name || "List";
  const currentCards = isCloudCategory ? selectedCloudCategory.cards : currentList?.cards || [];

  // Get appropriate sections and categorization (only for local lists)
  const sections = isAoS ? SECTIONS_AOS : SECTIONS_40K;
  const sortedCards =
    !isCloudCategory && currentCards.length > 0
      ? isAoS
        ? categorizeAoSUnits(currentCards)
        : categorize40kUnits(currentCards)
      : {};

  const handleClose = () => setIsVisible(false);

  // Navigate to a card (handles both local list items and cloud category cards)
  const handleNavigate = (item) => {
    // Both local list items and cloud category cards are flat — item IS the card
    const card = item;
    const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

    if (!cardFaction) {
      // For cloud cards without faction match, just navigate with the card data
      if (isCloudCategory && card?.name) {
        // Use the cloud card's source to determine the base URL pattern
        const factionName = card.faction_id || "unknown";
        navigate(
          `/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}/${card.name.replaceAll(" ", "-").toLowerCase()}`,
          {
            state: { cloudCard: card },
          },
        );
        handleClose();
      }
      return;
    }

    // Pass the stored card data through router state
    navigate(
      `/mobile/${cardFaction.name.toLowerCase().replaceAll(" ", "-")}/${card.name.replaceAll(" ", "-").toLowerCase()}`,
      {
        state: { listCard: card },
      },
    );
    handleClose();
  };

  const handleCopyToClipboard = () => {
    if (isCloudCategory) {
      // For cloud categories, just list the card names
      const cardNames = currentCards.map((card) => card.name).join("\n");
      navigator.clipboard.writeText(cardNames);
      message.success("Card names copied to clipboard");
    } else {
      const listText = isAoS ? formatAoSListText(sortedCards, sections) : format40kListText(sortedCards, sections);
      navigator.clipboard.writeText(listText);
      message.success("List copied to clipboard");
    }
  };

  // Calculate total points (only for local lists)
  const totalPoints = isCloudCategory
    ? 0
    : currentCards.reduce((acc, val) => {
        let cost = acc + Number(val.unitSize?.cost || 0);
        if (!isAoS && val.selectedEnhancement) {
          cost = cost + Number(val.selectedEnhancement.cost || 0);
        }
        return cost;
      }, 0);

  const isEmpty = currentCards.length === 0;

  return (
    <>
      <BottomSheet isOpen={isVisible} onClose={handleClose} maxHeight="70vh">
        <div className="list-overview-top-section">
          {/* Only show import for 40k local lists */}
          {is40k && !isCloudCategory && (
            <>
              <ImportActionButton onClick={() => setIsImporterVisible(true)} />
              <div className="list-overview-divider" />
            </>
          )}
          <h2 className="list-overview-title">{isCloudCategory ? "Cloud Category" : "Lists"}</h2>
          <ListHeader
            listName={currentListName}
            onListSelectorClick={() => setIsListSelectorVisible(true)}
            onCopyToClipboard={handleCopyToClipboard}
            isCloudCategory={isCloudCategory}
            isSynced={!isCloudCategory && !!currentList?.syncEnabled}
            gameSystem={isCloudCategory ? selectedCloudCategory.gameSystem : null}
            syncButton={!isCloudCategory && currentList ? <ListSyncButton category={currentList} /> : null}
          />
        </div>

        {isEmpty ? (
          <div className="list-overview-empty">
            {isCloudCategory ? <Cloud size={48} /> : <List size={48} />}
            <span className="list-overview-empty-text">
              {isCloudCategory ? "This category has no cards" : "Your list is empty"}
            </span>
          </div>
        ) : isCloudCategory ? (
          /* Cloud category cards - simple flat list, read-only */
          <div className="list-overview-items list-overview-items--cloud">
            {currentCards.map((card, index) => (
              <CloudListItem key={card.uuid || card.id || index} card={card} onNavigate={handleNavigate} />
            ))}
            <div className="list-overview-cloud-footer">
              <span className="list-overview-cloud-count">{currentCards.length} cards</span>
            </div>
          </div>
        ) : (
          /* Local list cards - categorized with delete buttons */
          <div className="list-overview-items">
            {sections.map((section) => (
              <ListSection
                key={section.key}
                sectionKey={section.key}
                label={section.label}
                cards={sortedCards[section.key]}
                onNavigate={handleNavigate}
                onDelete={removeDatacard}
                onEdit={setEditingCard}
                isAoS={isAoS}
              />
            ))}

            <div className="list-overview-total">
              <span className="list-overview-total-label">Total</span>
              <span className="list-overview-total-value">{totalPoints} pts</span>
            </div>
          </div>
        )}
      </BottomSheet>

      <ListSelector isVisible={isListSelectorVisible} setIsVisible={setIsListSelectorVisible} />

      <MobileGwImporter isOpen={isImporterVisible} onClose={() => setIsImporterVisible(false)} />

      <ListEditCard
        isVisible={!!editingCard}
        setIsVisible={(v) => {
          if (!v) setEditingCard(null);
        }}
        card={editingCard}
      />
    </>
  );
};
