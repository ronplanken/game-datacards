import { Crown, Trash2, FileText, List } from "lucide-react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useMobileList } from "../useMobileList";
import { capitalizeSentence } from "../../../Helpers/external.helpers";
import { BottomSheet } from "../Mobile/BottomSheet";
import "./ListOverview.css";

// Header actions component
const HeaderActions = ({ onCopyToClipboard }) => (
  <div className="list-overview-header">
    <button className="list-overview-header-button" onClick={onCopyToClipboard}>
      <FileText size={18} />
    </button>
  </div>
);

// Single list item component
const ListItem = ({ item, onNavigate, onDelete }) => {
  const totalCost = Number(item.points?.cost) + (Number(item.enhancement?.cost) || 0);

  return (
    <div className="list-overview-item">
      <div className="list-overview-item-main" onClick={() => onNavigate(item)}>
        <div className="list-overview-item-name">
          {item.warlord && <Crown size={14} fill="currentColor" />}
          <span>{item.card.name}</span>
        </div>
        {item.enhancement && (
          <div className="list-overview-item-enhancement">{capitalizeSentence(item.enhancement.name)}</div>
        )}
      </div>
      <div className="list-overview-item-points">
        {item.points?.models > 1 ? `${item.points.models}x ` : ""}
        {totalCost} pts
      </div>
      <button className="list-overview-item-delete" onClick={() => onDelete(item.id)}>
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export const ListOverview = ({ isVisible, setIsVisible }) => {
  const { lists, selectedList, removeDatacard } = useMobileList();
  const { dataSource } = useDataSourceStorage();
  const navigate = useNavigate();

  const sortedCards = lists[selectedList].datacards?.reduce(
    (exportCards, card) => {
      if (card?.card?.keywords?.includes("Character")) {
        exportCards.characters.push(card);
        return exportCards;
      }
      if (card?.card?.keywords?.includes("Battleline")) {
        exportCards.battleline.push(card);
        return exportCards;
      }
      exportCards.other.push(card);
      return exportCards;
    },
    { characters: [], battleline: [], other: [], allied: [] }
  );

  const handleClose = () => setIsVisible(false);

  const handleNavigate = (item) => {
    const cardFaction = dataSource.data.find((faction) => faction.id === item.card?.faction_id);
    navigate(
      `/mobile/${cardFaction.name.toLowerCase().replaceAll(" ", "-")}/${item.card.name
        .replaceAll(" ", "-")
        .toLowerCase()}`
    );
    handleClose();
  };

  const handleCopyToClipboard = () => {
    let listText = "Warhammer 40K List";

    const addSection = (sectionName, cards) => {
      if (cards.length === 0) return;
      listText += `\n\n${sectionName}`;
      cards.forEach((val) => {
        listText += `\n\n${val.card.name} ${val.points?.models > 1 ? val.points?.models + "x" : ""} (${
          Number(val?.points?.cost) + (Number(val.enhancement?.cost) || 0) || "?"
        } pts)`;
        if (val.warlord) {
          listText += `\n   • Warlord`;
        }
        if (val.enhancement) {
          listText += `\n   • Enhancements: ${capitalizeSentence(val.enhancement?.name)} (+${
            val.enhancement?.cost
          } pts)`;
        }
      });
    };

    addSection("CHARACTERS", sortedCards.characters);
    addSection("BATTLELINE", sortedCards.battleline);
    addSection("OTHER", sortedCards.other);

    listText += "\n\nCreated with https://game-datacards.eu";
    navigator.clipboard.writeText(listText);
    message.success("List copied to clipboard.");
  };

  const sortCards = (cards) =>
    cards.toSorted((a, b) => {
      if (a.warlord) return -1;
      if (b.warlord) return 1;
      return a.card.name.localeCompare(b.card.name);
    });

  const totalPoints = lists[selectedList].datacards.reduce((acc, val) => {
    let cost = acc + Number(val.points.cost);
    if (val.enhancement) {
      cost = cost + Number(val.enhancement.cost);
    }
    return cost;
  }, 0);

  const isEmpty = lists[selectedList].datacards.length === 0;

  const headerContent = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <span>{lists[selectedList].name}</span>
      {!isEmpty && <HeaderActions onCopyToClipboard={handleCopyToClipboard} />}
    </div>
  );

  return (
    <BottomSheet isOpen={isVisible} onClose={handleClose} title={headerContent} maxHeight="70vh">
      {isEmpty ? (
        <div className="list-overview-empty">
          <List size={48} />
          <span className="list-overview-empty-text">Your list is currently empty</span>
        </div>
      ) : (
        <div className="list-overview-items">
          {sortedCards.characters.length > 0 && (
            <>
              <div className="list-overview-section">Characters</div>
              {sortCards(sortedCards.characters).map((item) => (
                <ListItem key={item.id} item={item} onNavigate={handleNavigate} onDelete={removeDatacard} />
              ))}
            </>
          )}

          {sortedCards.battleline.length > 0 && (
            <>
              <div className="list-overview-section">Battleline</div>
              {sortCards(sortedCards.battleline).map((item) => (
                <ListItem key={item.id} item={item} onNavigate={handleNavigate} onDelete={removeDatacard} />
              ))}
            </>
          )}

          {sortedCards.other.length > 0 && (
            <>
              <div className="list-overview-section">Other</div>
              {sortCards(sortedCards.other).map((item) => (
                <ListItem key={item.id} item={item} onNavigate={handleNavigate} onDelete={removeDatacard} />
              ))}
            </>
          )}

          <div className="list-overview-total">
            <span className="list-overview-total-label">Total</span>
            <span className="list-overview-total-value">{totalPoints} pts</span>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
