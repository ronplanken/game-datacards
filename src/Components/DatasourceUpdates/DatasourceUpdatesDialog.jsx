import React from "react";
import { message } from "../Toast/message";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useUmami } from "../../Hooks/useUmami";
import { applyCardUpdates } from "../../Helpers/cardUpdates.helpers";
import { getArmyContext, getListFactionId } from "../../Helpers/listRoster.helpers";
import { DatasourceUpdatesModal } from "./DatasourceUpdatesModal";
import { MobileDatasourceUpdatesSheet } from "./MobileDatasourceUpdatesSheet";

export const DatasourceUpdatesDialog = ({ category, cards, title, onClose, variant = "desktop" }) => {
  const { cardStorage, replaceCategoryCards } = useCardStorage();
  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { settings } = useSettingsStorage();
  const { trackEvent } = useUmami();

  const handleApply = (results, uuids) => {
    onClose();
    const current = cardStorage.categories.find((cat) => cat.uuid === category?.uuid);
    if (!current) return;

    const faction = dataSource?.data?.find((f) => f.id === (getListFactionId(current) || selectedFaction?.id));
    const { cards: nextCards, updatedUuids } = applyCardUpdates(
      current.cards,
      results,
      uuids,
      getArmyContext(current, faction),
    );
    if (updatedUuids.length === 0) return;

    const previousCards = current.cards.filter((card) => updatedUuids.includes(card.uuid));
    replaceCategoryCards(
      current.uuid,
      nextCards.filter((card) => updatedUuids.includes(card.uuid)),
    );

    trackEvent("datasource-card-update", { count: updatedUuids.length });
    message.success({
      content:
        updatedUuids.length === 1
          ? "Updated 1 card from the datasource."
          : `Updated ${updatedUuids.length} cards from the datasource.`,
      duration: 8,
      action: {
        label: "Undo",
        onClick: () => {
          replaceCategoryCards(current.uuid, previousCards);
          trackEvent("datasource-card-update-undo", { count: previousCards.length });
          message.info(previousCards.length === 1 ? "Restored 1 card." : `Restored ${previousCards.length} cards.`);
        },
      },
    });
  };

  const Dialog = variant === "mobile" ? MobileDatasourceUpdatesSheet : DatasourceUpdatesModal;

  return (
    <Dialog
      isOpen
      title={title}
      cards={cards}
      dataSource={dataSource}
      selectedDataSource={settings.selectedDataSource}
      language={settings.language}
      onClose={onClose}
      onApply={handleApply}
    />
  );
};
