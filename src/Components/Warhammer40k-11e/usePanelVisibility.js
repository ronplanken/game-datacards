import { useState } from "react";

// 11th edition panel visibility. Mirrors the 10e hook but keeps every visibility
// flag at the top level of the card (showWeapons, showAbilities, and the simple
// show* booleans). Unlike 10e, the damaged ability and invulnerable save flags
// are top-level (showDamaged / showInvul) instead of nested inside `abilities`,
// so the multi-language `abilities` object keeps the exact shape the loader
// produces.
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
    handleSimpleVisibilityChange,
  };
}
