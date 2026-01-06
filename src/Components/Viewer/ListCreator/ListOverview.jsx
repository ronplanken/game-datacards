import { useState } from "react";
import { Crown, Trash2, FileText, List, ChevronDown, Upload, ChevronRight } from "lucide-react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
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

// Header with list selector and copy button
const ListHeader = ({ listName, onListSelectorClick, onCopyToClipboard }) => (
  <div className="list-overview-list-header">
    <button className="list-overview-name-selector" onClick={onListSelectorClick} type="button">
      <span className="list-overview-name-text">{listName}</span>
      <ChevronDown size={16} />
    </button>
    <button className="list-overview-copy-button" onClick={onCopyToClipboard} type="button">
      <FileText size={18} />
    </button>
  </div>
);

// Single list item component
const ListItem = ({ item, onNavigate, onDelete, isAoS }) => {
  const totalCost = isAoS
    ? Number(item.points?.cost) || 0
    : Number(item.points?.cost) + (Number(item.enhancement?.cost) || 0);

  return (
    <div className="list-overview-item">
      <div className="list-overview-item-main" onClick={() => onNavigate(item)}>
        <div className="list-overview-item-name">
          {item.warlord && <Crown size={14} fill="currentColor" />}
          <span>{item.card.name}</span>
        </div>
        {!isAoS && item.enhancement && (
          <div className="list-overview-item-enhancement">{capitalizeSentence(item.enhancement.name)}</div>
        )}
      </div>
      <div className="list-overview-item-points">
        {!isAoS && item.points?.models > 1 ? `${item.points.models}x ` : ""}
        {totalCost} pts
      </div>
      <button className="list-overview-item-delete" onClick={() => onDelete(item.id)}>
        <Trash2 size={18} />
      </button>
    </div>
  );
};

// Section renderer component
const ListSection = ({ sectionKey, label, cards, onNavigate, onDelete, isAoS }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <>
      <div className="list-overview-section">{label}</div>
      {sortCards(cards).map((item) => (
        <ListItem key={item.id} item={item} onNavigate={onNavigate} onDelete={onDelete} isAoS={isAoS} />
      ))}
    </>
  );
};

export const ListOverview = ({ isVisible, setIsVisible }) => {
  const { lists, selectedList, removeDatacard } = useMobileList();
  const { dataSource } = useDataSourceStorage();
  const { settings } = useSettingsStorage();
  const navigate = useNavigate();
  const [isListSelectorVisible, setIsListSelectorVisible] = useState(false);
  const [isImporterVisible, setIsImporterVisible] = useState(false);

  // Detect game system
  const isAoS = settings.selectedDataSource === "aos";
  const is40k = settings.selectedDataSource === "40k-10e";

  // Get appropriate sections and categorization
  const sections = isAoS ? SECTIONS_AOS : SECTIONS_40K;
  const sortedCards = isAoS
    ? categorizeAoSUnits(lists[selectedList].datacards)
    : categorize40kUnits(lists[selectedList].datacards);

  const handleClose = () => setIsVisible(false);

  const handleNavigate = (item) => {
    const cardFaction = dataSource.data.find((faction) => faction.id === item.card?.faction_id);
    // Pass the stored card data through router state so we use the filtered version
    navigate(
      `/mobile/${cardFaction.name.toLowerCase().replaceAll(" ", "-")}/${item.card.name
        .replaceAll(" ", "-")
        .toLowerCase()}`,
      { state: { listCard: item.card } }
    );
    handleClose();
  };

  const handleCopyToClipboard = () => {
    const listText = isAoS ? formatAoSListText(sortedCards, sections) : format40kListText(sortedCards, sections);

    navigator.clipboard.writeText(listText);
    message.success("List copied to clipboard.");
  };

  const totalPoints = lists[selectedList].datacards.reduce((acc, val) => {
    let cost = acc + Number(val.points.cost);
    if (!isAoS && val.enhancement) {
      cost = cost + Number(val.enhancement.cost);
    }
    return cost;
  }, 0);

  const isEmpty = lists[selectedList].datacards.length === 0;

  return (
    <>
      <BottomSheet isOpen={isVisible} onClose={handleClose} maxHeight="70vh">
        <div className="list-overview-top-section">
          {is40k && (
            <>
              <ImportActionButton onClick={() => setIsImporterVisible(true)} />
              <div className="list-overview-divider" />
            </>
          )}
          <h2 className="list-overview-title">Lists</h2>
          <ListHeader
            listName={lists[selectedList].name}
            onListSelectorClick={() => setIsListSelectorVisible(true)}
            onCopyToClipboard={handleCopyToClipboard}
          />
        </div>

        {isEmpty ? (
          <div className="list-overview-empty">
            <List size={48} />
            <span className="list-overview-empty-text">Your list is currently empty</span>
          </div>
        ) : (
          <div className="list-overview-items">
            {sections.map((section) => (
              <ListSection
                key={section.key}
                sectionKey={section.key}
                label={section.label}
                cards={sortedCards[section.key]}
                onNavigate={handleNavigate}
                onDelete={removeDatacard}
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
    </>
  );
};
