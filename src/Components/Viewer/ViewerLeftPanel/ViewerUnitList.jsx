import { ChevronDown, ChevronRight } from "lucide-react";
import { List } from "antd";
import classNames from "classnames";
import { useDataSourceType } from "../../../Helpers/cardstorage.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useViewerNavigation } from "../../../Hooks/useViewerNavigation";

export const ViewerUnitList = ({ searchText, selectedContentType }) => {
  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { activeCard, setActiveCard } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const { navigateToUnit, navigateToStratagem, navigateToAlliedUnit } = useViewerNavigation();

  // Build unit list based on content type
  let unitList = [];

  if (selectedContentType === "datasheets") {
    unitList = useDataSourceType(searchText);
  }

  if (selectedContentType === "stratagems" && selectedFaction) {
    const filteredStratagems = selectedFaction?.stratagems?.filter((stratagem) => {
      return !settings?.ignoredSubFactions?.includes(stratagem.subfaction_id);
    });

    const mainStratagems = searchText
      ? filteredStratagems?.filter((stratagem) => stratagem.name.toLowerCase().includes(searchText.toLowerCase()))
      : filteredStratagems;

    const basicStratagems = searchText
      ? selectedFaction.basicStratagems?.filter((stratagem) =>
          stratagem.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : selectedFaction.basicStratagems;

    unitList = [
      { type: "header", name: "Basic stratagems" },
      ...(basicStratagems || []).map((s) => ({ ...s, faction_id: selectedFaction.id })),
      { type: "header", name: "Faction stratagems" },
      ...(mainStratagems || []),
    ];
  }

  if (selectedContentType === "rules" && selectedFaction) {
    const armyRules = selectedFaction?.rules?.army || [];
    const detachmentRules = selectedFaction?.rules?.detachment || [];

    // Filter army rules by search
    const filteredArmyRules = searchText
      ? armyRules.filter((rule) => rule.name.toLowerCase().includes(searchText.toLowerCase()))
      : armyRules;

    // Filter detachment rules by search
    const filteredDetachmentRules = searchText
      ? detachmentRules.filter((rule) => rule.name?.toLowerCase().includes(searchText.toLowerCase()))
      : detachmentRules;

    // Transform rules into card-compatible objects
    const armyRuleCards = filteredArmyRules.map((rule) => ({
      ...rule,
      id: `army-rule-${rule.name}`,
      cardType: "rule",
      ruleType: "army",
      faction_id: selectedFaction.id,
    }));

    // Flatten detachment rules - each detachment can have multiple rules
    const detachmentRuleCards = filteredDetachmentRules.flatMap((detachmentRule) => {
      if (detachmentRule.rules && Array.isArray(detachmentRule.rules)) {
        return detachmentRule.rules.map((rule) => ({
          ...rule,
          id: `detachment-rule-${detachmentRule.detachment}-${rule.name}`,
          cardType: "rule",
          ruleType: "detachment",
          detachment: detachmentRule.detachment,
          faction_id: selectedFaction.id,
        }));
      }
      return [];
    });

    unitList = [
      ...(armyRuleCards.length > 0 ? [{ type: "header", name: "Army Rules" }] : []),
      ...armyRuleCards,
      ...(detachmentRuleCards.length > 0 ? [{ type: "header", name: "Detachment Rules" }] : []),
      ...detachmentRuleCards,
    ];
  }

  const handleCategoryClick = (card) => {
    let newClosedFactions = [...(settings?.mobile?.closedFactions || [])];
    if (newClosedFactions.includes(card.id)) {
      newClosedFactions.splice(newClosedFactions.indexOf(card.id), 1);
    } else {
      newClosedFactions.push(card.id);
    }
    updateSettings({
      ...settings,
      mobile: { ...settings.mobile, closedFactions: newClosedFactions },
    });
  };

  const handleRoleClick = (card) => {
    let newClosedRoles = [...(settings?.mobile?.closedRoles || [])];
    if (newClosedRoles.includes(card.name)) {
      newClosedRoles.splice(newClosedRoles.indexOf(card.name), 1);
    } else {
      newClosedRoles.push(card.name);
    }
    updateSettings({
      ...settings,
      mobile: { ...settings.mobile, closedRoles: newClosedRoles },
    });
  };

  const handleCardClick = (card) => {
    const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

    if (card.cardType === "stratagem") {
      navigateToStratagem(cardFaction.name, card.name);
    } else if (card.cardType === "rule") {
      // Rules don't need URL navigation, just set the active card
      setActiveCard(card);
      return;
    } else {
      if (!card.nonBase) {
        navigateToUnit(cardFaction.name, card.name);
      } else {
        navigateToAlliedUnit(selectedFaction.name, cardFaction.name, card.name);
      }
    }

    setActiveCard(card);
  };

  const renderItem = (card, index) => {
    // Header item
    if (card.type === "header") {
      return (
        <List.Item key={`list-header-${index}`} className="list-header">
          {card.name}
        </List.Item>
      );
    }

    // Category item (faction grouping)
    if (card.type === "category") {
      if (!settings?.groupByFaction) return null;

      const isClosed = settings?.mobile?.closedFactions?.includes(card.id);
      return (
        <List.Item key={`list-category-${index}`} className="list-category" onClick={() => handleCategoryClick(card)}>
          <span className="icon">{isClosed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}</span>
          <span className="name">{card.name}</span>
        </List.Item>
      );
    }

    // Allied faction item
    if (card.type === "allied") {
      const isClosed = settings?.mobile?.closedFactions?.includes(card.id);
      return (
        <List.Item key={`list-allied-${index}`} className="list-category" onClick={() => handleCategoryClick(card)}>
          <span className="icon">{isClosed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}</span>
          <span className="name">{card.name}</span>
        </List.Item>
      );
    }

    // Role item
    if (card.type === "role") {
      const isClosed = settings?.mobile?.closedRoles?.includes(card.name);
      return (
        <List.Item key={`list-role-${index}`} className="list-category" onClick={() => handleRoleClick(card)}>
          <span className="icon">{isClosed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}</span>
          <span className="name">{card.name}</span>
        </List.Item>
      );
    }

    // Check if item should be hidden due to collapsed section
    if (settings?.mobile?.closedFactions?.includes(card.faction_id) && card.allied) {
      return null;
    }
    if (settings?.mobile?.closedRoles?.includes(card.role)) {
      return null;
    }

    // Regular card item
    return (
      <List.Item
        key={`list-${card.id}`}
        onClick={() => handleCardClick(card)}
        className={classNames({
          "list-item": true,
          selected: activeCard && !activeCard.isCustom && activeCard.id === card.id,
          legends: card.legends,
        })}>
        <div
          style={{ display: "flex", width: "100%", marginRight: "48px", justifyContent: "space-between" }}
          className={card.nonBase ? card.faction_id : ""}>
          <span>{card.name}</span>
        </div>
      </List.Item>
    );
  };

  return (
    <List
      bordered
      size="small"
      dataSource={unitList}
      style={{ flex: 1, overflowY: "auto" }}
      locale={{
        emptyText: selectedFaction ? "No datasheets found" : "No faction selected",
      }}
      renderItem={renderItem}
    />
  );
};
