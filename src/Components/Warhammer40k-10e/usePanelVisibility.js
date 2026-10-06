import { useState } from "react";

export function usePanelVisibility(activeCard, updateActiveCard) {
  const [activeKeys, setActiveKeys] = useState(["1"]);

  const collapseIfHiding = (panelKey, value) => {
    if (!value) {
      setActiveKeys((prev) => prev.filter((k) => k !== panelKey));
    }
  };

  const handleWeaponVisibilityChange = (type, panelKey, value, e) => {
    e.stopPropagation();
    collapseIfHiding(panelKey, value);
    updateActiveCard({
      ...activeCard,
      showWeapons: {
        ...activeCard.showWeapons,
        [type]: value,
      },
    });
  };

  const handleAbilityVisibilityChange = (type, panelKey, value, e) => {
    e.stopPropagation();
    collapseIfHiding(panelKey, value);
    updateActiveCard({
      ...activeCard,
      showAbilities: {
        ...activeCard.showAbilities,
        [type]: value,
      },
    });
  };

  const handleDamagedVisibilityChange = (panelKey, value, e) => {
    e.stopPropagation();
    collapseIfHiding(panelKey, value);
    updateActiveCard({
      ...activeCard,
      abilities: {
        ...activeCard.abilities,
        damaged: { ...activeCard.abilities.damaged, showDamagedAbility: value },
      },
    });
  };

  const handleInvulVisibilityChange = (panelKey, value, e) => {
    e.stopPropagation();
    collapseIfHiding(panelKey, value);
    updateActiveCard({
      ...activeCard,
      abilities: {
        ...activeCard.abilities,
        invul: { ...activeCard.abilities.invul, showInvulnerableSave: value },
      },
    });
  };

  const handleSimpleVisibilityChange = (field, panelKey, value, e) => {
    e.stopPropagation();
    collapseIfHiding(panelKey, value);
    updateActiveCard({
      ...activeCard,
      [field]: value,
    });
  };

  return {
    activeKeys,
    setActiveKeys,
    handleWeaponVisibilityChange,
    handleAbilityVisibilityChange,
    handleDamagedVisibilityChange,
    handleInvulVisibilityChange,
    handleSimpleVisibilityChange,
  };
}
